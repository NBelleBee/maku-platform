'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
}

export default function BusinessesPage() {
  const supabase = createClient()

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .order('name')

      if (error) {
        setError(error.message)
      } else {
        setBusinesses(data ?? [])
      }

      setLoading(false)
    }

    loadBusinesses()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Businesses
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your businesses and Business Assistants.
              </p>
            </div>

            <Link
              href="/dashboard/businesses/new"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Add Business
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Businesses
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your business information, knowledge, services and pricing.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">
              Loading businesses...
            </p>
          ) : businesses.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">
                No businesses have been added yet.
              </p>

              <Link
                href="/dashboard/businesses/new"
                className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Add Business
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="rounded-2xl border border-slate-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {business.name}
                  </h3>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard/businesses/${business.id}`}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                      Manage Business
                    </Link>

                    <Link
                      href={`/dashboard/businesses/${business.id}/knowledge`}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900"
                    >
                      Knowledge
                    </Link>

                    <Link
                      href={`/dashboard/businesses/${business.id}/services`}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900"
                    >
                      Services
                    </Link>

                    <Link
                      href={`/dashboard/businesses/${business.id}/pricing`}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900"
                    >
                      Pricing
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
