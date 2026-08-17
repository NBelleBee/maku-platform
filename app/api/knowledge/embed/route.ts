import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

type ExtractedService = {
  name: string
  description: string | null
  price: number | null
  duration: string | null
}

function normaliseServiceName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function POST(request: Request) {
  try {
    const { knowledgeId } = await request.json()

    if (!knowledgeId) {
      return NextResponse.json(
        { error: 'knowledgeId is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!supabaseUrl || !serviceRoleKey || !openaiApiKey) {
      return NextResponse.json(
        { error: 'Server configuration is incomplete.' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data: knowledge, error: knowledgeError } = await supabase
      .from('knowledge')
      .select('id, business_id, title, content')
      .eq('id', knowledgeId)
      .single()

    if (knowledgeError || !knowledge) {
      return NextResponse.json(
        {
          error:
            knowledgeError?.message ||
            'Knowledge not found',
        },
        { status: 404 }
      )
    }

    const content = knowledge.content || ''

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'Knowledge content is empty' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    })

    /*
     * ---------------------------------------------------------
     * 1. CREATE KNOWLEDGE EMBEDDINGS
     * ---------------------------------------------------------
     */

    const chunks = content
      .split(/\n\s*\n/)
      .map((chunk: string) => chunk.trim())
      .filter(Boolean)

    await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('knowledge_id', knowledgeId)

    for (let i = 0; i < chunks.length; i++) {
      const embeddingResponse =
        await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunks[i],
        })

      const { error: chunkError } = await supabase
        .from('knowledge_chunks')
        .insert({
          knowledge_id: knowledgeId,
          business_id: knowledge.business_id,
          content: chunks[i],
          metadata: {
            title: knowledge.title,
            source: 'MAKU Knowledge Base',
            chunk_index: i,
          },
          embedding:
            embeddingResponse.data[0].embedding,
        })

      if (chunkError) {
        console.error(
          'KNOWLEDGE CHUNK ERROR:',
          chunkError
        )

        return NextResponse.json(
          {
            error:
              'Knowledge was partially processed but a knowledge chunk could not be saved.',
          },
          { status: 500 }
        )
      }
    }

    /*
     * ---------------------------------------------------------
     * 2. EXTRACT STRUCTURED SERVICES
     * ---------------------------------------------------------
     */

    const extractionResponse =
      await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: {
          type: 'json_object',
        },
        messages: [
          {
            role: 'system',
            content: `
You are MAKU Technologies' business information extraction engine.

Your task is to extract REAL services from a client's business knowledge base.

Return ONLY valid JSON in this exact structure:

{
  "services": [
    {
      "name": "Service name",
      "description": "Description or null",
      "price": 50,
      "duration": "60 minutes"
    }
  ]
}

Rules:

1. Only extract services explicitly supported by the knowledge base.
2. NEVER invent services.
3. NEVER invent prices.
4. NEVER invent durations.
5. If a price is not provided, use null.
6. If a duration is not provided, use null.
7. Price must be a number without the £ symbol.
8. Keep the service name clear and concise.
9. Preserve meaningful service variations as separate services.
10. Do not extract products as services.
11. Do not extract policies as services.
12. Do not extract FAQs as services.
13. Do not extract opening hours as services.
14. Do not create duplicate services.
15. If no services can be confidently identified, return:
{
  "services": []
}

The knowledge base is the source of truth.
`,
          },
          {
            role: 'user',
            content: `
CLIENT BUSINESS KNOWLEDGE

Business ID:
${knowledge.business_id}

Knowledge Base:
${knowledge.title}

CONTENT:
${content}
`,
          },
        ],
      })

    const rawExtraction =
      extractionResponse.choices[0]?.message?.content

    if (!rawExtraction) {
      return NextResponse.json(
        {
          error:
            'Knowledge embeddings were created, but service extraction returned no result.',
        },
        { status: 500 }
      )
    }

    let extractedServices: ExtractedService[] = []

    try {
      const parsed = JSON.parse(rawExtraction)

      if (!Array.isArray(parsed.services)) {
        throw new Error(
          'Invalid service extraction format.'
        )
      }

      extractedServices = parsed.services
        .map((service: ExtractedService) => ({
          name:
            typeof service.name === 'string'
              ? service.name.trim()
              : '',
          description:
            typeof service.description === 'string' &&
            service.description.trim()
              ? service.description.trim()
              : null,
          price:
            typeof service.price === 'number' &&
            Number.isFinite(service.price)
              ? service.price
              : null,
          duration:
            typeof service.duration === 'string' &&
            service.duration.trim()
              ? service.duration.trim()
              : null,
        }))
        .filter((service: ExtractedService) => service.name.length > 0)
    } catch (parseError) {
      console.error(
        'SERVICE EXTRACTION PARSE ERROR:',
        parseError
      )

      return NextResponse.json(
        {
          error:
            'Knowledge embeddings were created, but the extracted service data could not be read.',
        },
        { status: 500 }
      )
    }

    /*
     * ---------------------------------------------------------
     * 3. LOAD EXISTING SERVICES
     * ---------------------------------------------------------
     */

    const {
      data: existingServices,
      error: existingServicesError,
    } = await supabase
      .from('services')
      .select(
        'id, business_id, name, description, price, duration'
      )
      .eq('business_id', knowledge.business_id)

    if (existingServicesError) {
      console.error(
        'EXISTING SERVICES ERROR:',
        existingServicesError
      )

      return NextResponse.json(
        {
          error:
            'Knowledge was processed, but existing services could not be loaded.',
        },
        { status: 500 }
      )
    }

    /*
     * ---------------------------------------------------------
     * 4. MATCH AND UPDATE / INSERT SERVICES
     * ---------------------------------------------------------
     */

    const existingByName = new Map<
      string,
      {
        id: string
        name: string
      }
    >()

    for (const service of existingServices || []) {
      existingByName.set(
        normaliseServiceName(service.name),
        {
          id: service.id,
          name: service.name,
        }
      )
    }

    const extractedNames = new Set<string>()
    let createdServices = 0
    let updatedServices = 0

    for (const service of extractedServices) {
      const normalisedName =
        normaliseServiceName(service.name)

      if (extractedNames.has(normalisedName)) {
        continue
      }

      extractedNames.add(normalisedName)

      const existing =
        existingByName.get(normalisedName)

      if (existing) {
        const { error: updateError } =
          await supabase
            .from('services')
            .update({
              name: service.name,
              description: service.description,
              price: service.price,
              duration: service.duration,
            })
            .eq('id', existing.id)
            .eq(
              'business_id',
              knowledge.business_id
            )

        if (updateError) {
          console.error(
            'SERVICE UPDATE ERROR:',
            updateError
          )

          return NextResponse.json(
            {
              error:
                `Unable to update service "${service.name}".`,
            },
            { status: 500 }
          )
        }

        updatedServices++
      } else {
        const { error: insertError } =
          await supabase
            .from('services')
            .insert({
              business_id:
                knowledge.business_id,
              name: service.name,
              description: service.description,
              price: service.price,
              duration: service.duration,
            })

        if (insertError) {
          console.error(
            'SERVICE INSERT ERROR:',
            insertError
          )

          return NextResponse.json(
            {
              error:
                `Unable to create service "${service.name}".`,
            },
            { status: 500 }
          )
        }

        createdServices++
      }
    }

    /*
     * ---------------------------------------------------------
     * 5. REMOVE OLD AUTOMATIC SERVICES
     * ---------------------------------------------------------
     *
     * Only perform deletion when the extraction actually
     * discovered at least one service.
     *
     * This prevents an extraction failure or an empty result
     * from wiping an entire client's service list.
     * ---------------------------------------------------------
     */

    let removedServices = 0

    if (extractedServices.length > 0) {
      for (const existing of existingServices || []) {
        const existingName =
          normaliseServiceName(existing.name)

        if (!extractedNames.has(existingName)) {
          const { error: deleteError } =
            await supabase
              .from('services')
              .delete()
              .eq('id', existing.id)
              .eq(
                'business_id',
                knowledge.business_id
              )

          if (deleteError) {
            console.error(
              'SERVICE DELETE ERROR:',
              deleteError
            )

            return NextResponse.json(
              {
                error:
                  `Unable to remove outdated service "${existing.name}".`,
              },
              { status: 500 }
            )
          }

          removedServices++
        }
      }
    }

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
      services: {
        extracted: extractedServices.length,
        created: createdServices,
        updated: updatedServices,
        removed: removedServices,
      },
    })
  } catch (error) {
    console.error(
      'KNOWLEDGE PROCESSING ERROR:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Knowledge processing failed',
      },
      { status: 500 }
    )
  }
}
