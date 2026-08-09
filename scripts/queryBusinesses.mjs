import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const main = async () => {
  const { data, error } = await supabase.from('businesses').select('id, name, industry, website, email')
  if (error) {
    console.error('Error from supabase:', error.message)
    process.exit(2)
  }
  console.log('Rows:', JSON.stringify(data, null, 2))
}

main()
