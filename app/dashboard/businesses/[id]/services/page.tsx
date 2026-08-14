'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type Service = {
  id: string
  name: string
  description: string | null
  price: number | null
  duration: string | null
}

type BusinessData = {
  name: string
}

export default function ServicesPage() {
  const params = useParams()
  const businessId = params.id as string

  const [services, setServices] = useState<Service[]>([])
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      if (!businessId) return

      setLoading(true)
      setError('')

      const supabase = createClient()

      const {
        data: businessData,
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

      const business = businessData as BusinessData | null

      if (!business) {
        setError('Business not found')
        setLoading(false)
        return
      }

      setBusinessName(business.name)

      const {
        data: servicesData,
        error: servicesError,
      } = await supabase
        .from('services')
        .select('id, name, description, price, duration')
        .eq('business_id', businessId)
        .order('name')

      if (servicesError) {
        setError(servicesError.message)
      } else {
        setServices((servicesData ?? []) as Service[])
      }

      setLoading(false)
    }

    loadData()
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

          <div className="mt-5 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">
                {businessName || 'Business'} — Services
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage services, prices and durations.
              </p>
            </div>

            <Link
              href={`/dashboard/businesses/${businessId}/services/new`}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Add Service
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
              Loading services...
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-semibold">
              No services have been added yet.
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add your first service to make it available to this Business
              Assistant.
            </p>

            <Link
              href={`/dashboard/businesses/${businessId}/services/new`}
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Add Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
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

                    {service.duration && (
                      <p className="mt-3 text-sm text-slate-500">
                        Duration: {service.duration}
                      </p>
                    )}
                  </div>

                  <p className="text-lg font-semibold">
                    {service.price !== null
                      ? `£${service.price.toFixed(2)}`
                      : 'Price not set'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

