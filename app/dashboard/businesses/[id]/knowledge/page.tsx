```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type Knowledge = {
  id: string
  title: string
  content: string
  is_active: boolean
  created_at: string
}

export default function KnowledgePage() {
  const params = useParams()
  const businessId = params.id as string

  const [knowledge, setKnowledge] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadKnowledge() {
      const supabase = createClient()

      const {
        data,
        error: knowledgeError,
      } = await supabase
        .from('knowledge')
        .select(
          'id, title, content, is_active, created_at'
        )
        .eq('business_id', businessId)
        .order('created_at', {
          ascending: false,
        })

      if (knowledgeError) {
        setError(knowledgeError.message)
      } else {
        setKnowledge(data ?? [])
      }

      setLoading(false)
    }

    if (businessId) {
      loadKnowledge()
    }
  }, [businessId])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard/businesses"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              ← Back to Businesses
            </Link>

            <Link
              href={`/dashboard/businesses/${businessId}/knowledge/new`}
              className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              + Add Business Knowledge
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Business Management
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Knowledge
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage the information MAKU uses to
              understand this business and support its
              Business Assistant.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            Could not load knowledge: {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">
              Loading knowledge...
            </p>
          </div>
        ) : knowledge.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📚
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No knowledge added yet
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Add the business information that MAKU
                should use when responding to customer
                enquiries.
              </p>

              <Link
                href={`/dashboard/businesses/${businessId}/knowledge/new`}
                className="mt-6 inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Add Business Knowledge
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {knowledge.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.content.length > 300
                        ? `${item.content.slice(0, 300)}...`
                        : item.content}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                      item.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400">
                  Added{' '}
                  {new Date(
                    item.created_at
                  ).toLocaleDateString('en-GB')}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
```
