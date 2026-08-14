```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function NewServicePage() {
  const params = useParams()
  const router = useRouter()

  const businessId = params.id as string
  const supabase = createClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSaving(true)
    setError('')

    const { error: insertError } = await supabase
      .from('services')
      .insert({
        business_id: businessId,
        name,
        description: description || null,
        price: price ? Number(price) : null,
        duration: duration || null,
      })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push(`/dashboard/businesses/${businessId}/services`)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link
            href={`/dashboard/businesses/${businessId}/services`}
            className="text-sm font-medium text-slate-600"
          >
            ← Back to Services
          </Link>

          <div className="mt-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Services
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Add Service
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add a service, price and duration for this business.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium">
              Service name
            </label>

            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Full Head Highlights"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what is included in the service."
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">
                Price (£)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="150"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Duration
              </label>

              <input
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="2 hours"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href={`/dashboard/businesses/${businessId}/services`}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
```
