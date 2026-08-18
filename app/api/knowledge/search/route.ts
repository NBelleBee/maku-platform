import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/authenticated-user'
import { createServiceSupabase } from '@/lib/supabase-service'

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
    }

    const { businessId, query } = (body || {}) as Record<string, unknown>

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

    const supabase = createServiceSupabase()

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!business) {
      return NextResponse.json({ error: 'Business not found or access denied.' }, { status: 403 })
    }

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
    console.error('KNOWLEDGE SEARCH ERROR:', error)
    return NextResponse.json({ error: 'Knowledge search failed. Please try again.' }, { status: 500 })
  }
}