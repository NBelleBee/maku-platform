'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

function NewServiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessId = searchParams.get('businessId')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    if (!businessId) {
      setError('No business selected.')
      return
    }

    if (!name.trim()) {
      setError('Please enter a service name.')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('services').insert({
      business_id: businessId,
      name: name.trim(),
      description: description.trim() || null,
      price: price ? Number(price) : null,
      duration: duration ? Number(duration) : null,
    })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push(`/dashboard/services?businessId=${businessId}`)
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC] text-[#111827]">
      <div className="container py-12">
        <button
          type="button"
          onClick={() =>
            router.push(
              businessId
                ? `/dashboard/services?businessId=${businessId}`
                : '/dashboard/services'
            )
          }
          className="text-sm font-medium text-[#6B7280] hover:text-[#111827]"
        >
          ← Back to Services
        </button>

        <h1 className="mt-4 text-3xl font-bold text-[#111827]">
          Add Service
        </h1>

        <p className="mt-2 text-[#6B7280]">
          Add a service that this business offers.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-[#FFB3DF] bg-white p-8 shadow-sm"
        >
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#111827]"
              >
                Service name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Full Head Colour"
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-slate-950"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-[#111827]"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the service..."
                rows={4}
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-[#111827]"
                >
                  Price (£)
                </label>

                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="e.g. 85"
                  className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-sm font-medium text-[#111827]"
                >
                  Duration (minutes)
                </label>

                <input
                  id="duration"
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  placeholder="e.g. 120"
                  className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-slate-950"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#FC72C2] px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function NewServicePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFF7FC] p-12">
          <p className="text-[#6B7280]">Loading...</p>
        </main>
      }
    >
      <NewServiceForm />
    </Suspense>
  )
}