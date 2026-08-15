import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const CHAT_MODEL = 'gpt-4o-mini'

type AssistantRecord = {
  id: string
  name: string
  welcome_message: string | null
  system_instructions: string | null
  is_active: boolean
  business_id: string
}

type KnowledgeMatch = {
  id: string
  business_id: string
  knowledge_id: string
  content: string
  chunk_index: number
  metadata: Record<string, unknown> | null
  similarity: number
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
      `Expected a 1536-dimensional embedding but received ${embedding.length}.`
    )
  }

  return embedding
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json()

    const assistantId = body.assistantId
    const message = body.message

    if (!assistantId) {
      return new Response(
        JSON.stringify({
          error: 'assistantId is required.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    if (
      !message ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return new Response(
        JSON.stringify({
          error: 'message is required.',
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
          error: 'OPENAI_API_KEY is not configured.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const serverSupabase =
      await createServerSupabase()

    const {
      data: assistant,
      error: assistantError,
    } = await serverSupabase
      .from('assistants')
      .select(
        'id, name, welcome_message, system_instructions, is_active, business_id'
      )
      .eq('id', assistantId)
      .single()

    if (assistantError || !assistant) {
      return new Response(
        JSON.stringify({
          error: 'Business Assistant not found.',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const assistantRecord =
      assistant as AssistantRecord

    if (!assistantRecord.is_active) {
      return new Response(
        JSON.stringify({
          error: 'This Business Assistant is inactive.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const embedding =
      await createEmbedding(message.trim())

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error:
            'SUPABASE_SERVICE_ROLE_KEY is not configured.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const {
      data: matches,
      error: matchError,
    } = await adminSupabase.rpc(
      'match_knowledge_chunks',
      {
        query_embedding: embedding,
        match_business_id:
          assistantRecord.business_id,
        match_count: 5,
      }
    )

    if (matchError) {
      return new Response(
        JSON.stringify({
          error:
            `Knowledge search failed: ${matchError.message}`,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const knowledgeMatches =
      (matches ?? []) as KnowledgeMatch[]

    const knowledgeContext =
      knowledgeMatches.length > 0
        ? knowledgeMatches
            .map(
              (match, index) =>
                `Knowledge section ${index + 1}:\n${match.content}`
            )
            .join('\n\n')
        : 'No relevant business knowledge was found.'

    const systemInstructions =
      assistantRecord.system_instructions?.trim() ||
      'You are a helpful Business Assistant. Answer accurately using the available business knowledge.'

    const systemPrompt = `
You are ${assistantRecord.name}, a Business Assistant managed by MAKU Technologies.

Your role is to help customers with enquiries about the business.

IMPORTANT RULES:

1. Use the business knowledge provided below as your primary source of truth.
2. Do not invent prices, services, policies, opening hours, booking information, or other business details.
3. If the information is not available in the knowledge provided, say that you do not have that information rather than guessing.
4. Be clear, professional, friendly and concise.
5. Do not claim that an appointment has been booked unless the system explicitly confirms a booking.
6. Do not claim to have taken an action that you have not actually taken.
7. If a customer asks for information that requires the business to confirm something, explain that the business will need to confirm it.

ASSISTANT INSTRUCTIONS:

${systemInstructions}

BUSINESS KNOWLEDGE:

${knowledgeContext}
`.trim()

    const chatResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: message.trim(),
            },
          ],
        }),
      }
    )

    if (!chatResponse.ok) {
      const errorText =
        await chatResponse.text()

      throw new Error(
        `OpenAI chat error: ${errorText}`
      )
    }

    const chatResult =
      await chatResponse.json()

    const reply =
      chatResult.choices?.[0]?.message?.content

    if (
      !reply ||
      typeof reply !== 'string'
    ) {
      throw new Error(
        'OpenAI did not return a valid assistant response.'
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        assistant: {
          id: assistantRecord.id,
          name: assistantRecord.name,
          welcome_message:
            assistantRecord.welcome_message,
        },
        reply,
        sources: knowledgeMatches.map(
          (match) => ({
            id: match.id,
            knowledge_id:
              match.knowledge_id,
            similarity:
              match.similarity,
          })
        ),
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
      'MAKU chat error:',
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
