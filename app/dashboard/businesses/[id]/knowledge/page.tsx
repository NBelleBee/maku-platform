'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type Knowledge = {
  id: string
  business_id: string
  title: string
  content: string
}

type Business = {
  name: string
}

export default function KnowledgePage() {
  const params = useParams()
  const businessId = params.id as string

  const [knowledge, setKnowledge] = useState<Knowledge[]>([])
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadKnowledge() {
      setLoading(true)
      setError('')

      const supabase = createClient()

      const {
        data: business,
        error: businessError,
      } = await supabase
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

      const {
        data,
        error: knowledgeError,
      } = await supabase
        .from('knowledge')
        .select('id, business_id, title, content')
        .eq('business_id', businessId)
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
  }, [businessId])

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

          <div className="mt-5 flex items-center justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Knowledge Base
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                {businessName || 'Knowledge'}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Upload and manage the information used by this Business
                Assistant.
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

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Upload your client&apos;s business information and MAKU will
              prepare it for the Business Assistant.
            </p>

            <Link
              href={`/dashboard/businesses/${businessId}/knowledge/new`}
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Upload Knowledge
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {knowledge.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h2 className="text-lg font-semibold">
                  {item.title}
                </h2>

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



