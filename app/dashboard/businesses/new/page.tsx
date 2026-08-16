'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function NewBusinessPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    setSaving(true)
    setMessage('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage('You are not signed in. Please sign in again.')
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: name.trim(),
        industry: industry.trim(),
        website: website.trim() || null,
        email: email.trim() || null,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('CREATE CLIENT ERROR:', error)
      setMessage(`Could not create client: ${error.message}`)
      setSaving(false)
      return
    }

    console.log('CLIENT CREATED:', data)

    setMessage('Client created successfully.')

    setTimeout(() => {
      router.push('/dashboard/businesses')
      router.refresh()
    }, 800)
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC]">
      <div className="mx-auto max-w-3xl px-6 py-12">

        <button
          onClick={() => router.push('/dashboard/businesses')}
          className="text-sm text-[#6B7280]"
        >
          ← Back to Clients
        </button>

        <h1 className="mt-8 text-4xl font-semibold text-[#111827]">
          Add Client Business
        </h1>

        <p className="mt-3 text-[#6B7280]">
          Add a business that MAKU will manage a Business Assistant for.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-[#FFB3DF] bg-white p-8"
        >

          <div>
            <label className="text-sm font-medium text-[#6B7280]">
              Business name
            </label>

            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luxe Hair Studio"
              className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#6B7280]">
              Industry
            </label>

            <input
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Hair & Beauty"
              className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#6B7280]">
              Website
            </label>

            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Leave blank if they don't have one"
              className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#6B7280]">
              Client email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="mt-2 w-full rounded-xl border border-[#FFB3DF] px-4 py-3"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-[#FFB3DF] bg-[#FFF7FC] p-4 text-sm text-[#6B7280]">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#FC72C2] px-5 py-3 font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Client Business'}
          </button>

        </form>
      </div>
    </main>
  )
}
