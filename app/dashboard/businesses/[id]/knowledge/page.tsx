

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const CHUNK_SIZE = 1200
const CHUNK_OVERLAP = 200

type Business = {
  id: string
  name: string
  owner_id: string | null
}

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
    let end = Math.min(start + CHUNK_SIZE, cleanedText.length)

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

    const supabase = createClient()

    try {
      /*
       * STEP 1
       * Get the authenticated user.
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        setError(
          `Authentication check failed: ${userError.message}`
        )
        setSaving(false)
        return
      }

      if (!user) {
        setError(
          'You are not currently signed in to MAKU. Please sign out, sign back in, and try again.'
        )
        setSaving(false)
        return
      }

      /*
       * STEP 2
       * Get the business and verify ownership.
       */
      const {
        data: business,
        error: businessError,
      } = await supabase
        .from('businesses')
        .select('id, name, owner_id')
        .eq('id', businessId)
        .single()

      if (businessError) {
        setError(
          `Could not load this business: ${businessError.message}`
        )
        setSaving(false)
        return
      }

      if (!business) {
        setError('Business not found.')
        setSaving(false)
        return
      }

      const businessRecord = business as Business

      if (!businessRecord.owner_id) {
        setError(
          'This business does not have an owner assigned yet.'
        )
        setSaving(false)
        return
      }

      if (businessRecord.owner_id !== user.id) {
        setError(
          `You are signed in as ${
            user.email ?? 'another account'
          }, but this business belongs to a different MAKU account.`
        )
        setSaving(false)
        return
      }

      /*
       * STEP 3
       * Validate the knowledge.
       */
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

      /*
       * STEP 4
       * Save the original knowledge source.
       */
      const { data: insertedKnowledge, error: insertError } =
        await supabase
          .from('knowledge')
          .insert({
            business_id: businessId,
            title: trimmedTitle,
            content: trimmedContent,
            source: 'manual',
            priority: 1,
            is_active: true,
            version: 1,
          })
          .select('id')
          .single()

      if (insertError) {
        setError(
          `Knowledge could not be saved: ${insertError.message}`
        )
        setSaving(false)
        return
      }

      if (!insertedKnowledge) {
        setError(
          'Knowledge was saved but no knowledge record was returned.'
        )
        setSaving(false)
        return
      }

      /*
       * STEP 5
       * Automatically generate vector embeddings.
       *
       * The embedding route:
       * - verifies the logged-in user
       * - verifies business ownership
       * - reads the knowledge
       * - chunks it
       * - calls OpenAI text-embedding-3-small
       * - saves 1536-dimensional vectors
       */
      setSuccess(
        'Knowledge saved. Generating searchable embeddings...'
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
          embeddingResult?.error ||
            'Knowledge was saved, but embeddings could not be generated.'
        )
        setSaving(false)
        return
      }

      /*
       * STEP 6
       * Everything succeeded.
       */
      const chunksCreated =
        embeddingResult?.chunksCreated ?? chunks.length

      setSuccess(
        `${chunksCreated} knowledge ${
          chunksCreated === 1
            ? 'chunk has'
            : 'chunks have'
        } been created and embedded successfully for ${
          businessRecord.name
        }.`
      )

      setSaving(false)

      setTimeout(() => {
        router.push(
          `/dashboard/businesses/${businessId}/knowledge`
        )
        router.refresh()
      }, 1200)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'An unexpected error occurred.'

      setError(message)
      setSaving(false)
    }
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
              Add complete business information for the
              Business Assistant. MAKU automatically creates
              searchable knowledge chunks and embeddings.
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
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
              {success}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-semibold">
              1. Name your knowledge base
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Give this source a clear internal name.
            </p>

            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setError('')
                setSuccess('')
              }}
              placeholder="e.g. Complete Business Information"
              className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold">
                  2. Upload your business knowledge
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Upload a TXT or Markdown file, or paste the
                  complete business information below.
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

CONTACT INFORMATION`}
              rows={22}
              className="mt-5 w-full resize-y rounded-xl border border-slate-300 px-4 py-4 text-sm leading-6 outline-none transition focus:border-slate-900"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <span>
                {content.length.toLocaleString()} characters
              </span>

              <span>
                {chunks.length > 0
                  ? `${chunks.length} ${
                      chunks.length === 1
                        ? 'chunk'
                        : 'chunks'
                    } will be generated`
                  : 'No chunks yet'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-semibold">
              3. Automatic processing
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Save
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your business knowledge is securely stored
                  against the correct business.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Chunk
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  MAKU divides the information into useful
                  searchable sections.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">
                  Embed
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Each section receives a 1536-dimensional
                  vector for semantic search.
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
              disabled={
                saving ||
                chunks.length === 0
              }
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Creating Knowledge...'
                : 'Process Knowledge'}
            </button>
          </div>
        </form>
      </section>
    </main>

  
  
  
  
  
  
  
  
  
  )
}
