import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Sidebar } from '@/components/navigation/Sidebar'
import { createServerSupabase } from '@/lib/supabaseServer'
import type { Database } from '@/lib/types'

type Business = Database['public']['Tables']['businesses']['Row']

type BusinessPageProps = {
  params: {
    id: string
  }
}

async function getBusiness(id: string) {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, industry, website, email, phone')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data as Business | null
}

export default async function BusinessDetailPage({ params }: BusinessPageProps) {
  const business = await getBusiness(params.id)

  if (!business) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container grid gap-8 py-12 lg:grid-cols-[288px_1fr]">
        <Sidebar />
        <section className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Business</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">{business.name}</h1>
                <p className="mt-2 text-sm text-slate-600">Business details and navigation for the selected business.</p>
              </div>
              <Link
                href="/dashboard/businesses"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to businesses
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Overview</h2>
                  <div className="mt-6 space-y-4 text-sm text-slate-700">
                    <div className="flex flex-col gap-1 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <span className="text-slate-500">Industry</span>
                      <span className="text-slate-900">{business.industry}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <span className="text-slate-500">Website</span>
                      {business.website ? (
                        <a href={business.website} target="_blank" rel="noreferrer" className="text-slate-950 underline">
                          {business.website}
                        </a>
                      ) : (
                        <span className="text-slate-600">Not provided</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <span className="text-slate-500">Email</span>
                      {business.email ? (
                        <a href={`mailto:${business.email}`} className="text-slate-950 underline">
                          {business.email}
                        </a>
                      ) : (
                        <span className="text-slate-600">Not provided</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <span className="text-slate-500">Phone</span>
                      <span className="text-slate-900">{business.phone ?? 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Business navigation</h2>
                  <div className="mt-6 grid gap-3">
                    <Link
                      href={`/dashboard/assistants?businessId=${business.id}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                    >
                      Assistants
                    </Link>
                    <Link
                      href={`/dashboard/knowledge?businessId=${business.id}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                    >
                      Knowledge
                    </Link>
                    <Link
                      href={`/dashboard/services?businessId=${business.id}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                    >
                      Services
                    </Link>
                    <Link
                      href={`/dashboard/faqs?businessId=${business.id}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                    >
                      FAQs
                    </Link>
                    <Link
                      href={`/dashboard/policies?businessId=${business.id}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                    >
                      Policies
                    </Link>
                    <Link
                      href={`/dashboard/conversations?businessId=${business.id}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                    >
                      Conversations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
