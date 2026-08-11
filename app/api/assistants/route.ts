'use server'

import { createServerSupabase } from '@/lib/supabaseServer'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types'
import type { NextRequest } from 'next/server'

export async function GET() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase.from('assistants').select('*')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ assistants: data }), { status: 200 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { business_id, name, welcome_message, system_instructions, is_active } = body

  if (!business_id || !name) {
    return new Response(JSON.stringify({ error: 'Business and name are required' }), { status: 400 })
  }

  const supabase = createServerSupabase()
  const insertPayload = {
    name,
    welcome_message: welcome_message ?? null,
    system_instructions: system_instructions ?? null,
    is_active: is_active ?? true,
  } satisfies Database['public']['Tables']['assistants']['Insert']
  const { data, error } = await supabase
    .from('assistants')
    .insert(insertPayload)
