'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Business = {
  id: string
  name: string
  industry: string
  website: string | null
  email: string | null
  phone: string | null
  booking_url: string | null
  opening_hours: string | null
  brand_voice: string | null
}

export default function EditBusinessPage() {
  const params = useParams()
  const router = useRouter()

  const businessId = String(params.id)

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBusiness() {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('businesses')
        .select(
          'id, name, industry, website, email, phone, booking_url, opening_hours, brand_voice'
        )
        .eq('id', businessId)
        .single()

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setBusiness(data)
      setLoading(false)
    }

    if (businessId) {
      loadBusiness()
    }
  }, [businessId])

  function updateField(
    field: keyof Business,
    value: string
  ) {
    setBusiness((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!business) return

    if (!business.name.trim()) {
      setError('Business name is required.')
      return
    }

    if (!business.industry.trim()) {
      setError('Industry is required.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    const { error } = await supabase
      .from('businesses')
      .update({
        name: business.name.trim(),
        industry: business.industry.trim(),
        website: business.website?.trim() || null,
        email: business.email?.trim() || null,
        phone: business.phone?.trim() || null,
        booking_url: business.booking_url?.trim() || null,
        opening_hours: business.opening_hours?.trim() || null,
        brand_voice: business.brand_voice?.trim() || null,
      })
      .eq('id', business.id)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    setMessage('Business information saved successfully.')
    setSaving(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF7FC] p-10 text-[#6B7280]">
        Loading business...
      </main>
    )
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-[#FFF7FC] p-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-[#111827]">
            Business not found
          </h1>

          <Link
            href="/dashboard/businesses"
            className="mt-4 inline-block text-[#FC72C2]"
          >
            ← Back to businesses
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC] text-[#111827]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href={`/dashboard/businesses/${business.id}`}
          className="text-sm font-medium text-[#6B7280] hover:text-[#FC72C2]"
        >
          ← Back to {business.name}
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#FC72C2]">
            Client Business
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Edit {business.name}
          </h1>

          <p className="mt-3 text-[#6B7280]">
            Update the business information used across this client's MAKU
            Business Assistant.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-[#FFB3DF] bg-white p-8 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Business name
              </label>

              <input
                id="name"
                value={business.name}
                onChange={(event) =>
                  updateField('name', event.target.value)
                }
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="industry"
                className="mb-2 block text-sm font-medium"
              >
                Industry
              </label>

              <input
                id="industry"
                value={business.industry}
                onChange={(event) =>
                  updateField('industry', event.target.value)
                }
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className="mb-2 block text-sm font-medium"
              >
                Website
              </label>

              <input
                id="website"
                type="url"
                value={business.website || ''}
                onChange={(event) =>
                  updateField('website', event.target.value)
                }
                placeholder="https://example.com"
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Business email
              </label>

              <input
                id="email"
                type="email"
                value={business.email || ''}
                onChange={(event) =>
                  updateField('email', event.target.value)
                }
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium"
              >
                Phone
              </label>

              <input
                id="phone"
                value={business.phone || ''}
                onChange={(event) =>
                  updateField('phone', event.target.value)
                }
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
              />
            </div>

            <div>
              <label
                htmlFor="booking_url"
                className="mb-2 block text-sm font-medium"
              >
                Booking URL
              </label>

              <input
                id="booking_url"
                type="url"
                value={business.booking_url || ''}
                onChange={(event) =>
                  updateField('booking_url', event.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="opening_hours"
              className="mb-2 block text-sm font-medium"
            >
              Opening hours
            </label>

            <textarea
              id="opening_hours"
              value={business.opening_hours || ''}
              onChange={(event) =>
                updateField('opening_hours', event.target.value)
              }
              rows={5}
              placeholder={`Monday: 9am–6pm
Tuesday: 9am–6pm
Wednesday: 9am–6pm
...`}
              className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="brand_voice"
              className="mb-2 block text-sm font-medium"
            >
              Brand voice
            </label>

            <textarea
              id="brand_voice"
              value={business.brand_voice || ''}
              onChange={(event) =>
                updateField('brand_voice', event.target.value)
              }
              rows={5}
              placeholder="Describe how the business communicates with customers..."
              className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
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

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/businesses/${business.id}`)
              }
              className="rounded-xl border border-[#FFB3DF] px-5 py-3 text-sm font-medium text-[#6B7280]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#FC72C2] px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Business'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
