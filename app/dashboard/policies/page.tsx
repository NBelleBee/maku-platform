'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
}

type Policy = {
  id: string
  business_id: string
  title: string
  content: string
  created_at: string
}

function PoliciesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const businessIdFromUrl = searchParams.get('businessId')

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessId, setBusinessId] = useState(businessIdFromUrl || '')
  const [policies, setPolicies] = useState<Policy[]>([])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
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
      loadPolicies(businessId)
    }
  }, [businessId])

  async function loadPolicies(id: string) {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('policies')
      .select('id, business_id, title, content, created_at')
      .eq('business_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setPolicies([])
    } else {
      setPolicies(data || [])
    }

    setLoading(false)
  }

  function changeBusiness(id: string) {
    setBusinessId(id)
    router.replace(`/dashboard/policies?businessId=${id}`)
    resetForm()
  }

  function startEditing(policy: Policy) {
    setEditingId(policy.id)
    setTitle(policy.title)
    setContent(policy.content)
    setError('')
    setMessage('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!businessId) {
      setError('Please select a business.')
      return
    }

    if (!title.trim()) {
      setError('Please enter a policy title.')
      return
    }

    if (!content.trim()) {
      setError('Please enter the policy content.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    if (editingId) {
      const { error } = await supabase
        .from('policies')
        .update({
          title: title.trim(),
          content: content.trim(),
        })
        .eq('id', editingId)
        .eq('business_id', businessId)

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }

      setMessage('Policy updated successfully.')
    } else {
      const { error } = await supabase
        .from('policies')
        .insert({
          business_id: businessId,
          title: title.trim(),
          content: content.trim(),
        })

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }

      setMessage('Policy added successfully.')
    }

    resetForm()
    await loadPolicies(businessId)

    setSaving(false)
  }

  async function deletePolicy(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this policy?'
    )

    if (!confirmed) return

    setDeletingId(id)
    setError('')
    setMessage('')

    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId)

    if (error) {
      setError(error.message)
      setDeletingId(null)
      return
    }

    setPolicies((current) =>
      current.filter((policy) => policy.id !== id)
    )

    if (editingId === id) {
      resetForm()
    }

    setMessage('Policy deleted successfully.')
    setDeletingId(null)
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
            Policies
          </h1>

          <p className="mt-3 max-w-2xl text-[#6B7280]">
            Manage the booking, cancellation, deposit and other policies for
            each client business.
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
            onChange={(event) => changeBusiness(event.target.value)}
            className="mt-2 w-full max-w-md rounded-xl border border-[#FFB3DF] bg-white px-4 py-3 outline-none focus:border-[#FC72C2]"
          >
            <option value="">Select a business</option>

            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border border-[#FFB3DF] bg-white p-8 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {editingId ? 'Edit Policy' : 'Add Policy'}
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Store the official policy wording for this client.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setError('')
                  setMessage('')
                }}
                className="text-sm text-[#6B7280] hover:text-[#FC72C2]"
              >
                Cancel editing
              </button>
            )}
          </div>

          <div className="mt-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium"
            >
              Policy title
            </label>

            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Cancellation Policy"
              className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-medium"
            >
              Policy content
            </label>

            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Enter the official policy..."
              rows={8}
              className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 leading-6 outline-none focus:border-[#FC72C2]"
            />
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-[#FFB3DF] bg-[#FFF7FC] p-4 text-sm">
              {message}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving || !businessId}
              className="rounded-xl bg-[#FC72C2] px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Policy'
                  : 'Add Policy'}
            </button>
          </div>
        </form>

        <section className="mt-8 overflow-hidden rounded-3xl border border-[#FFB3DF] bg-white">
          <div className="border-b border-[#FFB3DF] p-6">
            <h2 className="text-xl font-semibold">
              {businesses.find(
                (business) => business.id === businessId
              )?.name || 'Business'}{' '}
              Policies
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">
              {policies.length} polic
              {policies.length === 1 ? 'y' : 'ies'}
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-[#6B7280]">
              Loading policies...
            </div>
          ) : policies.length === 0 ? (
            <div className="p-8">
              <h3 className="font-semibold">
                No policies have been added yet.
              </h3>

              <p className="mt-2 text-sm text-[#6B7280]">
                Add the official policies customers need to know.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3D5E8]">
              {policies.map((policy) => (
                <div key={policy.id} className="p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:justify-between">
                    <div className="max-w-3xl">
                      <h3 className="font-semibold">
                        {policy.title}
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6B7280]">
                        {policy.content}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(policy)}
                        className="rounded-xl border border-[#FFB3DF] px-4 py-2 text-sm font-medium hover:bg-[#FFF7FC]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deletePolicy(policy.id)}
                        disabled={deletingId === policy.id}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === policy.id
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

export default function PoliciesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFF7FC] p-10">
          <p className="text-[#6B7280]">Loading policies...</p>
        </main>
      }
    >
      <PoliciesContent />
    </Suspense>
  )
}
