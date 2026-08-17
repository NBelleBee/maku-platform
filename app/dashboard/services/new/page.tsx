'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Service = {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number | null
  duration: string | null
}

type Business = {
  id: string
  name: string
}

function ServiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const businessId = searchParams.get('businessId') || ''
  const editId = searchParams.get('edit')

  const [business, setBusiness] = useState<Business | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')

  const [loading, setLoading] = useState(Boolean(editId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!businessId) {
        setLoading(false)
        return
      }

      const { data: businessData } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('id', businessId)
        .single()

      setBusiness(businessData)

      if (editId) {
        const { data, error } = await supabase
          .from('services')
          .select(
            'id, business_id, name, description, price, duration'
          )
          .eq('id', editId)
          .eq('business_id', businessId)
          .single()

        if (error) {
          setError(error.message)
        } else if (data) {
          const service = data as Service

          setName(service.name)
          setDescription(service.description || '')
          setPrice(
            service.price !== null
              ? String(service.price)
              : ''
          )
          setDuration(service.duration || '')
        }
      }

      setLoading(false)
    }

    load()
  }, [businessId, editId])

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

    const values = {
      business_id: businessId,
      name: name.trim(),
      description: description.trim() || null,
      price: price ? Number(price) : null,
      duration: duration.trim() || null,
    }

    if (editId) {
      const { error } = await supabase
        .from('services')
        .update({
          name: values.name,
          description: values.description,
          price: values.price,
          duration: values.duration,
        })
        .eq('id', editId)
        .eq('business_id', businessId)

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('services')
        .insert(values)

      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    }

    router.push(`/dashboard/services?businessId=${businessId}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF7FC] p-10">
        <p className="text-[#6B7280]">Loading service...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC] text-[#111827]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button
          type="button"
          onClick={() =>
            router.push(
              businessId
                ? `/dashboard/services?businessId=${businessId}`
                : '/dashboard/services'
            )
          }
          className="text-sm font-medium text-[#6B7280] hover:text-[#FC72C2]"
        >
          ← Back to Services
        </button>

        <div className="mt-8">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#FC72C2]">
            {editId ? 'Edit Service' : 'New Service'}
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            {editId ? 'Edit Service' : 'Add Service'}
          </h1>

          <p className="mt-3 text-[#6B7280]">
            {business
              ? `Manage a service for ${business.name}.`
              : 'Manage a business service.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-[#FFB3DF] bg-white p-8 shadow-sm"
        >
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Service name
            </label>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Full Head Colour"
              className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
              required
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              placeholder="Describe the service..."
              className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Price (£)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="e.g. 85"
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Duration
              </label>

              <input
                value={duration}
                onChange={(event) =>
                  setDuration(event.target.value)
                }
                placeholder="e.g. 90 minutes"
                className="w-full rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#FC72C2] px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editId
                  ? 'Save Changes'
                  : 'Save Service'}
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
        <main className="min-h-screen bg-[#FFF7FC] p-10">
          <p className="text-[#6B7280]">Loading...</p>
        </main>
      }
    >
      <ServiceForm />
    </Suspense>
  )
}
