'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Service = {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number | null
  duration: string | null
}

type Business = {
  id: string
  name: string
}

function ServicesPageContent() {
  const searchParams = useSearchParams()

  const [services, setServices] = useState<Service[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessId, setBusinessId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const requestedBusinessId = searchParams.get('businessId')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError('')

      const { data: businessesData, error: businessesError } =
        await supabase
          .from('businesses')
          .select('id, name')
          .order('name')

      if (businessesError) {
        setError(businessesError.message)
        setLoading(false)
        return
      }

      const businessList = businessesData || []
      setBusinesses(businessList)

      if (businessList.length === 0) {
        setBusinessId('')
        setServices([])
        setLoading(false)
        return
      }

      const requestedBusinessExists =
        requestedBusinessId &&
        businessList.some(
          (business) => business.id === requestedBusinessId
        )

      const selectedId = requestedBusinessExists
        ? requestedBusinessId
        : businessList[0].id

      setBusinessId(selectedId)

      const { data: servicesData, error: servicesError } =
        await supabase
          .from('services')
          .select(
            'id, business_id, name, description, price, duration'
          )
          .eq('business_id', selectedId)
          .order('name')

      if (servicesError) {
        setError(servicesError.message)
        setServices([])
      } else {
        setServices(servicesData || [])
      }

      setLoading(false)
    }

    loadData()
  }, [requestedBusinessId])

  async function changeBusiness(id: string) {
    setBusinessId(id)
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('services')
      .select(
        'id, business_id, name, description, price, duration'
      )
      .eq('business_id', id)
      .order('name')

    if (error) {
      setError(error.message)
      setServices([])
    } else {
      setServices(data || [])
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC]">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/assistants"
              className="text-sm text-[#6B7280]"
            >
              ← Back to Assistants
            </Link>

            <h1 className="mt-6 text-4xl font-semibold text-[#111827]">
              Services & Pricing
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Manage the services and prices your Business Assistants can use.
            </p>
          </div>

          <Link
            href={`/dashboard/services/new${
              businessId ? `?businessId=${businessId}` : ''
            }`}
            className="rounded-xl bg-[#FC72C2] px-5 py-3 font-medium text-white"
          >
            Add Service
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-[#FFB3DF] bg-white p-6">
          <label className="text-sm font-medium text-[#6B7280]">
            Business
          </label>

          <select
            value={businessId}
            onChange={(event) => changeBusiness(event.target.value)}
            className="mt-2 w-full max-w-md rounded-xl border border-[#FFB3DF] px-4 py-3"
          >
            {businesses.length === 0 && (
              <option value="">No businesses found</option>
            )}

            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#FFB3DF] bg-white">

          {loading ? (
            <div className="p-8 text-[#6B7280]">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="p-8">

              <h2 className="text-lg font-semibold text-[#111827]">
                No services yet
              </h2>

              <p className="mt-2 text-[#6B7280]">
                Add your first service and price for this business.
              </p>

              <Link
                href={`/dashboard/services/new${
                  businessId ? `?businessId=${businessId}` : ''
                }`}
                className="mt-5 inline-block rounded-xl bg-[#FC72C2] px-5 py-3 font-medium text-white"
              >
                Add First Service
              </Link>

            </div>
          ) : (
            <div className="divide-y divide-slate-200">

              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-6 p-6"
                >

                  <div>

                    <h2 className="font-semibold text-[#111827]">
                      {service.name}
                    </h2>

                    {service.description && (
                      <p className="mt-1 text-sm text-[#6B7280]">
                        {service.description}
                      </p>
                    )}

                    {service.duration && (
                      <p className="mt-1 text-sm text-[#6B7280]">
                        Duration: {service.duration}
                      </p>
                    )}

                  </div>

                  <div className="font-semibold text-[#111827]">
                    {service.price !== null
                      ? `£${Number(service.price).toFixed(2)}`
                      : 'Price not set'}
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  )
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFF7FC]">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="rounded-2xl border border-[#FFB3DF] bg-white p-8 text-[#6B7280]">
              Loading services...
            </div>
          </div>
        </main>
      }
    >
      <ServicesPageContent />
    </Suspense>
  )
}
