'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
}

export default function BusinessKnowledgePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBusiness() {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('id', params.id)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setBusiness(data)
      }

      setLoading(false)
    }

    loadBusiness()
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p className="text-sm text-slate-500">Loading business...</p>
      </main>
    )
  }

  if (error || !business) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <Link
          href="/dashboard/businesses"
          className="text-sm font-medium text-slate-600"
        >
          ← Back to Businesses
        </Link>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-900">
            Business not found
          </h1>

          <p className="mt-2 text-sm text-red-700">
            {error || 'This business could not be found.'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href={`/dashboard/businesses/${business.id}`}
            className="text-sm font-medium text-slate-600"
          >
            ← Back to {business.name}
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-semibold text-slate-900">
              {business.name} — Knowledge
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage the knowledge used by this Business Assistant.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Business Knowledge
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This is where the business-specific knowledge base will be managed.
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-6">
            <p className="text-sm text-slate-500">
              Knowledge management is ready to be connected to this business.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
