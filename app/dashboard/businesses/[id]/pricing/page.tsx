```tsx
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

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Pricing
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                {businessName || 'Pricing'}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                View and manage service pricing for this business.
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
              Loading pricing...
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">
              No pricing available yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Pricing is managed through the services offered by this business.
            </p>

            <Link
              href={`/dashboard/businesses/${businessId}/services/new`}
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Add First Service
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold">
              <span>Service</span>
              <span>Duration</span>
              <span>Price</span>
            </div>

            {services.map((service) => (
              <div
                key={service.id}
                className="grid grid-cols-3 border-b border-slate-100 px-6 py-5 text-sm last:border-0"
              >
                <span className="font-medium">
                  {service.name}
                </span>

                <span className="text-slate-500">
                  {service.duration || 'Not specified'}
                </span>

                <span className="font-semibold">
                  {service.price !== null
                    ? `£${service.price}`
                    : 'Price on request'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
```
