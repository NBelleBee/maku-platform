'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
}

type Faq = {
  id: string
  business_id: string
  question: string
  answer: string
  created_at: string
}

function FaqsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const businessIdFromUrl = searchParams.get('businessId')

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessId, setBusinessId] = useState(businessIdFromUrl || '')
  const [faqs, setFaqs] = useState<Faq[]>([])

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .order('name')

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const list = data || []
      setBusinesses(list)

      if (!businessId && list.length > 0) {
        setBusinessId(list[0].id)
      }

      setLoading(false)
    }

    loadBusinesses()
  }, [businessId])

  useEffect(() => {
    if (businessId) {
      loadFaqs(businessId)
    }
  }, [businessId])

  async function loadFaqs(id: string) {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('faqs')
      .select('id, business_id, question, answer, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setFaqs([])
    } else {
      setFaqs(data || [])
    }

    setLoading(false)
  }

  function startEditing(faq: Faq) {
    setEditingId(faq.id)
    setQuestion(faq.question)
    setAnswer(faq.answer)
    setError('')
    setMessage('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function resetForm() {
    setEditingId(null)
    setQuestion('')
    setAnswer('')
    setError('')
    setMessage('')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!businessId) {
      setError('Please select a business.')
      return
    }

    if (!question.trim()) {
      setError('Please enter a question.')
      return
    }

    if (!answer.trim()) {
      setError('Please enter an answer.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    if (editingId) {
      const { error } = await supabase
        .from('faqs')
        .update({
          question: question.trim(),
          answer: answer.trim(),
        })
        .eq('id', editingId)
        .eq('business_id', businessId)

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }

      setMessage('FAQ updated successfully.')
    } else {
      const { error } = await supabase
        .from('faqs')
        .insert({
          business_id: businessId,
          question: question.trim(),
          answer: answer.trim(),
        })

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }

      setMessage('FAQ added successfully.')
    }

    resetForm()

    await loadFaqs(businessId)

    setSaving(false)
  }

  async function deleteFaq(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this FAQ?'
    )

    if (!confirmed) {
      return
    }

    setDeletingId(id)
    setError('')
    setMessage('')

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId)

    if (error) {
      setError(error.message)
      setDeletingId(null)
      return
    }

    setFaqs((current) =>
      current.filter((faq) => faq.id !== id)
    )

    if (editingId === id) {
      resetForm()
    }

    setMessage('FAQ deleted successfully.')
    setDeletingId(null)
  }

  function changeBusiness(id: string) {
    setBusinessId(id)

    router.replace(`/dashboard/faqs?businessId=${id}`)

    resetForm()
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC] text-[#111827]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/dashboard/businesses"
          className="text-sm font-medium text-[#6B7280] hover:text-[#FC72C2]"
        >
          ← Back to Businesses
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#FC72C2]">
            Client Management
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            FAQs
          </h1>

          <p className="mt-3 max-w-2xl text-[#6B7280]">
            Create and maintain frequently asked questions for each client
            business. These answers help the Business Assistant provide
            accurate customer support.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[#FFB3DF] bg-white p-6">
          <label
            htmlFor="business"
            className="text-sm font-medium text-[#6B7280]"
          >
            Client business
          </label>

          <select
            id="business"
            value={businessId}
            onChange={(event) =>
              changeBusiness(event.target.value)
            }
            className="mt-2 w-full max-w-md rounded-xl border border-[#FFB3DF] bg-white px-4 py-3 outline-none focus:border-[#FC72C2]"
          >
            <option value="">Select a business</option>

            {businesses.map((business) => (
              <option
                key={business.id}
                value={business.id}
              >
                {business.name}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border border-[#FFB3DF] bg-white p-8 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {editingId ? 'Edit FAQ' : 'Add FAQ'}
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Add a question and the exact answer the assistant should use.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-medium text-[#6B7280] hover:text-[#FC72C2]"
              >
                Cancel editing
              </button>
            )}
          </div>

          <div className="mt-6">
            <label
              htmlFor="question"
              className="mb-2 block text-sm font-medium"
            >
              Customer question
            </label>

            <input
              id="question"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="e.g. Do you require a deposit?"
              className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="answer"
              className="mb-2 block text-sm font-medium"
            >
              Answer
            </label>

            <textarea
              id="answer"
              value={answer}
              onChange={(event) =>
                setAnswer(event.target.value)
              }
              placeholder="Enter the official answer for this business..."
              rows={6}
              className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 leading-6 outline-none focus:border-[#FC72C2]"
            />
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-[#FFB3DF] bg-[#FFF7FC] p-4 text-sm text-[#111827]">
              {message}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving || !businessId}
              className="rounded-xl bg-[#FC72C2] px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update FAQ'
                  : 'Add FAQ'}
            </button>
          </div>
        </form>

        <section className="mt-8 rounded-3xl border border-[#FFB3DF] bg-white">
          <div className="border-b border-[#FFB3DF] p-6">
            <h2 className="text-xl font-semibold">
              {businessId
                ? `${
                    businesses.find(
                      (business) =>
                        business.id === businessId
                    )?.name || 'Business'
                  } FAQs`
                : 'Business FAQs'}
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">
              {faqs.length} FAQ{faqs.length === 1 ? '' : 's'}
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-[#6B7280]">
              Loading FAQs...
            </div>
          ) : faqs.length === 0 ? (
            <div className="p-8">
              <h3 className="font-semibold">
                No FAQs have been added yet.
              </h3>

              <p className="mt-2 text-sm text-[#6B7280]">
                Add the questions customers commonly ask this business.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3D5E8]">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-3xl">
                      <h3 className="font-semibold">
                        {faq.question}
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6B7280]">
                        {faq.answer}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(faq)}
                        className="rounded-xl border border-[#FFB3DF] px-4 py-2 text-sm font-medium hover:bg-[#FFF7FC]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteFaq(faq.id)}
                        disabled={deletingId === faq.id}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === faq.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default function FaqsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFF7FC] p-10">
          <p className="text-[#6B7280]">
            Loading FAQs...
          </p>
        </main>
      }
    >
      <FaqsContent />
    </Suspense>
  )
}
