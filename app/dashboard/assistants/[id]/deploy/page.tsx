'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Assistant = {
  id: string
  name: string
  business_id: string
  is_active: boolean
}

export default function DeployAssistantPage() {
  const params = useParams()
  const assistantId = String(params.id || '')

  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)

    async function loadAssistant() {
      if (!assistantId) {
        setError('Assistant ID is missing.')
        setLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You are not signed in.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('assistants')
        .select('id, name, business_id, is_active')
        .eq('id', assistantId)
        .maybeSingle()

      if (error) {
        setError(error.message)
      } else if (!data) {
        setError('Assistant not found.')
      } else {
        setAssistant(data)
      }

      setLoading(false)
    }

    loadAssistant()
  }, [assistantId])

  const embedCode = origin
    ? `<script
  src="${origin}/widget.js"
  data-assistant-id="${assistantId}"
  defer>
</script>`
    : ''

  async function copyCode() {
    if (!embedCode) return

    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2500)
    } catch {
      setError('Unable to copy the code. Please select and copy it manually.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF7FC] p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-[#6B7280]">
            Loading deployment settings...
          </p>
        </div>
      </main>
    )
  }

  if (error || !assistant) {
    return (
      <main className="min-h-screen bg-[#FFF7FC] p-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/assistants"
            className="text-sm font-medium text-[#FC72C2]"
          >
            ← Back to assistants
          </Link>

          <div className="mt-8 rounded-2xl border border-[#FFB3DF] bg-white p-6">
            <h1 className="text-xl font-semibold text-[#111827]">
              Unable to load deployment
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error || 'Assistant not found.'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC]">
      <header className="border-b border-[#FFB3DF] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="text-xl font-semibold text-[#111827]">
            MAKU Technologies
          </div>

          <div className="text-sm text-[#6B7280]">
            Business Assistant Platform
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href={`/dashboard/assistants/${assistant.id}`}
          className="text-sm font-medium text-[#FC72C2] hover:text-[#E94FA8]"
        >
          ← Back to assistant
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-[#FC72C2]">
            DEPLOY ASSISTANT
          </p>

          <h1 className="mt-1 text-3xl font-semibold text-[#111827]">
            Deploy {assistant.name}
          </h1>

          <p className="mt-2 max-w-2xl text-[#6B7280]">
            Add this Business Assistant to a client's website using one
            simple embed code.
          </p>
        </div>

        {!assistant.is_active && (
          <div className="mt-6 rounded-2xl border border-[#FFB3DF] bg-[#FFE6F4] px-5 py-4 text-sm text-[#111827]">
            This assistant is currently inactive. Activate it before
            deploying it to a live website.
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#FFB3DF] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">
                  Website Widget
                </h2>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Floating Business Assistant
                </p>
              </div>

              <div className="rounded-full bg-[#FFE6F4] px-3 py-1 text-xs font-semibold text-[#FC72C2]">
                READY
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#FFF7FC] p-5">
              <p className="text-sm leading-6 text-[#6B7280]">
                The widget appears as a floating button on the client's
                website. Customers can open it and communicate directly
                with this Business Assistant.
              </p>
            </div>

            <div className="mt-6">
              <Link
                href={`/widget/${assistant.id}`}
                target="_blank"
                className="inline-flex rounded-xl bg-[#FC72C2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#E94FA8]"
              >
                Preview Widget
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#FFB3DF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111827]">
              Embed Code
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">
              Copy this code and paste it into the client's website.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl bg-[#111827]">
              <pre className="overflow-x-auto p-5 text-xs leading-6 text-white">
                <code>{embedCode}</code>
              </pre>
            </div>

            <button
              type="button"
              onClick={copyCode}
              className="mt-4 w-full rounded-xl bg-[#FC72C2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#E94FA8]"
            >
              {copied ? 'Copied!' : 'Copy Embed Code'}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-[#FFB3DF] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#111827]">
            Installation
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FC72C2] text-sm font-semibold text-white">
                1
              </div>

              <div>
                <p className="font-medium text-[#111827]">
                  Copy the embed code
                </p>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Use the Copy Embed Code button above.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FC72C2] text-sm font-semibold text-white">
                2
              </div>

              <div>
                <p className="font-medium text-[#111827]">
                  Add it to the client's website
                </p>

                <p className="mt-1 text-sm text-[#6B7280]">
                  The code can normally be placed before the closing
                  body tag or through the website's custom code section.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FC72C2] text-sm font-semibold text-white">
                3
              </div>

              <div>
                <p className="font-medium text-[#111827]">
                  Test the assistant
                </p>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Open the client's website and test services, pricing,
                  FAQs and other business information.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-[#FFB3DF] bg-[#FFE6F4] p-6">
          <h2 className="font-semibold text-[#111827]">
            Important
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#111827]">
            The client website never receives your OpenAI API key,
            Supabase credentials or internal business data. The widget
            communicates with MAKU's secure server and only identifies
            which Business Assistant should respond.
          </p>
        </div>
      </section>
    </main>
  )
}
