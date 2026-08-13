'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
}

export default function BusinessPage({
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
            href="/dashboard/businesses"
            className="text-sm font-medium text-slate-600"
          >
            ← Back to Businesses
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-semibold text-slate-900">
              {business.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage this business and its Business Assistant.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href={`/dashboard/businesses/${business.id}/knowledge`}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-400"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Knowledge
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage the information your Business Assistant uses.
            </p>
          </Link>

          <Link
            href={`/dashboard/businesses/${business.id}/services`}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-400"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Services
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage services, durations and service information.
            </p>
          </Link>

          <Link
            href={`/dashboard/businesses/${business.id}/pricing`}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-400"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Pricing
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage pricing and customer-facing price information.
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}
