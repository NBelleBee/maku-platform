import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MAX_REQUEST_SIZE = 2_000
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0)

    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: 'Request is too large.' }, { status: 413 })
    }

    const rawBody = await request.text()

    if (rawBody.length > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: 'Request is too large.' }, { status: 413 })
    }

    let body: unknown

    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 }
      )
    }

    const assistantId =
      body && typeof body === 'object' && typeof (body as Record<string, unknown>).assistantId === 'string'
        ? (body as Record<string, string>).assistantId.trim()
        : ''

    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required.' },
        { status: 400 }
      )
    }

    if (!UUID_PATTERN.test(assistantId)) {
      return NextResponse.json(
        { error: 'Assistant ID is invalid.' },
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
