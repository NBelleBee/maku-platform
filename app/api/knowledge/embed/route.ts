```tsx
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const CHUNK_SIZE = 1200
const CHUNK_OVERLAP = 200

type KnowledgeRecord = {
  id: string
  business_id: string
  title: string
  content: string
  is_active: boolean
}

function chunkText(text: string): string[] {
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!cleanedText) {
    return []
  }

  if (cleanedText.length <= CHUNK_SIZE) {
    return [cleanedText]
  }

  const chunks: string[] = []
  let start = 0

  while (start < cleanedText.length) {
    let end = Math.min(
      start + CHUNK_SIZE,
      cleanedText.length
    )

    if (end < cleanedText.length) {
      const paragraphBreak =
        cleanedText.lastIndexOf('\n\n', end)

      const sentenceBreak = Math.max(
        cleanedText.lastIndexOf('. ', end),
        cleanedText.lastIndexOf('? ', end),
        cleanedText.lastIndexOf('! ', end)
      )

      if (paragraphBreak > start + 600) {
        end = paragraphBreak
      } else if (sentenceBreak > start + 600) {
        end = sentenceBreak + 1
      }
    }

    const chunk = cleanedText
      .slice(start, end)
      .trim()

    if (chunk) {
      chunks.push(chunk)
    }

    if (end >= cleanedText.length) {
      break
    }

    start = Math.max(
      end - CHUNK_OVERLAP,
      start + 1
    )
  }

  return chunks
}

async function createEmbedding(
  text: string
): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured.'
    )
  }

  const response = await fetch(
    'https://api.openai.com/v1/embeddings',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()

    throw new Error(
      `OpenAI embedding error: ${errorText}`
    )
  }

  const result = await response.json()

  const embedding = result.data?.[0]?.embedding

  if (!Array.isArray(embedding)) {
    throw new Error(
      'OpenAI did not return a valid embedding.'
    )
  }

  if (embedding.length !== 1536) {
    throw new Error(
      `Expected a 1536-dimensional embedding but received ${embedding.length} dimensions.`
    )
  }

  return embedding
}

export async function POST(
  request: NextRequest
) {
  try {
    /*
     * STEP 1
     * Confirm authentication.
     */
    const serverSupabase =
      await createServerSupabase()

    const {
      data: { user },
      error: userError,
    } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return Response.json(
        {
          error: 'Authentication required.',
        },
        { status: 401 }
      )
    }

    /*
     * STEP 2
     * Read the requested business ID.
     */
    const body = await request.json()

    const businessId = body?.businessId

    if (
      typeof businessId !== 'string' ||
      !businessId.trim()
    ) {
      return Response.json(
        {
          error: 'businessId is required.',
        },
        { status: 400 }
      )
    }

    /*
     * STEP 3
     * Check required environment variables.
     */
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY

    const openAiKey =
      process.env.OPENAI_API_KEY

    if (!supabaseUrl) {
      return Response.json(
        {
          error:
            'NEXT_PUBLIC_SUPABASE_URL is not configured.',
        },
        { status: 500 }
      )
    }

    if (!serviceRoleKey) {
      return Response.json(
        {
          error:
            'SUPABASE_SERVICE_ROLE_KEY is not configured.',
        },
        { status: 500 }
      )
    }

    if (!openAiKey) {
      return Response.json(
        {
          error:
            'OPENAI_API_KEY is not configured.',
        },
        { status: 500 }
      )
    }

    /*
     * STEP 4
     * Verify that the authenticated MAKU user
     * owns this business.
     */
    const {
      data: business,
      error: businessError,
    } = await serverSupabase
      .from('businesses')
      .select('id, name, owner_id')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      return Response.json(
        {
          error: 'Business not found.',
        },
        { status: 404 }
      )
    }

    if (business.owner_id !== user.id) {
      return Response.json(
        {
          error:
            'You do not have access to this business.',
        },
        { status: 403 }
      )
    }

    /*
     * STEP 5
     * Create the server-side service-role client.
     *
     * This key must NEVER be exposed to the browser.
     */
    const adminSupabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    /*
     * STEP 6
     * Load active knowledge belonging to this business.
     */
    const {
      data: knowledge,
      error: knowledgeError,
    } = await adminSupabase
      .from('knowledge')
      .select(
        'id, business_id, title, content, is_active'
      )
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at', {
        ascending: true,
      })

    if (knowledgeError) {
      return Response.json(
        {
          error:
            `Could not load knowledge: ${knowledgeError.message}`,
        },
        { status: 500 }
      )
    }

    if (!knowledge || knowledge.length === 0) {
      return Response.json(
        {
          error:
            'No active knowledge was found for this business.',
        },
        { status: 404 }
      )
    }

    /*
     * STEP 7
     * Build all chunks first.
     */
    const chunkRecords: Array<{
      business_id: string
      knowledge_id: string
      content: string
      chunk_index: number
      metadata: Record<string, unknown>
      is_active: boolean
    }> = []

    for (
      const item of knowledge as KnowledgeRecord[]
    ) {
      const chunks = chunkText(item.content)

      for (
        let index = 0;
        index < chunks.length;
        index++
      ) {
        chunkRecords.push({
          business_id: item.business_id,
          knowledge_id: item.id,
          content: chunks[index],
          chunk_index: index,
          metadata: {
            title: item.title,
            source: 'knowledge',
            embedding_model: EMBEDDING_MODEL,
          },
          is_active: true,
        })
      }
    }

    if (chunkRecords.length === 0) {
      return Response.json(
        {
          error:
            'No usable knowledge chunks could be created.',
        },
        { status: 400 }
      )
    }

    /*
     * STEP 8
     * Create embeddings.
     */
    const rows: Array<{
      business_id: string
      knowledge_id: string
      content: string
      embedding: number[]
      chunk_index: number
      metadata: Record<string, unknown>
      is_active: boolean
    }> = []

    for (const item of chunkRecords) {
      const embedding =
        await createEmbedding(item.content)

      rows.push({
        business_id: item.business_id,
        knowledge_id: item.knowledge_id,
        content: item.content,
        embedding,
        chunk_index: item.chunk_index,
        metadata: item.metadata,
        is_active: item.is_active,
      })
    }

    /*
     * STEP 9
     * Remove previous embeddings only after all
     * new embeddings have been successfully created.
     */
    const {
      error: deleteError,
    } = await adminSupabase
      .from('knowledge_chunks')
      .delete()
      .eq('business_id', businessId)

    if (deleteError) {
      return Response.json(
        {
          error:
            `Could not clear existing knowledge chunks: ${deleteError.message}`,
        },
        { status: 500 }
      )
    }

    /*
     * STEP 10
     * Save the new embeddings.
     */
    const {
      error: insertError,
    } = await adminSupabase
      .from('knowledge_chunks')
      .insert(rows)

    if (insertError) {
      return Response.json(
        {
          error:
            `Could not save knowledge embeddings: ${insertError.message}`,
        },
        { status: 500 }
      )
    }

    /*
     * STEP 11
     * Return successful processing information.
     */
    return Response.json(
      {
        success: true,
        businessId: business.id,
        businessName: business.name,
        knowledgeSources: knowledge.length,
        chunksCreated: rows.length,
        embeddingModel: EMBEDDING_MODEL,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      'Knowledge embedding error:',
      error
    )

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      },
      { status: 500 }
    )
  }
}
```
