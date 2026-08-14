'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
}

type Service = {
  id: string
  name: string
  description: string | null
  price: number | null
  duration: string | null
}

export default function BusinessServicesPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('id', params.id)
        .single()

      if (businessError) {
        setError(businessError.message)
        setLoading(false)
        return
      }

      setBusiness(businessData)

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, description, price, duration')
        .eq('business_id', params.id)
        .order('name')

      if (servicesError) {
        setError(servicesError.message)
      } else {
        setServices(servicesData ?? [])
      }

      setLoading(false)
    }

    loadData()
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p className="text-sm text-slate-500">Loading services...</p>
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
            Unable to load services
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

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            {business.name} — Services
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage this business's services, prices and durations.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Services
          </h2>

          {services.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-6">
              <p className="text-sm text-slate-500">
                No services have been added for this business yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {service.name}
                      </h3>

                      {service.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      {service.price !== null && (
                        <p className="font-semibold text-slate-900">
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
      </section>
    </main>
  )
}
