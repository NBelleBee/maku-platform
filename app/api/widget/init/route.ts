import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const assistantId = String(body?.assistantId || '').trim()

    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
console.log('WIDGET CONFIG CHECK:', {
  supabaseUrl,
  hasServiceRoleKey: Boolean(serviceRoleKey),
})
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration is incomplete.' },
        { status: 500 }
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

    const { data: assistant, error } = await supabase
      .from('assistants')
      .select('id, name, welcome_message, is_active')
      .eq('id', assistantId)
      .maybeSingle()

    if (error) {
      console.error('WIDGET INIT ERROR:', error)

      return NextResponse.json(
        { error: 'Unable to load this Business Assistant.' },
        { status: 500 }
      )
    }

    if (!assistant) {
  return NextResponse.json(
    {
      error: 'Business Assistant not found.',
      debug: {
        assistantId,
        supabaseUrl,
        hasServiceRoleKey: Boolean(serviceRoleKey),
      },
    },
    { status: 404 }
  )
}

    if (!assistant.is_active) {
      return NextResponse.json(
        { error: 'This Business Assistant is currently inactive.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      assistantName: assistant.name,
      welcomeMessage:
        assistant.welcome_message ||
        'Hi! Welcome. How can I help you today?',
    })
  } catch (error) {
    console.error('WIDGET INIT ERROR:', error)

    return NextResponse.json(
      { error: 'Unexpected widget error.' },
      { status: 500 }
    )
  }
}
