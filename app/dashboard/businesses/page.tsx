import Link from 'next/link'
import { Sidebar } from '@/components/navigation/Sidebar'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Database } from '@/lib/types'

type Business = Database['public']['Tables']['businesses']['Row']

export const dynamic = 'force-dynamic'

export default async function BusinessesPage() {
  const supabase = createServerSupabase()

  const {
    data: businessesData,
    error,
  } = await supabase
    .from('businesses')
    .select('id, name, industry, website, email')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Unable to load businesses: ${error.message}`)
  }

  const businesses: Business[] = businessesData ?? []

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
            {businesses.length === 0 ? (
              <div className="py-12 text-center">
                <h2 className="text-lg font-semibold text-slate-950">
                  No businesses found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  No businesses are currently available for your account.
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
                    {businesses.map((business) => (
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
