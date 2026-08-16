'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
  industry: string
  website: string | null
  email: string | null
}

export default function BusinessesPage() {
  const [clients, setClients] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getClients() {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, industry, website, email')
        .order('name', { ascending: true })

      setClients(data || [])
      setLoading(false)
    }

    getClients()
  }, [])

  return (
    <main className="min-h-screen bg-[#FFF7FC]">

      <header className="border-b border-[#FFB3DF] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-lg font-semibold text-[#111827]">
              MAKU Technologies
            </h1>

            <p className="text-sm text-[#6B7280]">
              Client Management
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-[#FFB3DF] px-4 py-2 text-sm font-medium"
          >
            Dashboard
          </Link>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-4xl font-semibold text-[#111827]">
              All Clients
            </h2>

            <p className="mt-3 text-[#6B7280]">
              Every business managed by MAKU Technologies.
            </p>
          </div>

          <Link
            href="/dashboard/businesses/new"
            className="rounded-2xl bg-[#FC72C2] px-5 py-3 font-medium text-white"
          >
            + Add Client
          </Link>

        </div>

        {loading ? (
          <div className="mt-10 rounded-2xl border bg-white p-8">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-white p-10 text-center">
            <h3 className="text-xl font-semibold">
              No clients yet
            </h3>

            <p className="mt-2 text-[#6B7280]">
              Add your first client to begin building their Business Assistant.
            </p>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-2xl border border-[#FFB3DF] bg-white">

            <div className="grid grid-cols-12 border-b border-[#FFB3DF] bg-[#FFF7FC] px-6 py-4 text-sm font-medium text-[#6B7280]">

              <div className="col-span-3">
                Business
              </div>

              <div className="col-span-2">
                Industry
              </div>

              <div className="col-span-3">
                Email
              </div>

              <div className="col-span-2">
                Website
              </div>

              <div className="col-span-2">
                Actions
              </div>

            </div>

            {clients.map((client) => (

              <div
                key={client.id}
                className="grid grid-cols-12 items-center border-b border-slate-100 px-6 py-5 last:border-0"
              >

                <div className="col-span-3">
                  <p className="font-semibold text-[#111827]">
                    {client.name}
                  </p>
                </div>

                <div className="col-span-2 text-sm text-[#6B7280]">
                  {client.industry}
                </div>

                <div className="col-span-3 text-sm text-[#6B7280]">
                  {client.email || '—'}
                </div>

                <div className="col-span-2 text-sm text-[#6B7280]">
                  {client.website || 'No website'}
                </div>

                <div className="col-span-2 flex gap-2">

                  <Link
                    href={`/dashboard/businesses/${client.id}`}
                    className="rounded-lg border border-[#FFB3DF] px-3 py-2 text-sm"
                  >
                    Manage
                  </Link>

                  <Link
                    href={`/dashboard/assistants/new?business=${client.id}`}
                    className="rounded-lg bg-[#FC72C2] px-3 py-2 text-sm text-white"
                  >
                    Assistant
                  </Link>

                </div>

              </div>

            ))}

          </div>
        )}

      </section>
    </main>
  )
}
