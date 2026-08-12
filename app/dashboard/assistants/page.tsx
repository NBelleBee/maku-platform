```tsx
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
  business_name: string
}

type Business = {
  id: string
  name: string
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

    const {
      data: assistantRows,
      error: assistantError,
    } = await supabase
      .from('assistants')
      .select(
        'id, name, welcome_message, is_active, business_id'
      )
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (assistantError) {
      console.error('LOAD ASSISTANTS ERROR:', assistantError)
      setError(assistantError.message)
      setLoading(false)
      return
    }

    if (!assistantRows || assistantRows.length === 0) {
      setAssistants([])
      setLoading(false)
      return
    }

    const businessIds = [
      ...new Set(
        assistantRows
          .map((assistant) => assistant.business_id)
          .filter(Boolean)
      ),
    ]

    let businesses: Business[] = []

    if (businessIds.length > 0) {
      const {
        data: businessRows,
        error: businessError,
      } = await supabase
        .from('businesses')
        .select('id, name')
        .in('id', businessIds)

      if (businessError) {
        console.error('LOAD BUSINESSES ERROR:', businessError)
      } else {
        businesses = (businessRows || []) as Business[]
      }
    }

    const businessMap = new Map(
      businesses.map((business) => [business.id, business.name])
    )

    const formattedAssistants: Assistant[] = assistantRows.map(
      (assistant) => ({
        id: assistant.id,
        name: assistant.name,
        welcome_message: assistant.welcome_message,
        is_active: assistant.is_active,
        business_id: assistant.business_id,
        business_name:
          businessMap.get(assistant.business_id) || 'Business',
      })
    )

    setAssistants(formattedAssistants)
    setLoading(false)
  }

  useEffect(() => {
    loadAssistants()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-xl font-semibold text-slate-950">
              MAKU Technologies
            </div>

            <div className="text-sm text-slate-500">
              Business Assistant Platform
            </div>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Business Assistants
            </h1>

            <p className="mt-3 text-slate-600">
              Manage your personalised Business Assistants.
            </p>
          </div>

          <Link
            href="/dashboard/assistants/new"
            className="rounded-2xl bg-slate-950 px-5 py-3 font-medium text-white"
          >
            Create Assistant
          </Link>
        </div>

        {loading && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-slate-500">
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
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              No assistants yet
            </h2>

            <p className="mt-2 text-slate-500">
              Create your first Business Assistant to get started.
            </p>

            <Link
              href="/dashboard/assistants/new"
              className="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            >
              Create your first assistant
            </Link>
          </div>
        )}

        {!loading && !error && assistants.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium text-slate-500">
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
                  <div className="font-semibold text-slate-950">
                    {assistant.name}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    {assistant.welcome_message ||
                      'No welcome message'}
                  </div>
                </div>

                <div className="col-span-3 text-sm text-slate-700">
                  {assistant.business_name}
                </div>

                <div className="col-span-2">
                  <span
                    className={
                      assistant.is_active
                        ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'
                        : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500'
                    }
                  >
                    {assistant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="col-span-2 text-right">
                  <Link
                    href={`/dashboard/assistants/${assistant.id}`}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
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
```
