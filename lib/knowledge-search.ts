import { createClient } from '@supabase/supabase-js'

const EMBEDDING_MODEL = 'text-embedding-3-small'

type KnowledgeMatch = {
  id: string
  business_id: string
  knowledge_id: string
  content: string
  chunk_index: number
  metadata: Record<string, unknown>
  similarity: number
}

async function createEmbedding(text: string) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.')
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

  const embedding =
    result.data?.[0]?.embedding

  if (!Array.isArray(embedding)) {
    throw new Error(
      'OpenAI did not return a valid embedding.'
    )
  }

  if (embedding.length !== 1536) {
    throw new Error(
      `Expected 1536 dimensions but received ${embedding.length}.`
    )
  }

  return embedding
}

export async function searchBusinessKnowledge(
  businessId: string,
  query: string,
  matchCount = 5
): Promise<KnowledgeMatch[]> {
  if (!businessId) {
    throw new Error(
      'businessId is required.'
    )
  }

  const cleanQuery = query.trim()

  if (!cleanQuery) {
    return []
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not configured.'
    )
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured.'
    )
  }

  const embedding =
    await createEmbedding(cleanQuery)

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey
  )

  const safeMatchCount = Math.min(
    Math.max(matchCount, 1),
    20
  )

  const {
    data,
    error,
  } = await supabase.rpc(
    'match_knowledge_chunks',
    {
      query_embedding: embedding,
      match_business_id: businessId,
      match_count: safeMatchCount,
    }
  )

  if (error) {
    throw new Error(
      `Knowledge search failed: ${error.message}`
    )
  }

  return (data ?? []) as KnowledgeMatch[]
}
