import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-service'
import { getAuthenticatedUser } from '@/lib/authenticated-user'

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const supabase = createServiceSupabase()

  const { data, error } = await supabase
    .from('assistants')
    .select('*, businesses!inner(owner_id)')
    .eq('businesses.owner_id', user.id)

  if (error) {
    console.error('ASSISTANTS GET ERROR:', error)
    return NextResponse.json({ error: 'Unable to load assistants.' }, { status: 500 })
  }

  return NextResponse.json({ assistants: data })
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = await request.json()

    const business_id = body.business_id
    const name = body.name
    const welcome_message = body.welcome_message
    const system_instructions = body.system_instructions
    const is_active = body.is_active

    if (typeof business_id !== 'string' || typeof name !== 'string' || !business_id.trim() || !name.trim()) {
      return NextResponse.json(
        { error: 'Business and name are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceSupabase()
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!business) {
      return NextResponse.json({ error: 'Business not found or access denied.' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('assistants')
      .insert({
        business_id: business_id,
        name: name.trim(),
        welcome_message: welcome_message || null,
        system_instructions: system_instructions || null,
        is_active: is_active === undefined ? true : is_active,
        owner_id: user.id,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Unable to create assistant.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { assistant: data },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create assistant' },
      { status: 500 }
    )
  }
}
