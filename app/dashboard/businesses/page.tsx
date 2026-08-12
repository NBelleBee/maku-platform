```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
}

export default function CreateAssistantPage() {
  const router = useRouter()
  const supabase = createClient()

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessId, setBusinessId] = useState('')
  const [name, setName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .order('name')

      if (error) {
        setError(error.message)
      } else {
        setBusinesses(data ?? [])
      }

      setLoading(false)
    }

    loadBusinesses()
  }, [])

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')

    if (!businessId) {
      setError('Please select a business.')
      return
    }

    if (!name.trim()) {
      setError('Please enter an assistant name.')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('assistants')
      .insert({
        business_id: businessId,
        name: name.trim(),
        welcome_message: welcomeMessage.trim(),
        instructions: instructions.trim(),
        is_active: isActive,
      })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push('/dashboard/assistants')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href="/dashboard/assistants"
            className="text-sm font-medium text-slate-600"
          >
            ← Back to Assistants
          </Link>

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Create assistant
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a personalised assistant for a business.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="business"
                className="block text-sm font-medium text-slate-900"
              >
                Business
              </label>

              <select
                id="business"
                name="business"
                value={businessId}
                onChange={(event) => setBusinessId(event.target.value)}
                disabled={loading || saving}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              >
                <option value="">
                  {loading ? 'Loading businesses...' : 'Select a business'}
                </option>

                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-900"
              >
                Assistant name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Maku Concierge"
                disabled={saving}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="welcome"
                className="block text-sm font-medium text-slate-900"
              >
                Welcome message
              </label>

              <textarea
                id="welcome"
                name="welcome"
                rows={4}
                value={welcomeMessage}
                onChange={(event) =>
                  setWelcomeMessage(event.target.value)
                }
                placeholder="How would you like your assistant to welcome customers?"
                disabled={saving}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="instructions"
                className="block text-sm font-medium text-slate-900"
              >
                Assistant instructions
              </label>

              <textarea
                id="instructions"
                name="instructions"
                rows={6}
                value={instructions}
                onChange={(event) =>
                  setInstructions(event.target.value)
                }
                placeholder="Describe how the assistant should respond to customers."
                disabled={saving}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(event.target.checked)
                }
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300"
              />

              <label
                htmlFor="active"
                className="text-sm font-medium text-slate-900"
              >
                Active assistant
              </label>
            </div>

            <div className="flex gap-3 border-t border-slate-200 pt-6">
              <Link
                href="/dashboard/assistants"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create assistant'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
```
