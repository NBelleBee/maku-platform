import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const createServerSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Supabase server environment variables are missing.')
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseSecretKey
  )
}
