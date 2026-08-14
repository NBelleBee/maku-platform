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
    let end = start + CHUNK_SIZE

    if (end < cleanedText.length) {
      const paragraphBreak = cleanedText.lastIndexOf('\n\n', end)

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
    } else {
      end = cleanedText.length
    }

    const chunk = cleanedText.slice(start, end).trim()

    if (chunk) {
      chunks.push(chunk)
    }

    if (end >= cleanedText.length) {
      break
    }

    start = Math.max(end - CHUNK_OVERLAP, start + 1)
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
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md')

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

      if (!title) {
        setTitle(
          file.name
            .replace(/\.(txt|md)$/i, '')
            .replace(/[-_]+/g, ' ')
            .trim()
        )
      }
    } catch {
      setError('We could not read this file. Please try again.')
      setFileName('')
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      setError('Please enter a name for this knowledge base.')
      return
    }

    if (!trimmedContent) {
      setError(
        'Please paste your business information or upload a knowledge file.'
      )
      return
    }

    if (chunks.length === 0) {
      setError('There is no usable knowledge to save.')
      return
    }

    setSaving(true)

    const supabase = createClient()

    const rows = chunks.map((chunk, index) => ({
      business_id: businessId,
      title: `${trimmedTitle} — Part ${index + 1}`,
      content: chunk,
    }))

    const { error: insertError } = await supabase
      .from('knowledge')
      .insert(rows)

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    setSuccess(
      `${chunks.length} knowledge chunks were created successfully.`
    )

    setSaving(false)

    setTimeout(() => {
      router.push(
        `/dashboard/businesses/${businessId}/knowledge`
      )
      router.refresh()
    }, 800)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link
            href={`/dashboard/businesses/${businessId}/knowledge`}
            className="text-sm font-medium text-slate-600"
          >
            ← Back to Knowledge Base
          </Link>

          <div className="mt-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Knowledge Base
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Add Business Knowledge
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Give MAKU one complete source of business information.
              The content will automatically be divided into smaller
              knowledge sections for the Business Assistant.
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
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-semibold">
              1. Name your knowledge base
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Use a clear name such as Business Information,
              Client Knowledge Base or Salon Information.
            </p>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Complete Business Information"
              className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold">
                  2. Add your knowledge
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Paste the complete business information below, or
                  upload a TXT or Markdown file.
                </p>
              </div>

              <label className="cursor-pointer whitespace-nowrap rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium transition hover:bg-slate-50">
                Upload File

                <input
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {fileName && (
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Uploaded: <span className="font-medium">{fileName}</span>
              </div>
            )}

            <textarea
              value={content}
              onChange={(event) => {
                setContent(event.target.value)
                setSuccess('')
                setError('')
              }}
              placeholder={`Paste the complete business information here.

For example:

ABOUT THE BUSINESS
Our salon is...

SERVICES
Full Head Highlights — £150 — approximately 2 hours
Balayage — £180 — approximately 3 hours

BOOKING
Customers can book through...

CANCELLATION POLICY
...

OPENING HOURS
...

FREQUENTLY ASKED QUESTIONS
...

The more complete the information, the better the Business Assistant can answer customer questions.`}
              rows={22}
              className="mt-5 w-full resize-y rounded-xl border border-slate-300 px-4 py-4 text-sm leading-6 outline-none transition focus:border-slate-900"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <span>
                {content.length.toLocaleString()} characters
              </span>

              <span>
                {chunks.length > 0
                  ? `${chunks.length} knowledge ${
                      chunks.length === 1 ? 'chunk' : 'chunks'
                    } will be created`
                  : 'No knowledge chunks yet'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-semibold">
              3. Automatic knowledge processing
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  One source
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep all of the business information together.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Smart chunking
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Large information is divided into smaller,
                  useful sections.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Ready for retrieval
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The chunks can later be searched to answer
                  customer questions accurately.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/dashboard/businesses/${businessId}/knowledge`}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || chunks.length === 0}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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


