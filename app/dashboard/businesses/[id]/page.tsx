'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
  owner_id: string | null
}

type Assistant = {
  id: string
  name: string
  welcome_message: string | null
  system_instructions: string | null
  is_active: boolean
}

type KnowledgeItem = {
  id: string
  title: string
  content: string
  is_active: boolean
}

type Service = {
  id: string
  name: string
  description: string | null
  price: number | null
  duration: string | null
}

export default function BusinessManagementPage() {
  const params = useParams()
  const router = useRouter()

  const businessId = String(params.id)

  const [business, setBusiness] = useState<Business | null>(null)
  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [services, setServices] = useState<Service[]>([])

  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function loadBusiness() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, owner_id')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .maybeSingle()

    if (businessError) {
      setError(businessError.message)
      setLoading(false)
      return
    }

    if (!businessData) {
      setError('Business not found or you do not have access to it.')
      setLoading(false)
      return
    }

    setBusiness(businessData)

    const { data: assistantData } = await supabase
      .from('assistants')
      .select(
        'id, name, welcome_message, system_instructions, is_active'
      )
      .eq('business_id', businessId)
      .eq('owner_id', user.id)
      .maybeSingle()

    setAssistant(assistantData)

    const { data: knowledgeData } = await supabase
      .from('knowledge')
      .select('id, title, content, is_active')
      .eq('business_id', businessId)
      .order('priority', { ascending: true })

    setKnowledge(knowledgeData || [])

    const { data: servicesData } = await supabase
      .from('services')
      .select('id, name, description, price, duration')
      .eq('business_id', businessId)
      .order('name', { ascending: true })

    setServices(servicesData || [])

    setLoading(false)
  }

  useEffect(() => {
    loadBusiness()
  }, [businessId])

  async function deleteBusiness() {
    if (!business) return

    const confirmed = window.confirm(
      `Delete ${business.name}? This should only be done when you are certain this client and their associated data should be removed.`
    )

    if (!confirmed) return

    setDeleting(true)
    setError('')

    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', business.id)

    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }

    router.push('/dashboard/businesses')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm text-slate-500">
            Loading client business...
          </p>
        </div>
      </main>
    )
  }

  if (error || !business) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link
            href="/dashboard/businesses"
            className="text-sm font-semibold text-pink-600"
          >
            ← Back to businesses
          </Link>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="font-semibold text-red-900">
              Unable to load business
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error || 'Business not found.'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href="/dashboard/businesses"
            className="text-sm font-semibold text-pink-600"
          >
            ← Back to businesses
          </Link>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">
                {business.name}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Client business management
              </p>
            </div>

            <button
              onClick={deleteBusiness}
              disabled={deleting}
              className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Client Business'}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href={`/dashboard/businesses/${businessId}/edit`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-950">
              Business Details
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Edit the client's business information and details.
            </p>

            <p className="mt-5 text-sm font-semibold text-pink-600">
              Edit business →
            </p>
          </Link>

          <Link
            href={`/dashboard/knowledge?business=${businessId}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-950">
              Business Knowledge
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add, edit and remove the information used by the Business
              Assistant.
            </p>

            <p className="mt-5 text-sm font-semibold text-pink-600">
              Manage knowledge ({knowledge.length}) →
            </p>
          </Link>

          <Link
            href={`/dashboard/services?business=${businessId}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-950">
              Services & Pricing
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage the services and prices extracted from this client's
              business information.
            </p>

            <p className="mt-5 text-sm font-semibold text-pink-600">
              Manage services ({services.length}) →
            </p>
          </Link>

          <Link
            href={`/dashboard/faqs?business=${businessId}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-950">
              FAQs
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create and maintain answers to common customer questions.
            </p>

            <p className="mt-5 text-sm font-semibold text-pink-600">
              Manage FAQs →
            </p>
          </Link>

          <Link
            href={`/dashboard/policies?business=${businessId}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-950">
              Policies
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage booking, cancellation, deposit and other business
              policies.
            </p>

            <p className="mt-5 text-sm font-semibold text-pink-600">
              Manage policies →
            </p>
          </Link>

          <Link
            href={
              assistant
                ? `/dashboard/assistants/${assistant.id}`
                : `/dashboard/assistants/new?business=${businessId}`
            }
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-950">
              Business Assistant
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {assistant
                ? 'Edit the assistant name, welcome message, instructions and status.'
                : 'Create a personalised Business Assistant for this client.'}
            </p>

            <p className="mt-5 text-sm font-semibold text-pink-600">
              {assistant ? 'Manage assistant →' : 'Create assistant →'}
            </p>
          </Link>

          <Link
            href={`/dashboard/conversations?business=${businessId}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-950">
              Conversations
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review customer conversations with this client's Business
              Assistant.
            </p>

            <p className="mt-5 text-sm font-semibold text-pink-600">
              View conversations →
            </p>
          </Link>

          <Link
            href={
              assistant
                ? `/dashboard/assistants/${assistant.id}/widget`
                : `/dashboard/assistants/new?business=${businessId}`
            }
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-950">
              Website Widget
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Generate the customer-facing Business Assistant widget for the
              client's website.
            </p>

            <p className="mt-5 text-sm font-semibold text-pink-600">
              Manage widget →
            </p>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-pink-100 bg-pink-50 p-6">
          <h2 className="font-semibold text-slate-950">
            Client management
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            This client business is the central record in MAKU. Its knowledge,
            services, FAQs, policies, Business Assistant, conversations and
            website widget are managed from this area.
          </p>
        </div>
      </section>
    </main>
  )
}
