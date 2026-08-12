```tsx
import Link from 'next/link'
import { Sidebar } from '@/components/navigation/Sidebar'
import type { Database } from '@/lib/types'

type Business = Database['public']['Tables']['businesses']['Row']

export const dynamic = 'force-dynamic'

export default async function BusinessesPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be configured')
  }

  const restUrl =
    `${supabaseUrl.replace(/\/$/, '')}` +
    `/rest/v1/businesses?select=id,name,industry,website,email`

  const res = await fetch(restUrl, {
    method: 'GET',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `Supabase REST request failed: ${res.status} ${text}`
    )
  }

  const businessesData: Business[] = await res.json()

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container grid gap-8 py-12 lg:grid-cols-[288px_1fr]">
        <Sidebar />

        <section className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Businesses
                </p>

                <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                  Manage businesses
                </h1>
              </div>

              <Link
                href="/dashboard/businesses/new"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create business
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
            {businessesData.length === 0 ? (
              <div className="py-12 text-center">
                <h2 className="text-lg font-semibold text-slate-950">
                  No businesses found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Your businesses are stored in Supabase but are not currently
                  being returned to the dashboard.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-4 text-slate-500">Name</th>
                      <th className="px-4 py-4 text-slate-500">Industry</th>
                      <th className="px-4 py-4 text-slate-500">Website</th>
                      <th className="px-4 py-4 text-slate-500">Email</th>
                      <th className="px-4 py-4 text-slate-500">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {businessesData.map((business) => (
                      <tr key={business.id}>
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {business.name}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {business.industry ?? '—'}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {business.website ?? '—'}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {business.email ?? '—'}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          <Link
                            href={`/dashboard/businesses/${business.id}`}
                            className="text-slate-950 underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
```
