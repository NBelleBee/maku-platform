import { createServerSupabase } from '@/lib/supabase-server'
import type { Database } from '@/lib/types'
import type { NextRequest } from 'next/server'

export async function GET() {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('assistants')
    .select('*')

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  return new Response(
    JSON.stringify({ assistants: data }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      business_id,
      name,
      welcome_message,
      system_instructions,
      is_active,
    } = body

    if (!business_id || !name) {
      return new Response(
        JSON.stringify({
          error: 'Business and name are required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const supabase = createServerSupabase()

    const insertPayload = {
      business_id,
      name,
      welcome_message: welcome_message ?? null,
      system_instructions: system_instructions ?? null,
      is_active: is_active ?? true,
    } satisfies Database['public']['Tables']['assistants']['Insert']

    const { data, error } = await supabase
      .from('assistants')
      .insert(insertPayload)
      .select()
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
            : 'Something went wrong',
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
