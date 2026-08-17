'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Assistant = {
  id: string
  name: string
  welcome_message: string | null
  system_instructions: string | null
  is_active: boolean
  business_id: string
  businesses: {
    name: string
  } | null
}

export default function AssistantManagePage() {
  const params = useParams()
  const router = useRouter()

  const id = params.id as string

  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [name, setName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [systemInstructions, setSystemInstructions] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    async function loadAssistant() {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('assistants')
        .select(`
          id,
          name,
          welcome_message,
          system_instructions,
          is_active,
          business_id,
          businesses (
            name
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.error('LOAD ASSISTANT ERROR:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      if (!data) {
        setError('Assistant not found.')
        setLoading(false)
        return
      }

      const loadedAssistant = data as unknown as Assistant

      setAssistant(loadedAssistant)
      setName(loadedAssistant.name)
      setWelcomeMessage(loadedAssistant.welcome_message || '')
      setSystemInstructions(loadedAssistant.system_instructions || '')
      setIsActive(loadedAssistant.is_active)
      setLoading(false)
    }

    if (id) {
      loadAssistant()
    }
  }, [id])

  async function handleSave() {
    if (!assistant) return

    if (!name.trim()) {
      setError('Please enter an assistant name.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    const { data, error } = await supabase
      .from('assistants')
      .update({
        name: name.trim(),
        welcome_message: welcomeMessage.trim() || null,
        system_instructions: systemInstructions.trim() || null,
        is_active: isActive,
      })
      .eq('id', assistant.id)
      .select(`
        id,
        name,
        welcome_message,
        system_instructions,
        is_active,
        business_id,
        businesses (
          name
        )
      `)
      .single()

    if (error) {
      console.error('SAVE ASSISTANT ERROR:', error)
      setError(error.message)
      setSaving(false)
      return
    }

    setAssistant(data as unknown as Assistant)
    setEditing(false)
    setMessage('Business Assistant updated successfully.')
    setSaving(false)
  }

  async function handleDelete() {
    if (!assistant) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${assistant.name}"? This cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setDeleting(true)
    setError('')
    setMessage('')

    const { error } = await supabase
      .from('assistants')
      .delete()
      .eq('id', assistant.id)

    if (error) {
      console.error('DELETE ASSISTANT ERROR:', error)
      setError(error.message)
      setDeleting(false)
      return
    }

    router.push('/dashboard/assistants')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF7FC]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-[#6B7280]">
            Loading Business Assistant...
          </p>
        </div>
      </main>
    )
  }

  if (error && !assistant) {
    return (
      <main className="min-h-screen bg-[#FFF7FC]">
        <div className="mx-auto max-w-6xl px-6 py-12">

          <Link
            href="/dashboard/assistants"
            className="text-sm text-[#6B7280]"
          >
            ← Back to Assistants
          </Link>

          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-2xl font-semibold text-red-900">
              Assistant not found
            </h1>

            <p className="mt-2 text-red-700">
              {error}
            </p>
          </div>

        </div>
      </main>
    )
  }

  if (!assistant) {
    return null
  }

  const businessName =
    assistant.businesses?.name || 'Unknown business'

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
            className="rounded-xl border border-[#FFB3DF] px-4 py-2 text-sm font-medium text-[#6B7280] hover:bg-[#FFF7FC]"
          >
            Dashboard
          </Link>

        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">

        <Link
          href="/dashboard/assistants"
          className="text-sm text-[#6B7280] hover:text-[#111827]"
        >
          ← Back to Assistants
        </Link>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#FC72C2]">
              Business Assistant
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#111827]">
              {assistant.name}
            </h1>

            <p className="mt-3 text-[#6B7280]">
              Client business: <span className="font-medium text-[#111827]">{businessName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">

            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                assistant.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[#FFE6F4] text-[#6B7280]'
              }`}
            >
              {assistant.is_active ? 'Active' : 'Inactive'}
            </span>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(true)
                  setError('')
                  setMessage('')
                }}
                className="rounded-xl bg-[#FC72C2] px-5 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                Edit Assistant
              </button>
            )}

          </div>

        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {editing ? (
          <div className="mt-10 rounded-2xl border border-[#FFB3DF] bg-white p-8 shadow-sm">

            <div>
              <h2 className="text-2xl font-semibold text-[#111827]">
                Edit Business Assistant
              </h2>

              <p className="mt-2 text-sm text-[#6B7280]">
                Update how this assistant represents {businessName}.
              </p>
            </div>

            <div className="mt-8 space-y-6">

              <div>
                <label className="block text-sm font-medium text-[#111827]">
                  Assistant name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
                  placeholder="e.g. Wowzabelle Beauty Assistant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827]">
                  Welcome message
                </label>

                <textarea
                  value={welcomeMessage}
                  onChange={(event) => setWelcomeMessage(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
                  placeholder="Hi! Welcome to our business. How can I help you today?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827]">
                  System instructions
                </label>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Define how the Business Assistant should behave, communicate
                  and represent the client business.
                </p>

                <textarea
                  value={systemInstructions}
                  onChange={(event) => setSystemInstructions(event.target.value)}
                  rows={12}
                  className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3 text-sm leading-6 outline-none focus:border-[#FC72C2]"
                  placeholder="Describe the assistant's behaviour, tone, rules and responsibilities..."
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-[#FFB3DF] p-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-4 w-4"
                />

                <div>
                  <p className="font-medium text-[#111827]">
                    Business Assistant is active
                  </p>

                  <p className="text-sm text-[#6B7280]">
                    When inactive, the website widget will not be available to customers.
                  </p>
                </div>
              </label>

            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="rounded-xl border border-red-200 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Assistant'}
              </button>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setError('')
                    setMessage('')
                    setName(assistant.name)
                    setWelcomeMessage(assistant.welcome_message || '')
                    setSystemInstructions(assistant.system_instructions || '')
                    setIsActive(assistant.is_active)
                  }}
                  disabled={saving}
                  className="rounded-xl border border-[#FFB3DF] px-5 py-3 text-sm font-medium text-[#6B7280] hover:bg-[#FFF7FC]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-[#FC72C2] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

              </div>

            </div>

          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-6 md:grid-cols-2">

              <div className="rounded-2xl border border-[#FFB3DF] bg-white p-8">

                <h2 className="text-xl font-semibold text-[#111827]">
                  Welcome message
                </h2>

                <p className="mt-4 leading-7 text-[#6B7280]">
                  {assistant.welcome_message || 'No welcome message set.'}
                </p>

              </div>

              <div className="rounded-2xl border border-[#FFB3DF] bg-white p-8">

                <h2 className="text-xl font-semibold text-[#111827]">
                  Assistant status
                </h2>

                <p className="mt-4 text-[#6B7280]">
                  This Business Assistant is currently{' '}
                  <span className="font-medium text-[#111827]">
                    {assistant.is_active ? 'active' : 'inactive'}
                  </span>.
                </p>

              </div>

            </div>

            <div className="mt-6 rounded-2xl border border-[#FFB3DF] bg-white p-8">

              <h2 className="text-xl font-semibold text-[#111827]">
                Assistant instructions
              </h2>

              <p className="mt-4 whitespace-pre-wrap leading-7 text-[#6B7280]">
                {assistant.system_instructions || 'No instructions set.'}
              </p>

            </div>

            <div className="mt-6 rounded-2xl border border-[#FFB3DF] bg-white p-8">

              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#FC72C2]">
                  Client management
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
                  {businessName}
                </h2>

                <p className="mt-2 text-[#6B7280]">
                  Manage everything this Business Assistant uses when helping
                  customers.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">

                <Link
                  href={`/dashboard/businesses/${assistant.business_id}`}
                  className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
                >
                  Edit Business Details
                </Link>

                <Link
                  href={`/dashboard/knowledge?businessId=${assistant.business_id}`}
                  className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
                >
                  Business Knowledge
                </Link>

                <Link
                  href={`/dashboard/services?businessId=${assistant.business_id}`}
                  className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
                >
                  Services & Pricing
                </Link>

                <Link
                  href={`/dashboard/faqs?businessId=${assistant.business_id}`}
                  className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
                >
                  FAQs
                </Link>

                <Link
                  href={`/dashboard/policies?businessId=${assistant.business_id}`}
                  className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
                >
                  Policies
                </Link>

                <Link
                  href={`/dashboard/conversations?assistantId=${assistant.id}`}
                  className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
                >
                  View Conversations
                </Link>

              </div>

            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">

              <Link
                href={`/chat?assistant=${assistant.id}`}
                className="rounded-2xl bg-[#FC72C2] p-6 text-white hover:opacity-90"
              >
                <p className="text-sm font-medium text-white/80">
                  Test
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  Open Assistant Chat →
                </h3>

                <p className="mt-2 text-sm text-white/80">
                  Test how the Business Assistant responds to customers.
                </p>
              </Link>

              <Link
                href={`/dashboard/assistants/${assistant.id}/deploy`}
                className="rounded-2xl border border-[#FFB3DF] bg-white p-6 hover:bg-[#FFF7FC]"
              >
                <p className="text-sm font-medium text-[#FC72C2]">
                  Website
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#111827]">
                  Manage Widget →
                </h3>

                <p className="mt-2 text-sm text-[#6B7280]">
                  Configure and deploy this Business Assistant on the client website.
                </p>
              </Link>

              <Link
                href={`/dashboard/businesses/${assistant.business_id}`}
                className="rounded-2xl border border-[#FFB3DF] bg-white p-6 hover:bg-[#FFF7FC]"
              >
                <p className="text-sm font-medium text-[#FC72C2]">
                  Client
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#111827]">
                  Manage Business →
                </h3>

                <p className="mt-2 text-sm text-[#6B7280]">
                  View and update the client's business information and details.
                </p>
              </Link>

            </div>

          </>
        )}

      </section>

    </main>
  )
}
