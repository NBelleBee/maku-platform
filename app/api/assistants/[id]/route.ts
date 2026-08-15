import { createServerSupabase } from '@/lib/supabase-server'

type RouteContext = {
  params: {
    id: string
  }
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const supabase = await createServerSupabase()

    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Authentication required.',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const {
      data: assistant,
      error: assistantError,
    } = await supabase
      .from('assistants')
      .select(
        'id, name, welcome_message, system_instructions, is_active, business_id'
      )
      .eq('id', params.id)
      .single()

    if (assistantError || !assistant) {
      return new Response(
        JSON.stringify({
          error: 'Business Assistant not found.',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from('businesses')
      .select('id, name, owner_id')
      .eq('id', assistant.business_id)
      .single()

    if (businessError || !business) {
      return new Response(
        JSON.stringify({
          error: 'Business connected to this assistant was not found.',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    if (business.owner_id !== user.id) {
      return new Response(
        JSON.stringify({
          error: 'You do not have access to this Business Assistant.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return new Response(
      JSON.stringify({
        assistant,
        business: {
          id: business.id,
          name: business.name,
        },
      }),
      {
        status: 200,
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
            : 'Could not load the Business Assistant.',
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
