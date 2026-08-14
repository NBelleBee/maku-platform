```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type Knowledge = {
  id: string
  title: string
  content: string
  source: string | null
  priority: number | null
  expires_at: string | null
  is_active: boolean | null
}

export default function KnowledgePage() {
  const params = useParams()
  const businessId = params.id as string
  const supabase = createClient()

  const [knowledge, setKnowledge] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [priority, setPriority] = useState('1')

  async function loadKnowledge() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('knowledge')
      .select(
        'id, title, content, source, priority, expires_at, is_active'
      )
      .eq('business_id', businessId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setKnowledge(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (businessId) {
      loadKnowledge()
    }
  }, [businessId])

  async function addKnowledge(event: React.FormEvent) {
    event.preventDefault()

    if (!title.trim() || !content.trim()) {
      setError('Please enter both a title and knowledge content.')
      return
    }

    setSaving(true)
    setError('')

    const { error } = await supabase.from('knowledge').insert({
      business_id: businessId,
      title: title.trim(),
      content: content.trim(),
      source: source.trim() || null,
      priority: Number(priority) || 1,
      is_active: true,
    })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    setTitle('')
    setContent('')
    setSource('')
    setPriority('1')
    setShowForm(false)
    setSaving(false)

    await loadKnowledge()
  }

  async function deleteKnowledge(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this knowledge item?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('knowledge')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId)

    if (error) {
      setError(error.message)
      return
    }

    await loadKnowledge()
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href={`/dashboard/businesses/${businessId}`}
            className="text-sm font-medium text-slate-600"
          >
            ← Back to Business
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                Knowledge Base
              </p>

              <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                Business Knowledge
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Add the information this Business Assistant should use when
                responding to customers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm(!showForm)
                setError('')
              }}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              {showForm ? 'Cancel' : '+ Add Knowledge'}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={addKnowledge}
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              Add Knowledge
            </h2>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. About Bellami"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Content
                </label>

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Enter the business information..."
                  rows={8}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Source
                  </label>

                  <input
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                    placeholder="e.g. Client onboarding form"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Priority
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Knowledge'}
              </button>
            </div>
          </form>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Knowledge Items
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Business-specific information available to the assistant.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">
              Loading knowledge...
            </p>
          ) : knowledge.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="text-sm text-slate-500">
                No knowledge has been added for this business yet.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                + Add Knowledge
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {knowledge.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {item.content}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                        {item.source && <span>Source: {item.source}</span>}
                        <span>Priority: {item.priority ?? 1}</span>
                        <span>
                          {item.is_active === false ? 'Inactive' : 'Active'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteKnowledge(item.id)}
                      className="text-sm font-medium text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
```
