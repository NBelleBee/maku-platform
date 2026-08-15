'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const CHUNK_SIZE = 1200
const CHUNK_OVERLAP = 200

function chunkText(text: string): string[] {
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!cleanedText) {
    return []
  }

  if (cleanedText.length <= CHUNK_SIZE) {
    return [cleanedText]
  }

  const chunks: string[] = []
  let start = 0

  while (start < cleanedText.length) {
    let end = Math.min(
      start + CHUNK_SIZE,
      cleanedText.length
    )

    if (end < cleanedText.length) {
      const paragraphBreak =
        cleanedText.lastIndexOf('\n\n', end)

      const sentenceBreak = Math.max(
        cleanedText.lastIndexOf('. ', end),
        cleanedText.lastIndexOf('? ', end),
        cleanedText.lastIndexOf('! ', end)
      )

      if (paragraphBreak > start + 600) {
        end = paragraphBreak
      } else if (sentenceBreak > start + 600) {
        end = sentenceBreak + 1
      }
    }

    const chunk = cleanedText
      .slice(start, end)
      .trim()

    if (chunk) {
      chunks.push(chunk)
    }

    if (end >= cleanedText.length) {
      break
    }

    start = Math.max(
      end - CHUNK_OVERLAP,
      start + 1
    )
  }

  return chunks
}

export default function NewKnowledgePage() {
  const params = useParams()
  const router = useRouter()

  const businessId = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const chunks = chunkText(content)

  function goToKnowledgeBase() {
    router.push(
      `/dashboard/businesses/${businessId}/knowledge`
    )
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError('')
    setSuccess('')
    setFileName(file.name)

    const allowedTypes = [
      'text/plain',
      'text/markdown',
    ]

    const isAllowed =
      allowedTypes.includes(file.type) ||
      file.name.toLowerCase().endsWith('.txt') ||
      file.name.toLowerCase().endsWith('.md')

    if (!isAllowed) {
      setError(
        'Please upload a TXT or Markdown (.md) knowledge file.'
      )
      setFileName('')
      return
    }

    try {
      const text = await file.text()

      setContent(text)

      if (!title.trim()) {
        setTitle(
          file.name
            .replace(/\.(txt|md)$/i, '')
            .replace(/[-_]+/g, ' ')
            .trim()
        )
      }
    } catch {
      setError(
        'We could not read this file. Please try again.'
      )
      setFileName('')
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const trimmedTitle = title.trim()
      const trimmedContent = content.trim()

      if (!trimmedTitle) {
        setError(
          'Please enter a name for this knowledge base.'
        )
        setSaving(false)
        return
      }

      if (!trimmedContent) {
        setError(
          'Please paste your business information or upload a knowledge file.'
        )
        setSaving(false)
        return
      }

      if (chunks.length === 0) {
        setError(
          'There is no usable knowledge to save.'
        )
        setSaving(false)
        return
      }

      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError(
          'You are not currently signed in to MAKU. Please sign in again.'
        )
        setSaving(false)
        return
      }

      const {
        data: business,
        error: businessError,
      } = await supabase
        .from('businesses')
        .select('id, name, owner_id')
        .eq('id', businessId)
        .single()

      if (businessError || !business) {
        setError(
          'Could not find this business.'
        )
        setSaving(false)
        return
      }

      if (business.owner_id !== user.id) {
        setError(
          'You do not have permission to add knowledge to this business.'
        )
        setSaving(false)
        return
      }

      const { data: knowledge, error: insertError } =
        await supabase
          .from('knowledge')
          .insert({
            business_id: businessId,
            title: trimmedTitle,
            content: trimmedContent,
            is_active: true,
          })
          .select('id')
          .single()

      if (insertError || !knowledge) {
        setError(
          insertError?.message ??
            'Knowledge could not be saved.'
        )
        setSaving(false)
        return
      }

      setSuccess(
        'Business knowledge saved. Creating searchable sections...'
      )

      const embeddingResponse = await fetch(
        '/api/knowledge/embed',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessId,
          }),
        }
      )

      const embeddingResult =
        await embeddingResponse.json()

      if (!embeddingResponse.ok) {
        setError(
          embeddingResult?.error ??
            'Knowledge was saved, but searchable sections could not be created.'
        )
        setSaving(false)
        return
      }

      const chunksCreated =
        embeddingResult.chunksCreated ??
        chunks.length

      setSuccess(
        `${chunksCreated} ${
          chunksCreated === 1
            ? 'knowledge section'
            : 'knowledge sections'
        } created successfully for ${business.name}.`
      )

      setTimeout(() => {
        router.push(
          `/dashboard/businesses/${businessId}/knowledge`
        )
        router.refresh()
      }, 1200)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'An unexpected error occurred.'
      )
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={goToKnowledgeBase}
              disabled={saving}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Back to Knowledge Base
            </button>

            <Link
              href="/dashboard/businesses"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Businesses
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Knowledge Base
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Add Business Knowledge
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Add one complete source of business information.
              MAKU automatically divides it into searchable
              knowledge sections.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700"
            >
              {success}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold">
              1. Name your knowledge source
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Give this source a clear internal name.
            </p>

            <input
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setError('')
                setSuccess('')
              }}
              placeholder="e.g. Complete Business Information"
              disabled={saving}
              className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  2. Add your business knowledge
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Upload a TXT or Markdown file, or paste
                  the complete business information below.
                </p>
              </div>

              <label
                className={`inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium transition hover:bg-slate-50 ${
                  saving
                    ? 'pointer-events-none opacity-50'
                    : ''
                }`}
              >
                Upload File

                <input
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  onChange={handleFileChange}
                  disabled={saving}
                  className="hidden"
                />
              </label>
            </div>

            {fileName && (
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Uploaded:{' '}
                <span className="font-medium">
                  {fileName}
                </span>
              </div>
            )}

            <textarea
              value={content}
              onChange={(event) => {
                setContent(event.target.value)
                setSuccess('')
                setError('')
              }}
              disabled={saving}
              placeholder={`Paste the complete business information here.

ABOUT THE BUSINESS

SERVICES

PRICES

BOOKING INFORMATION

OPENING HOURS

CANCELLATION POLICY

DEPOSIT POLICY

FAQs

PRODUCTS

CONTACT INFORMATION

Anything a customer may need to know about the business can be included here.`}
              rows={22}
              className="mt-5 w-full resize-y rounded-xl border border-slate-300 px-4 py-4 text-sm leading-6 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <span>
                {content.length.toLocaleString()} characters
              </span>

              <span>
                {chunks.length > 0
                  ? `${chunks.length} ${
                      chunks.length === 1
                        ? 'knowledge section'
                        : 'knowledge sections'
                    } will be created`
                  : 'No knowledge sections yet'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold">
              3. Automatic processing
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  One source
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep the client's business information
                  together.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Smart chunking
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Large documents are divided at sensible
                  paragraph and sentence boundaries.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Search-ready
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Each knowledge section receives a
                  searchable embedding.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={goToKnowledgeBase}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                chunks.length === 0 ||
                !title.trim()
              }
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Processing Knowledge...'
                : 'Process Knowledge'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

