import { NextResponse } from 'next/server'

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

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration is incomplete.' },
        { status: 500 }
      )
    }

    const url =
      `${supabaseUrl}/rest/v1/assistants` +
      `?select=id,name,welcome_message,is_active` +
      `&id=eq.${encodeURIComponent(assistantId)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: 'no-store',
    })

    const responseText = await response.text()

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to load this Business Assistant.' },
        { status: 500 }
      )
    }

    const assistants = JSON.parse(responseText)
    const assistant = assistants[0] || null

    if (!assistant) {
      return NextResponse.json(
        { error: 'Business Assistant not found.' },
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
    console.error('WIDGET REST ERROR:', error)

    return NextResponse.json(
      { error: 'Unexpected widget error.' },
      { status: 500 }
    )
  }
}
