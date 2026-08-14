import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'

const EMBEDDING_MODEL = 'text-embedding-3-small'

type KnowledgeRecord = {
  id: string
  business_id: string
  title: string
  content: string
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

  const chunkSize = 1200
  const overlap = 200

  if (cleanedText.length <= chunkSize) {
    return [cleanedText]
  }

  const chunks: string[] = []
  let start = 0

  while (start < cleanedText.length) {
    let end = Math.min(
      start + chunkSize,
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
      end - overlap,
      start + 1
    )
  }

  return chunks
}

async function createEmbedding(text: string) {
  const response = await fetch(
    'https://api.openai.com/v1/embeddings',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
     * Authenticate the MAKU user using the browser session.
     */
    const serverSupabase =
      await createServerSupabase()

    const {
      data: { user },
      error: userError,
    } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Authentication required.',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const body = await request.json()

    const businessId = body.businessId

    if (!businessId) {
      return new Response(
        JSON.stringify({
          error: 'businessId is required.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            'OPENAI_API_KEY is not configured.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    /*
     * Verify business ownership.
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
      return new Response(
        JSON.stringify({
          error: 'Business not found.',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    if (business.owner_id !== user.id) {
      return new Response(
        JSON.stringify({
          error:
            'You do not have access to this business.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    /*
     * Service-role client is used only after ownership
     * has been verified.
     */
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    /*
     * Get the original knowledge records.
     */
    const {
      data: knowledge,
      error: knowledgeError,
    } = await adminSupabase
      .from('knowledge')
      .select(
        'id, business_id, title, content'
      )
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at')

    if (knowledgeError) {
      return new Response(
        JSON.stringify({
          error: knowledgeError.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    if (!knowledge || knowledge.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            'No active knowledge was found for this business.',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    /*
     * Remove existing chunks for these knowledge records.
     * This makes the process safe to repeat.
     */
    const knowledgeIds = knowledge.map(
      (item) => item.id
    )

    const { error: deleteError } =
      await adminSupabase
        .from('knowledge_chunks')
        .delete()
        .in('knowledge_id', knowledgeIds)

    if (deleteError) {
      return new Response(
        JSON.stringify({
          error:
            `Could not prepare knowledge chunks: ${deleteError.message}`,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const rows: Array<{
      business_id: string
      knowledge_id: string
      content: string
      embedding: number[]
      chunk_index: number
      metadata: Record<string, unknown>
      is_active: boolean
    }> = []

    let totalChunks = 0

    /*
     * Create chunks and embeddings.
     */
    for (
      const item of knowledge as KnowledgeRecord[]
    ) {
      const chunks = chunkText(item.content)

      for (
        let index = 0;
        index < chunks.length;
        index++
      ) {
        const chunk = chunks[index]

        const embedding =
          await createEmbedding(chunk)

        rows.push({
          business_id: item.business_id,
          knowledge_id: item.id,
          content: chunk,
          embedding,
          chunk_index: index,
          metadata: {
            title: item.title,
            source: 'knowledge',
            embedding_model: EMBEDDING_MODEL,
          },
          is_active: true,
        })

        totalChunks++
      }
    }

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            'No usable knowledge chunks could be created.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    /*
     * Save the embedded chunks.
     */
    const { error: insertError } =
      await adminSupabase
        .from('knowledge_chunks')
        .insert(rows)

    if (insertError) {
      return new Response(
        JSON.stringify({
          error:
            `Could not save knowledge embeddings: ${insertError.message}`,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        businessId: business.id,
        businessName: business.name,
        knowledgeSources: knowledge.length,
        chunksCreated: totalChunks,
        embeddingModel: EMBEDDING_MODEL,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error(
      'Knowledge embedding error:',
      error
    )

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

