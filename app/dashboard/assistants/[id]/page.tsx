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
  const [error, setError] = useState('')

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
        setError('Assistant not found')
        setLoading(false)
        return
      }

      setAssistant(data as unknown as Assistant)
      setLoading(false)
    }

    if (id) {
      loadAssistant()
    }
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF7FC]">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="text-[#6B7280]">
            Loading Business Assistant...
          </p>
        </div>
      </main>
    )
  }

  if (error || !assistant) {
    return (
      <main className="min-h-screen bg-[#FFF7FC]">
        <div className="mx-auto max-w-5xl px-6 py-12">

          <Link
            href="/dashboard/assistants"
            className="text-sm text-[#6B7280]"
          >
            ← Back to assistants
          </Link>

          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-2xl font-semibold text-red-900">
              Assistant not found
            </h1>

            <p className="mt-2 text-red-700">
              {error || 'We could not find this Business Assistant.'}
            </p>
          </div>

        </div>
      </main>
    )
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

          <Link
            href="/dashboard"
            className="rounded-xl border border-[#FFB3DF] px-4 py-2 text-sm font-medium text-[#6B7280]"
          >
            Dashboard
          </Link>

        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">

        <Link
          href="/dashboard/assistants"
          className="text-sm text-[#6B7280]"
        >
          ← Back to assistants
        </Link>

        <div className="mt-8 flex items-start justify-between">

          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#111827]">
              {assistant.name}
            </h1>

            <p className="mt-3 text-[#6B7280]">
              Business: {assistant.businesses?.name || 'Unknown business'}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              assistant.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-[#FFE6F4] text-[#6B7280]'
            }`}
          >
            {assistant.is_active ? 'Active' : 'Inactive'}
          </span>

        </div>

        <div className="mt-10 grid gap-6">

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
              Assistant instructions
            </h2>

            <p className="mt-4 whitespace-pre-wrap leading-7 text-[#6B7280]">
              {assistant.system_instructions || 'No instructions set.'}
            </p>

          </div>

          <div className="rounded-2xl border border-[#FFB3DF] bg-white p-8">

            <h2 className="text-xl font-semibold text-[#111827]">
              Client knowledge
            </h2>

            <p className="mt-2 text-[#6B7280]">
              Business information, services, pricing, FAQs and policies will
              be managed here.
            </p>

            <div className="mt-6">
          <Link
            href={`/chat?assistant=${assistant.id}`}
            className="inline-flex rounded-xl bg-[#FC72C2] px-6 py-3 font-medium text-white hover:bg-slate-800"
          >
            Open Business Assistant Chat →
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <Link
                href={`/dashboard/businesses/${assistant.business_id}`}
                className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
              >
                Manage Client Business
              </Link>

              <Link
                href="/dashboard/knowledge"
                className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
              >
                Manage Knowledge
              </Link>

              <Link
                href="/dashboard/services"
                className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
              >
                Services & Pricing
              </Link>

              <Link
                href="/dashboard/faqs"
                className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
              >
                FAQs
              </Link>

              <Link
                href="/dashboard/policies"
                className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
              >
                Policies
              </Link>

              <Link
                href="/dashboard/conversations"
                className="rounded-xl border border-[#FFB3DF] px-5 py-4 font-medium text-[#111827] hover:bg-[#FFF7FC]"
              >
                Conversations
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}
