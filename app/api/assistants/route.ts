import { NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('assistants')
    .select(
      'id, name, welcome_message, system_instructions, is_active, business_id'
    )
    .order('name')

  if (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  return new Response(
    JSON.stringify({
      assistants: data ?? [],
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json()

    const {
      name,
      welcome_message,
      system_instructions,
      business_id,
    } = body

    if (!name || !business_id) {
      return new Response(
        JSON.stringify({
          error:
            'Name and business_id are required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const supabase =
      await createServerSupabase()

    const { data, error } =
      await supabase
        .from('assistants')
        .insert({
          name,
          welcome_message:
            welcome_message ?? null,
          system_instructions:
            system_instructions ?? null,
          business_id,
          is_active: true,
        })
        .select(
          'id, name, welcome_message, system_instructions, is_active, business_id'
        )
        .single()

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return new Response(
      JSON.stringify({
        assistant: data,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}



