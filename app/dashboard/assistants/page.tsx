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
}

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAssistants()
  }, [])

  async function loadAssistants() {
    setLoading(true)
    setError('')

    const result = await supabase
      .from('assistants')
      .select('id, name, welcome_message, is_active, business_id')
      .order('name')

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    setAssistants(result.data || [])
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Assistants
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your Business Assistants.
            </p>
          </div>

          <Link
            href="/dashboard/assistants/new"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Create assistant
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm text-slate-500">
              Loading assistants...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load assistants
            </h2>
            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && assistants.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No assistants yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create your first Business Assistant to get started.
            </p>

            <Link
              href="/dashboard/assistants/new"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Create your first assistant
            </Link>
          </div>
        )}

        {!loading && !error && assistants.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Business Assistants
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {assistants.map((assistant) => (
                <div
                  key={assistant.id}
                  className="flex items-center justify-between gap-6 px-6 py-5"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-slate-900">
                        {assistant.name}
                      </h3>

                      {assistant.is_active ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                          Inactive
                        </span>
                      )}
                    </div>

                    {assistant.welcome_message && (
                      <p className="mt-2 text-sm text-slate-500">
                        {assistant.welcome_message}
                      </p>
                    )}
                  </div>

                  <Link
                    href={'/dashboard/assistants/' + assistant.id}
                    className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
```
