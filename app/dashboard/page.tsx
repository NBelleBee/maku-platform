'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/navigation/Sidebar'
import { supabase } from '@/lib/supabase-client'

type Service = {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number | null
  duration: number | null
}

type Business = {
  id: string
  name: string
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setError('')

    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .order('name')

    if (businessError) {
      setError(businessError.message)
      setLoading(false)
      return
    }

    const loadedBusinesses = businessData || []
    setBusinesses(loadedBusinesses)

    if (loadedBusinesses.length > 0) {
      const businessIds = loadedBusinesses.map((business) => business.id)

      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select(
          'id, business_id, name, description, price, duration'
        )
        .in('business_id', businessIds)
        .order('name')

      if (serviceError) {
        setError(serviceError.message)
        setLoading(false)
        return
      }

      setServices(serviceData || [])
    } else {
      setServices([])
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC] text-[#111827]">
      <div className="container grid gap-8 py-12 lg:grid-cols-[288px_1fr]">
        <Sidebar />

        <section className="space-y-6">
          <div className="rounded-[32px] border border-[#FFB3DF] bg-white p-10 shadow-card">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#111827]">
              Welcome to MAKU
            </h1>

            <p className="mt-3 text-[#6B7280]">
              Manage your businesses, assistants and customer
              experience from one place.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#FFB3DF] bg-white p-7 shadow-card">
              <p className="text-sm text-[#6B7280]">Businesses</p>

              <p className="mt-2 text-3xl font-semibold text-[#111827]">
                {loading ? '—' : businesses.length}
              </p>

              <Link
                href="/dashboard/businesses"
                className="mt-5 inline-block text-sm font-medium text-[#6B7280] hover:text-[#111827]"
              >
                Manage businesses →
              </Link>
            </div>

            <div className="rounded-[28px] border border-[#FFB3DF] bg-white p-7 shadow-card">
              <p className="text-sm text-[#6B7280]">Services</p>

              <p className="mt-2 text-3xl font-semibold text-[#111827]">
                {loading ? '—' : services.length}
              </p>

              <Link
                href="/dashboard/services"
                className="mt-5 inline-block text-sm font-medium text-[#6B7280] hover:text-[#111827]"
              >
                Manage services →
              </Link>
            </div>

            <div className="rounded-[28px] border border-[#FFB3DF] bg-white p-7 shadow-card">
              <p className="text-sm text-[#6B7280]">Assistants</p>

              <p className="mt-2 text-3xl font-semibold text-[#111827]">
                —
              </p>

              <Link
                href="/dashboard/assistants"
                className="mt-5 inline-block text-sm font-medium text-[#6B7280] hover:text-[#111827]"
              >
                Manage assistants →
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#FFB3DF] bg-white p-8 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Services
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#111827]">
                  Your services
                </h2>
              </div>

              <Link
                href="/dashboard/services"
                className="text-sm font-medium text-[#6B7280] hover:text-[#111827]"
              >
                View all →
              </Link>
            </div>

            <div className="mt-6">
              {loading ? (
                <p className="text-sm text-[#6B7280]">
                  Loading services...
                </p>
              ) : services.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#FFB3DF] p-8 text-center">
                  <p className="font-medium text-[#111827]">
                    No services added yet.
                  </p>

                  <p className="mt-2 text-sm text-[#6B7280]">
                    Add services so your Business Assistants can
                    provide accurate service information.
                  </p>

                  <Link
                    href="/dashboard/services"
                    className="mt-5 inline-block rounded-xl bg-[#FC72C2] px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Add a service
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.slice(0, 5).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-2xl border border-[#FFB3DF] p-5"
                    >
                      <div>
                        <p className="font-medium text-[#111827]">
                          {service.name}
                        </p>

                        {service.description && (
                          <p className="mt-1 text-sm text-[#6B7280]">
                            {service.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        {service.price !== null && (
                          <p className="font-semibold text-[#111827]">
                            £{Number(service.price).toFixed(2)}
                          </p>
                        )}

                        {service.duration !== null && (
                          <p className="mt-1 text-sm text-[#6B7280]">
                            {service.duration} mins
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}