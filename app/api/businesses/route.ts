'use server'

import { createServiceSupabase } from '@/lib/supabase-service'
import { getAuthenticatedUser } from '@/lib/authenticated-user'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401 })
  }

  const supabase = createServiceSupabase()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)

  if (error) {
    console.error('BUSINESSES GET ERROR:', error)
    return new Response(JSON.stringify({ error: 'Unable to load businesses.' }), { status: 500 })
  }

  return new Response(JSON.stringify({ businesses: data }), { status: 200 })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401 })
  }

  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Request body must be valid JSON.' }), { status: 400 })
  }

  const { name, industry, website, email, phone, booking_url, opening_hours, brand_voice } = body

  if (typeof name !== 'string' || typeof industry !== 'string' || !name.trim() || !industry.trim()) {
    return new Response(JSON.stringify({ error: 'Name and industry are required' }), { status: 400 })
  }

  const supabase = createServiceSupabase()
  const { data, error } = await supabase.from('businesses').insert({
    name: name.trim(),
    industry: industry.trim(),
    website: website ?? null,
    email: email ?? null,
    phone: phone ?? null,
    booking_url: booking_url ?? null,
    opening_hours: opening_hours ?? null,
    brand_voice: brand_voice ?? null,
    owner_id: user.id,
  })

  if (error) {
    console.error('BUSINESS CREATE ERROR:', error)
    return new Response(JSON.stringify({ error: 'Unable to create business.' }), { status: 500 })
  }

  return new Response(JSON.stringify({ business: data?.[0] ?? null }), { status: 201 })
}
