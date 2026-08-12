```tsx id="m7kq1p"
import { createClient } from '@supabase/supabase-js'

export function createServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase configuration is missing. Add NEXT_PUBLIC_SUPABASE_URL and a Supabase key to Vercel Production Environment Variables.'
    )
  }

  return createClient(supabaseUrl, supabaseKey)
}
```
