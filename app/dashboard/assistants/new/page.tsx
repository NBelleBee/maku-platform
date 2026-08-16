'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
}

export default function NewAssistantPage() {
  const router = useRouter()

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessId, setBusinessId] = useState('')
  const [name, setName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Hi! Welcome. How can I help you today?'
  )
  const [systemInstructions, setSystemInstructions] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [loadingBusinesses, setLoadingBusinesses] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBusinesses() {
      setLoadingBusinesses(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You are not signed in.')
        setLoadingBusinesses(false)
        return
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .order('name', { ascending: true })

      if (error) {
        setError('Could not load businesses: ' + error.message)
      } else {
        setBusinesses(data || [])

        if (data && data.length > 0) {
          setBusinessId(data[0].id)
        }
      }

      setLoadingBusinesses(false)
    }

    loadBusinesses()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!businessId) {
      setError('Please select a business.')
      return
    }

    if (!name.trim()) {
      setError('Assistant name is required.')
      return
    }

    setSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You are not signed in.')
      setSubmitting(false)
      return
    }

    const { data, error } = await supabase
      .from('assistants')
      .insert({
        owner_id: user.id,
        business_id: businessId,
        name: name.trim(),
        welcome_message: welcomeMessage.trim() || null,
        system_instructions: systemInstructions.trim() || null,
        is_active: isActive,
      })
      .select('id')
      .single()

    if (error) {
      console.error('CREATE ASSISTANT ERROR:', error)
      setError(error.message)
      setSubmitting(false)
      return
    }

    router.push(`/dashboard/assistants/${data.id}`)
  }

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
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-12">
        <button
          type="button"
          onClick={() => router.push('/dashboard/assistants')}
          className="text-sm text-[#6B7280] hover:text-[#111827]"
        >
          ← Back to Assistants
        </button>

        <h1 className="mt-8 text-3xl font-semibold text-[#111827]">
          Create Business Assistant
        </h1>

        <p className="mt-2 text-sm text-[#6B7280]">
          Configure a personalised Business Assistant for a client business.
        </p>

        {loadingBusinesses ? (
          <p className="mt-8 text-sm text-[#6B7280]">
            Loading businesses...
          </p>
        ) : businesses.length === 0 && !error ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm text-amber-800">
              No businesses found. Create a business first.
            </p>

            <button
              type="button"
              onClick={() => router.push('/dashboard/businesses/new')}
              className="mt-4 rounded-xl bg-[#FC72C2] px-4 py-2 text-sm font-medium text-white"
            >
              Create Business
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#6B7280]">
                Business
              </label>

              <select
                required
                value={businessId}
                onChange={(event) => setBusinessId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#FFB3DF] bg-white px-4 py-3 text-[#111827]"
              >
                <option value="">Select a business</option>

                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280]">
                Assistant name
              </label>

              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Wowzabelle Business Assistant"
                className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280]">
                Welcome message
              </label>

              <textarea
                value={welcomeMessage}
                onChange={(event) => setWelcomeMessage(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280]">
                System instructions
              </label>

              <p className="mt-1 text-xs text-[#6B7280]">
                Define how this Business Assistant should behave and represent
                the client business.
              </p>

              <textarea
                value={systemInstructions}
                onChange={(event) =>
                  setSystemInstructions(event.target.value)
                }
                rows={7}
                placeholder="Describe the business, tone, responsibilities, boundaries and how the assistant should help customers."
                className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-[#6B7280]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4"
              />

              Business Assistant is active
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/assistants')}
                className="rounded-xl border border-[#FFB3DF] px-5 py-3 text-sm font-medium text-[#6B7280]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#FC72C2] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Business Assistant'}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}
