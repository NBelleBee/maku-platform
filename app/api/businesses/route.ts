'use server'

import { createServerSupabase } from '@/lib/supabase-server'
import type { NextRequest } from 'next/server'

export async function GET() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase.from('businesses').select('*')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ businesses: data }), { status: 200 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, industry, website, email, phone, booking_url, opening_hours, brand_voice } = body

  if (!name || !industry) {
    return new Response(JSON.stringify({ error: 'Name and industry are required' }), { status: 400 })
  }

  const supabase = createServerSupabase()
  const { data, error } = await supabase.from('businesses').insert({
    name,
    industry,
    website: website ?? null,
    email: email ?? null,
    phone: phone ?? null,
    booking_url: booking_url ?? null,
    opening_hours: opening_hours ?? null,
    brand_voice: brand_voice ?? null,
    owner_id: null,
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ business: data?.[0] ?? null }), { status: 201 })
}
