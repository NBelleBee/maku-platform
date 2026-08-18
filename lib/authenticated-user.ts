import { createClient } from '@supabase/supabase-js'

export async function getAuthenticatedUser(request: Request) {
  const token = request.headers
    .get('authorization')
    ?.match(/^Bearer\s+(.+)$/i)?.[1]
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!token || !supabaseUrl || !anonKey) {
    return null
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data } = await userClient.auth.getUser(token)

  return data.user || null
}