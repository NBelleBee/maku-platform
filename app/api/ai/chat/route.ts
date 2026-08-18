import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { assistantId, message } = await request.json()

    if (!assistantId || !message) {
      return new Response(
        JSON.stringify({ error: 'assistantId and message are required' }),
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: assistant, error: assistantError } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', assistantId)
      .single()

    if (assistantError || !assistant) {
      return new Response(
        JSON.stringify({ error: 'Assistant not found' }),
        { status: 404 }
      )
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', assistant.business_id)
      .single()

    if (businessError || !business) {
      return new Response(
        JSON.stringify({ error: 'Business not found' }),
        { status: 404 }
      )
    }

    const [knowledge, services, faqs, policies] = await Promise.all([
      supabase
        .from('knowledge')
        .select('title, content')
        .eq('business_id', business.id),

      supabase
        .from('services')
        .select('name, description, price, duration')
        .eq('business_id', business.id),

      supabase
        .from('faqs')
        .select('question, answer')
        .eq('business_id', business.id),

      supabase
        .from('policies')
        .select('title, content')
        .eq('business_id', business.id),
    ])

    const context = `
BUSINESS:
${JSON.stringify(business)}

ASSISTANT:
${assistant.name}

INSTRUCTIONS:
${assistant.system_instructions}

CONVERSATION RULES:
Use the information below as your private source of truth. Do not copy database records, descriptions or JSON into your reply. Answer naturally and conversationally, as a helpful human receptionist. Keep replies concise and focused on the customer's question. Use short paragraphs or bullets only when helpful. Ask a natural follow-up question when appropriate. Never invent information or prices.

KNOWLEDGE:
${JSON.stringify(knowledge.data ?? [])}

SERVICES:
${JSON.stringify(services.data ?? [])}

FAQS:
${JSON.stringify(faqs.data ?? [])}

POLICIES:
${JSON.stringify(policies.data ?? [])}
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: context,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI error:', errorText)

      return new Response(
        JSON.stringify({ error: 'The assistant is temporarily unavailable. Please try again later.' }),
        { status: 503 }
      )
    }

    const result = await response.json()

    const reply =
      result.choices?.[0]?.message?.content ||
      'I’m sorry, I wasn’t able to generate a response.'

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)

    return new Response(
      JSON.stringify({
        error: 'The assistant is temporarily unavailable. Please try again later.',
      }),
      { status: 500 }
    )
  }
}

