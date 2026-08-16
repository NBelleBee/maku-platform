import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('assistants')
      .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ assistants: data })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const business_id = body.business_id
    const name = body.name
    const welcome_message = body.welcome_message
    const system_instructions = body.system_instructions
    const is_active = body.is_active

    if (!business_id || !name) {
      return NextResponse.json(
        { error: 'Business and name are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('assistants')
      .insert({
        business_id: business_id,
        name: name,
        welcome_message: welcome_message || null,
        system_instructions: system_instructions || null,
        is_active: is_active === undefined ? true : is_active,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
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
