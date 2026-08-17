import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const MAX_QUERY_LENGTH = 500
const MAX_RESULTS = 10

function text(value: unknown, limit: number) {
  return typeof value === 'string'
    ? value.trim().slice(0, limit)
    : ''
}

function scoreText(query: string, content: string) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1)

  const text = content.toLowerCase()

  return words.reduce((score, word) => {
    return score + (text.includes(word) ? 1 : 0)
  }, 0)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const assistantId = text(body?.assistantId, 200)
    const query = text(body?.query, MAX_QUERY_LENGTH)

    if (!assistantId || !query) {
      return NextResponse.json(
        {
          error: 'assistantId and query are required.',
        },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('KNOWLEDGE AGENT CONFIGURATION ERROR')

      return NextResponse.json(
        {
          error: 'Knowledge Agent is temporarily unavailable.',
        },
        { status: 503 }
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

    const { data: assistant, error: assistantError } = await supabase
      .from('assistants')
      .select('id, business_id, name, is_active')
      .eq('id', assistantId)
      .maybeSingle()

    if (assistantError) {
      console.error(
        'KNOWLEDGE AGENT ASSISTANT ERROR:',
        assistantError
      )

      return NextResponse.json(
        {
          error: 'Unable to load Business Assistant.',
        },
        { status: 500 }
      )
    }

    if (!assistant) {
      return NextResponse.json(
        {
          error: 'Business Assistant not found.',
        },
        { status: 404 }
      )
    }

    if (!assistant.is_active) {
      return NextResponse.json(
        {
          error: 'This Business Assistant is currently inactive.',
        },
        { status: 403 }
      )
    }

    const businessId = assistant.business_id

    const [
      knowledgeResult,
      chunksResult,
      servicesResult,
      faqsResult,
      policiesResult,
    ] = await Promise.all([
      supabase
        .from('knowledge')
        .select('title, content')
        .eq('business_id', businessId)
        .limit(50),

      supabase
        .from('knowledge_chunks')
        .select('content, metadata')
        .eq('business_id', businessId)
        .limit(100),

      supabase
        .from('services')
        .select('name, description, price, duration')
        .eq('business_id', businessId)
        .limit(100),

      supabase
        .from('faqs')
        .select('question, answer')
        .eq('business_id', businessId)
        .limit(100),

      supabase
        .from('policies')
        .select('title, content')
        .eq('business_id', businessId)
        .limit(50),
    ])

    const errors = [
      knowledgeResult.error,
      chunksResult.error,
      servicesResult.error,
      faqsResult.error,
      policiesResult.error,
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error(
        'KNOWLEDGE AGENT RESOURCE ERRORS:',
        errors
      )
    }

    const results: Array<{
      type: string
      title?: string
      content: string
      score: number
      metadata?: unknown
    }> = []

    for (const item of knowledgeResult.data || []) {
      const title = text(item.title, 500)
      const content = text(item.content, 5_000)

      const combined = `${title} ${content}`
      const score = scoreText(query, combined)

      if (score > 0) {
        results.push({
          type: 'knowledge',
          title,
          content,
          score,
        })
      }
    }

    for (const item of chunksResult.data || []) {
      const content = text(item.content, 5_000)
      const score = scoreText(query, content)

      if (score > 0) {
        results.push({
          type: 'knowledge_chunk',
          content,
          score,
          metadata: item.metadata,
        })
      }
    }

    for (const item of servicesResult.data || []) {
      const details = [
        text(item.description, 1_000),
        item.price !== null && item.price !== undefined
          ? `Price: ${item.price}`
          : '',
        item.duration
          ? `Duration: ${text(item.duration, 200)}`
          : '',
      ].filter(Boolean)

      const content = `${text(item.name, 500)}${
        details.length
          ? ` - ${details.join(' | ')}`
          : ''
      }`

      const score = scoreText(query, content)

      if (score > 0) {
        results.push({
          type: 'service',
          title: text(item.name, 500),
          content,
          score,
        })
      }
    }

    for (const item of faqsResult.data || []) {
      const question = text(item.question, 1_000)
      const answer = text(item.answer, 2_000)
      const content = `Q: ${question}\nA: ${answer}`

      const score = scoreText(query, content)

      if (score > 0) {
        results.push({
          type: 'faq',
          title: question,
          content,
          score,
        })
      }
    }

    for (const item of policiesResult.data || []) {
      const title = text(item.title, 500)
      const content = text(item.content, 3_000)
      const combined = `${title}: ${content}`

      const score = scoreText(query, combined)

      if (score > 0) {
        results.push({
          type: 'policy',
          title,
          content: combined,
          score,
        })
      }
    }

    results.sort((a, b) => b.score - a.score)

    return NextResponse.json({
      assistantId: assistant.id,
      assistantName: assistant.name,
      businessId,
      query,
      results: results.slice(0, MAX_RESULTS),
    })
  } catch (error) {
    console.error('KNOWLEDGE AGENT ERROR:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Knowledge search failed.',
      },
      { status: 500 }
    )
  }
}

