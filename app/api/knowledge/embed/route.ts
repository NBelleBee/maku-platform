import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { knowledgeId } = await request.json()

    if (!knowledgeId) {
      return NextResponse.json(
        { error: 'knowledgeId is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: knowledge, error: knowledgeError } = await supabase
      .from('knowledge')
      .select('id, business_id, title, content')
      .eq('id', knowledgeId)
      .single()

    if (knowledgeError || !knowledge) {
      return NextResponse.json(
        { error: knowledgeError?.message || 'Knowledge not found' },
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
      apiKey: process.env.OPENAI_API_KEY,
    })

    const chunks = content
      .split(/\n\s*\n/)
      .map((chunk: string) => chunk.trim())
      .filter(Boolean)

    await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('knowledge_id', knowledgeId)

    for (let i = 0; i < chunks.length; i++) {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks[i],
      })

      await supabase.from('knowledge_chunks').insert({
        knowledge_id: knowledgeId,
        business_id: knowledge.business_id,
        content: chunks[i],
        metadata: {
          title: knowledge.title,
          source: 'MAKU Knowledge Base',
          chunk_index: i,
        },
        embedding: embeddingResponse.data[0].embedding,
      })
    }

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Embedding failed',
      },
      { status: 500 }
    )
  }
}
