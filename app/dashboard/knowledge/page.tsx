'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
  industry: string
}

type Knowledge = {
  id: string
  business_id: string
  title: string
  created_at: string
  is_active: boolean | null
}

export default function KnowledgePage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [knowledge, setKnowledge] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      const { data: businessesData } = await supabase
        .from('businesses')
        .select('id, name, industry')
        .order('name')

      const { data: knowledgeData } = await supabase
        .from('knowledge')
        .select('id, business_id, title, created_at, is_active')
        .order('created_at', { ascending: false })

      setBusinesses(businessesData || [])
      setKnowledge(knowledgeData || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const getBusinessName = (businessId: string) => {
    return (
      businesses.find((business) => business.id === businessId)?.name ||
      'Unknown business'
    )
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC] text-[#111827]">
      <div className="container grid gap-8 py-12 lg:grid-cols-[288px_1fr]">

        <aside>
          <div className="sticky top-8">
            <div className="mb-6">
              <Link
                href="/dashboard"
                className="text-sm text-[#6B7280] hover:text-[#111827]"
              >
                ← Dashboard
              </Link>
            </div>

            <div className="rounded-3xl border border-[#FFB3DF] bg-white p-5">
              <p className="text-sm font-semibold text-[#111827]">
                MAKU Technologies
              </p>

              <p className="mt-1 text-xs text-[#6B7280]">
                Knowledge Management
              </p>

              <nav className="mt-5 space-y-2">
                <Link
                  href="/dashboard/businesses"
                  className="block rounded-xl px-3 py-2 text-sm text-[#6B7280] hover:bg-[#FFF7FC]"
                >
                  Client Businesses
                </Link>

                <Link
                  href="/dashboard/assistants"
                  className="block rounded-xl px-3 py-2 text-sm text-[#6B7280] hover:bg-[#FFF7FC]"
                >
                  Business Assistants
                </Link>

                <Link
                  href="/dashboard/knowledge"
                  className="block rounded-xl bg-[#FFE6F4] px-3 py-2 text-sm font-medium text-[#111827]"
                >
                  Knowledge Base
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        <section className="space-y-8">

          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Knowledge Base
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#111827]">
                Client Knowledge
              </h1>

              <p className="mt-3 max-w-2xl text-[#6B7280]">
                Manage the business information used by each MAKU Business
                Assistant.
              </p>
            </div>

            <Link
              href="/dashboard/knowledge/new"
              className="shrink-0 rounded-2xl bg-[#FC72C2] px-5 py-3 text-sm font-medium text-white"
            >
              Add Knowledge
            </Link>
          </div>

          <div className="rounded-3xl border border-[#FFB3DF] bg-white p-8 shadow-sm">

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#111827]">
                Business Knowledge
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Each client can have one or more knowledge sources containing
                their complete business information.
              </p>
            </div>

            {loading ? (
              <p className="text-sm text-[#6B7280]">
                Loading knowledge...
              </p>
            ) : knowledge.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#FFB3DF] bg-[#FFF7FC] p-10 text-center">

                <h3 className="text-lg font-semibold text-[#111827]">
                  No knowledge bases yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280]">
                  Add your first client's complete business knowledge base.
                  You can include services, pricing, policies, FAQs,
                  opening hours and other important information.
                </p>

                <Link
                  href="/dashboard/knowledge/new"
                  className="mt-6 inline-block rounded-xl bg-[#FC72C2] px-5 py-3 text-sm font-medium text-white"
                >
                  Create Knowledge Base
                </Link>

              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#FFB3DF]">

                <div className="grid grid-cols-[1fr_1fr_120px_120px] gap-4 border-b border-[#FFB3DF] bg-[#FFF7FC] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  <span>Knowledge Base</span>
                  <span>Business</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {knowledge.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_1fr_120px_120px] gap-4 border-b border-slate-100 px-5 py-5 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-[#111827]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Created{' '}
                        {new Date(item.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    <div className="text-sm text-[#6B7280]">
                      {getBusinessName(item.business_id)}
                    </div>

                    <div>
                      <span
                        className={
                          item.is_active
                            ? 'rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700'
                            : 'rounded-full bg-[#FFE6F4] px-3 py-1 text-xs font-medium text-[#6B7280]'
                        }
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div>
                      <Link
                        href={`/dashboard/knowledge/${item.id}`}
                        className="text-sm font-medium text-[#111827] underline"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>

          <div className="rounded-3xl border border-[#FFB3DF] bg-white p-8">
            <h2 className="text-xl font-semibold text-[#111827]">
              How MAKU Knowledge Works
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl bg-[#FFF7FC] p-5">
                <p className="font-semibold text-[#111827]">
                  1. Add knowledge
                </p>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Add the client's complete business information in one
                  knowledge base.
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFF7FC] p-5">
                <p className="font-semibold text-[#111827]">
                  2. Process knowledge
                </p>
                <p className="mt-2 text-sm text-[#6B7280]">
                  MAKU converts the information into searchable knowledge
                  chunks.
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFF7FC] p-5">
                <p className="font-semibold text-[#111827]">
                  3. Assistant uses it
                </p>
                <p className="mt-2 text-sm text-[#6B7280]">
                  The client's Business Assistant uses that knowledge when
                  responding to customers.
                </p>
              </div>

            </div>
          </div>

        </section>
      </div>
    </main>
  )
}
