import { NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerSupabase()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    )
  }

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('name')

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }

  return new Response(
    JSON.stringify({ businesses: data }),
    { status: 200 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      industry,
      website,
      email,
      phone,
      booking_url,
      opening_hours,
      brand_voice,
    } = body

    if (!name || !industry) {
      return new Response(
        JSON.stringify({
          error: 'Name and industry are required',
        }),
        { status: 400 }
      )
    }

    const supabase = createServerSupabase()

    /*
     * Get the authenticated MAKU user from the server-side
     * Supabase session.
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Authentication required',
        }),
        { status: 401 }
      )
    }

    /*
     * The owner_id comes from Supabase Auth.
     *
     * It MUST NOT come from the browser request.
     */
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: name.trim(),
        industry: industry.trim(),
        website: website?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        booking_url: booking_url?.trim() || null,
        opening_hours: opening_hours || null,
        brand_voice: brand_voice?.trim() || null,
        owner_id: user.id,
      })
      .select('*')
      .single()

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        business: data,
      }),
      { status: 201 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Invalid request',
      }),
      { status: 400 }
    )
  }
  }
}
