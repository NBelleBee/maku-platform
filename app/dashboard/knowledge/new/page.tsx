'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
}

function NewKnowledgePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessIdFromUrl = searchParams.get('businessId')

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessId, setBusinessId] = useState(businessIdFromUrl || '')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .order('name')

      if (!error) {
        setBusinesses(data || [])
      }
    }

    loadBusinesses()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!businessId) {
      setMessage('Please select a business.')
      return
    }

    if (!title.trim()) {
      setMessage('Please enter a knowledge base title.')
      return
    }

    if (!content.trim()) {
      setMessage('Please add the business knowledge.')
      return
    }

    setSaving(true)
    setMessage('')

    const { data, error } = await supabase
      .from('knowledge')
      .insert({
        business_id: businessId,
        title: title.trim(),
        content: content.trim(),
        source: 'MAKU Knowledge Base',
        priority: 1,
        is_active: true,
        version: 1,
        metadata: {
          type: 'business_knowledge_base',
        },
      })
      .select('id')
      .single()

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    const response = await fetch('/api/knowledge/embed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        knowledgeId: data.id,
        businessId,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(
        result.error || 'Knowledge was saved but could not be processed.'
      )
      setSaving(false)
      return
    }

    router.push(`/dashboard/knowledge?businessId=${businessId}`)
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC]">
      <header className="border-b border-[#FFB3DF] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <button
            type="button"
            onClick={() =>
              router.push(
                businessId
                  ? `/dashboard/knowledge?businessId=${businessId}`
                  : '/dashboard/knowledge'
              )
            }
            className="text-sm text-[#6B7280]"
          >
            ← Back to Knowledge Base
          </button>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-[#111827]">
            Create Knowledge Base
          </h1>

          <p className="mt-3 max-w-2xl text-[#6B7280]">
            Add the complete business information that the MAKU Business
            Assistant should use when helping customers.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-[#FFB3DF] bg-white p-8 shadow-sm"
        >
          <div>
            <label className="text-sm font-medium text-[#6B7280]">
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
            <label className="text-sm font-medium text-[#6B7280]">
              Knowledge base name
            </label>

            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Wowzabelle Master Knowledge Base"
              className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#6B7280]">
              Business knowledge
            </label>

            <p className="mt-1 text-sm text-[#6B7280]">
              Paste the complete business information here. Include services,
              pricing, opening hours, booking information, policies, FAQs,
              products, brand information and any other information customers
              may need.
            </p>

            <textarea
              required
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={`Example:

BUSINESS OVERVIEW
Wowzabelle is a...

SERVICES AND PRICING
...

OPENING HOURS
...

BOOKING
...

CANCELLATION POLICY
...

FAQS
...

CONTACT INFORMATION
...`}
              rows={24}
              className="mt-4 w-full rounded-2xl border border-[#FFB3DF] px-4 py-4 text-sm leading-6"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {message}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  businessId
                    ? `/dashboard/knowledge?businessId=${businessId}`
                    : '/dashboard/knowledge'
                )
              }
              className="rounded-xl border border-[#FFB3DF] px-5 py-3 text-sm font-medium text-[#6B7280]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#FC72C2] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Processing knowledge...' : 'Save & Process Knowledge'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFF7FC] p-10">
          <div className="mx-auto max-w-6xl text-[#6B7280]">
            Loading...
          </div>
        </main>
      }
    >
      <NewKnowledgePage />
    </Suspense>
  )
}