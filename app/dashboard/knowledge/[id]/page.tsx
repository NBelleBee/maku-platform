'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Knowledge = {
  id: string
  business_id: string
  title: string
  content: string
  created_at: string
  source: string | null
  priority: number | null
  is_active: boolean | null
  version: number | null
}

export default function KnowledgeManagePage() {
  const params = useParams()
  const router = useRouter()

  const id = params.id as string

  const [knowledge, setKnowledge] = useState<Knowledge | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadKnowledge() {
      const { data, error } = await supabase
        .from('knowledge')
        .select(
          'id, business_id, title, content, created_at, source, priority, is_active, version'
        )
        .eq('id', id)
        .maybeSingle()

      if (error) {
        setMessage(error.message)
        return
      }

      if (!data) {
        setMessage('Knowledge base not found.')
        return
      }

      setKnowledge(data)
      setContent(data.content)
    }

    loadKnowledge()
  }, [id])

  async function saveKnowledge() {
    if (!knowledge) return

    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('knowledge')
      .update({
        content: content.trim(),
        version: (knowledge.version ?? 1) + 1,
      })
      .eq('id', knowledge.id)

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    setKnowledge({
      ...knowledge,
      content: content.trim(),
      version: (knowledge.version ?? 1) + 1,
    })

    setMessage('Knowledge saved successfully.')
    setSaving(false)
  }

  if (!knowledge) {
    return (
      <main className="min-h-screen bg-[#FFF7FC] p-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-[#FFB3DF] bg-white p-8">
          <p className="text-sm text-[#6B7280]">
            {message || 'Loading knowledge base...'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC] text-[#111827]">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <button
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/knowledge?businessId=${knowledge.business_id}`
            )
          }
          className="mb-8 text-sm text-[#6B7280] hover:text-[#111827]"
        >
          ← Back to Knowledge Base
        </button>

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            Knowledge Management
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[#111827]">
            {knowledge.title}
          </h1>

          <p className="mt-3 text-[#6B7280]">
            Manage the complete business knowledge used by the MAKU Business
            Assistant.
          </p>
        </div>

        <div className="space-y-6">

          <div className="rounded-3xl border border-[#FFB3DF] bg-white p-6">
            <div className="grid gap-4 md:grid-cols-3">

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Status
                </p>
                <p className="mt-1 font-medium">
                  {knowledge.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Version
                </p>
                <p className="mt-1 font-medium">
                  {knowledge.version ?? 1}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Source
                </p>
                <p className="mt-1 font-medium">
                  {knowledge.source || 'MAKU Knowledge Base'}
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-3xl border border-[#FFB3DF] bg-white p-8">

            <label className="text-sm font-medium text-[#6B7280]">
              Business Knowledge
            </label>

            <p className="mt-2 text-sm text-[#6B7280]">
              This is the complete knowledge source used by the client's
              Business Assistant.
            </p>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={30}
              className="mt-4 w-full rounded-2xl border border-[#FFB3DF] px-5 py-4 text-sm leading-7 outline-none focus:border-slate-400"
            />

            {message && (
              <div className="mt-4 rounded-xl border border-[#FFB3DF] bg-[#FFF7FC] p-4 text-sm text-[#6B7280]">
                {message}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={saveKnowledge}
                disabled={saving}
                className="rounded-xl bg-[#FC72C2] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Knowledge'}
              </button>
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}
