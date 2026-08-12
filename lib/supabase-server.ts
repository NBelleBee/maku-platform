```tsx
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './types'

export const createServerSupabase = () => {
  return createServerComponentSupabaseClient<Database>({
    cookies,
  })
}
```
