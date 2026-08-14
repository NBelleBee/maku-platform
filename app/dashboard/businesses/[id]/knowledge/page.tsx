'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type Knowledge = {
  id: string
  title: string
  content: string
  source: string | null
  priority: number | null
  is_active: boolean | null
}

type Business = {
  name: string
}

export default function KnowledgePage() {
  const params = useParams()
  const businessId = params.id as string
  const supabase = createClient()

  const [knowledge, setKnowledge] = useState<Knowledge[]>([])
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadKnowledge() {
      setLoading(true)
      setError('')

      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', businessId)
        .single()

      if (businessError) {
        setError(businessError.message)
        setLoading(false)
        return
      }

      if (!business) {
        setError('Business not found')
        setLoading(false)
        return
      }

      const businessRecord = business as Business

      setBusinessName(businessRecord.name)

      const { data, error: knowledgeError } = await supabase
        .from('knowledge')
        .select('id, title, content, source, priority, is_active')
        .eq('business_id', businessId)
        .order('priority', { ascending: false })
        .order('title')

      if (knowledgeError) {
        setError(knowledgeError.message)
      } else {
        setKnowledge((data ?? []) as Knowledge[])
      }

      setLoading(false)
    }

    if (businessId) {
      loadKnowledge()
    }
  }, [businessId, supabase])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href={`/dashboard/businesses/${businessId}`}
            className="text-sm font-medium text-slate-600"
          >
            ← Back to {businessName || 'Business'}
          </Link>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Knowledge Base
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                {businessName || 'Knowledge'}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage the knowledge used by this Business Assistant.
              </p>
            </div>

            <Link
              href={`/dashboard/businesses/${businessId}/knowledge/new`}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Add Knowledge
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm text-slate-500">
              Loading knowledge...
            </p>
          </div>
        ) : knowledge.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">
              No knowledge has been added yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add business information so the Business Assistant can provide
              accurate, business-specific answers.
            </p>

            <Link
              href={`/dashboard/businesses/${businessId}/knowledge/new`}
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Add First Knowledge
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {knowledge.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {item.title}
                    </h2>

                    {item.source && (
                      <p className="mt-1 text-xs text-slate-400">
                        Source: {item.source}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
