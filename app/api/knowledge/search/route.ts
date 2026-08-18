import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { businessId, query } = await request.json()

    if (!businessId || !query) {
      return NextResponse.json(
        { error: 'businessId and query are required' },
        { status: 400 }
      )
    }

    if (
      typeof businessId !== 'string' ||
      typeof query !== 'string' ||
      query.length > 500
    ) {
      return NextResponse.json(
        { error: 'businessId and query are invalid.' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('content, metadata')
      .eq('business_id', businessId)
      .limit(10)

    if (error) {
      return NextResponse.json(
        { error: 'Knowledge search is temporarily unavailable.' },
        { status: 500 }
      )
    }

    const words = query.toLowerCase().split(/\s+/)

    const results = (data || [])
      .map((item) => {
        const text = item.content.toLowerCase()

        const score = words.filter((word: string) =>
          text.includes(word)
        ).length

        return {
          ...item,
          score,
        }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Knowledge search failed. Please try again.',
      },
      { status: 500 }
    )
  }
}