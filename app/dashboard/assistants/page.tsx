'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'

type Assistant = {
  id: string
  name: string
  welcome_message: string | null
  is_active: boolean
  business_id: string
  businesses: {
    name: string
  } | null
}

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAssistants() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You are not signed in.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('assistants')
      .select(`
        id,
        name,
        welcome_message,
        is_active,
        business_id,
        businesses (
          name
        )
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('LOAD ASSISTANTS ERROR:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    setAssistants((data || []) as unknown as Assistant[])
    setLoading(false)
  }

  useEffect(() => {
    loadAssistants()
  }, [])

  return (
    <main className="min-h-screen bg-[#FFF7FC]">

      <header className="border-b border-[#FFB3DF] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-xl font-semibold text-[#111827]">
              MAKU Technologies
            </div>

            <div className="text-sm text-[#6B7280]">
              Business Assistant Platform
            </div>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-[#FFB3DF] px-4 py-2 text-sm font-medium text-[#6B7280]"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#111827]">
              Business Assistants
            </h1>

            <p className="mt-3 text-[#6B7280]">
              Manage your personalised Business Assistants.
            </p>
          </div>

          <Link
            href="/dashboard/assistants/new"
            className="rounded-2xl bg-[#FC72C2] px-5 py-3 font-medium text-white"
          >
            Create Assistant
          </Link>

        </div>

        {loading && (
          <div className="mt-10 rounded-2xl border border-[#FFB3DF] bg-white p-8">
            <p className="text-[#6B7280]">
              Loading Business Assistants...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Could not load assistants: {error}
          </div>
        )}

        {!loading && !error && assistants.length === 0 && (
          <div className="mt-10 rounded-2xl border border-[#FFB3DF] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#111827]">
              No assistants yet
            </h2>

            <p className="mt-2 text-[#6B7280]">
              Create your first Business Assistant to get started.
            </p>

            <Link
              href="/dashboard/assistants/new"
              className="mt-6 inline-block rounded-xl bg-[#FC72C2] px-5 py-3 text-sm font-medium text-white"
            >
              Create your first assistant
            </Link>
          </div>
        )}

        {!loading && !error && assistants.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-[#FFB3DF] bg-white shadow-sm">

            <div className="grid grid-cols-12 border-b border-[#FFB3DF] bg-[#FFF7FC] px-6 py-4 text-sm font-medium text-[#6B7280]">

              <div className="col-span-5">
                Assistant
              </div>

              <div className="col-span-3">
                Business
              </div>

              <div className="col-span-2">
                Status
              </div>

              <div className="col-span-2 text-right">
                Action
              </div>

            </div>

            {assistants.map((assistant) => (

              <div
                key={assistant.id}
                className="grid grid-cols-12 items-center border-b border-slate-100 px-6 py-5 last:border-0"
              >

                <div className="col-span-5">
                  <div className="font-semibold text-[#111827]">
                    {assistant.name}
                  </div>

                  <div className="mt-1 text-sm text-[#6B7280]">
                    {assistant.welcome_message || 'No welcome message'}
                  </div>
                </div>

                <div className="col-span-3 text-sm text-[#6B7280]">
                  {assistant.businesses?.name || 'Business'}
                </div>

                <div className="col-span-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      assistant.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-[#FFE6F4] text-[#6B7280]'
                    }`}
                  >
                    {assistant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="col-span-2 text-right">

                  <Link
                    href={`/dashboard/assistants/${assistant.id}`}
                    className="rounded-xl border border-[#FFB3DF] px-4 py-2 text-sm font-medium text-[#6B7280]"
                  >
                    Manage
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
