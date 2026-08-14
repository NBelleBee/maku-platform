'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type Service = {
  id: string
  name: string
  price: number | null
  duration: string | null
}

export default function PricingPage() {
  const params = useParams()
  const businessId = params.id as string
  const supabase = createClient()

  const [services, setServices] = useState<Service[]>([])
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPricing() {
      setLoading(true)

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

      setBusinessName(business.name)

      const { data, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price, duration')
        .eq('business_id', businessId)
        .order('name')

      if (servicesError) {
        setError(servicesError.message)
      } else {
        setServices(data ?? [])
      }

      setLoading(false)
    }

    if (businessId) {
      loadPricing()
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

          <div className="mt-5">
            <h1 className="text-3xl font-semibold">
              {businessName} — Pricing
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View pricing information for this business.
            </p>
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
          <p className="text-sm text-slate-500">Loading pricing...</p>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-semibold">
              No pricing has been added yet.
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add services and prices first.
            </p>

            <Link
              href={`/dashboard/businesses/${businessId}/services/new`}
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Add Service
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between border-b border-slate-100 p-6 last:border-b-0"
              >
                <div>
                  <h2 className="font-semibold">{service.name}</h2>

                  {service.duration && (
                    <p className="mt-1 text-sm text-slate-500">
                      {service.duration}
                    </p>
                  )}
                </div>

                <p className="text-lg font-semibold">
                  {service.price !== null
                    ? `£${service.price.toFixed(2)}`
                    : 'Price not set'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
```
