'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

type Service = {
  id: string
  name: string
  description: string | null
  price: number | null
  duration: string | null
}

export default function ServicesPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, description, price, duration')
        .eq('business_id', params.id)
        .order('name')

      if (error) {
        setError(error.message)
      } else {
        setServices(data ?? [])
      }

      setLoading(false)
    }

    loadServices()
  }, [params.id])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href={`/dashboard/businesses/${params.id}`}
          className="text-sm font-medium text-slate-600"
        >
          ← Back to Business
        </Link>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Services
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Services & Pricing
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage the services offered by this business.
            </p>
          </div>

          <Link
            href={`/dashboard/businesses/${params.id}/services/new`}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Add Service
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-sm text-slate-500">
            Loading services...
          </p>
        ) : services.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-semibold">
              No services yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add this business's services, prices and durations.
            </p>

            <Link
              href={`/dashboard/businesses/${params.id}/services/new`}
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Add Service
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {service.name}
                    </h2>

                    {service.description && (
                      <p className="mt-2 text-sm text-slate-500">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {service.price !== null && (
                      <p className="font-semibold">
                        £{Number(service.price).toFixed(2)}
                      </p>
                    )}

                    {service.duration && (
                      <p className="mt-1 text-sm text-slate-500">
                        {service.duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
