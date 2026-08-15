'use client'

import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Assistant = {
  id: string
  name: string
  welcome_message: string | null
  system_instructions: string | null
  is_active: boolean
  business_id: string
}

type Business = {
  id: string
  name: string
}

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function AssistantPage() {
  const params = useParams()
  const assistantId = params.id as string

  const [assistant, setAssistant] =
    useState<Assistant | null>(null)
  const [business, setBusiness] =
    useState<Business | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [loadingAssistant, setLoadingAssistant] =
    useState(true)
  const [loadingReply, setLoadingReply] = useState(false)
  const [error, setError] = useState('')

  const welcomeMessage = useMemo(
    () => assistant?.welcome_message?.trim() ?? '',
    [assistant]
  )

  useEffect(() => {
    async function loadAssistant() {
      setLoadingAssistant(true)
      setError('')

      try {
        const response = await fetch(
          `/api/assistants/${assistantId}`
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result?.error ??
              'Could not load the Business Assistant.'
          )
        }

        setAssistant(result.assistant)
        setBusiness(result.business ?? null)
        setMessages(
          result.assistant?.welcome_message
            ? [
                {
                  role: 'assistant',
                  content: result.assistant.welcome_message,
                },
              ]
            : []
        )
      } catch (caughtError) {
        setAssistant(null)
        setBusiness(null)
        setMessages([])
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load the Business Assistant.'
        )
      } finally {
        setLoadingAssistant(false)
      }
    }

    loadAssistant()
  }, [assistantId])

  async function sendMessage() {
    const trimmedMessage = message.trim()

    if (
      !assistant ||
      !assistant.is_active ||
      loadingReply ||
      !trimmedMessage
    ) {
      return
    }

    setError('')
    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content: trimmedMessage,
      },
    ])
    setMessage('')
    setLoadingReply(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          assistantId: assistant.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ??
            'The Business Assistant could not respond.'
        )
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            result?.reply ??
            'I could not generate a response.',
        },
      ])
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'An unexpected error occurred.'
      )
    } finally {
      setLoadingReply(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendMessage()
  }

  if (loadingAssistant) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-slate-500">
            Loading Business Assistant...
          </p>
        </div>
      </main>
    )
  }

  if (!assistant) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard/assistants"
            className="text-sm text-slate-500 underline"
          >
            ← Back to Assistants
          </Link>

          <h1 className="mt-8 text-2xl font-semibold text-slate-950">
            Assistant not found
          </h1>

          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <header className="border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard/assistants"
              className="text-sm text-slate-500 underline underline-offset-4"
            >
              ← Back to Assistants
            </Link>

            <Link
              href={`/dashboard/businesses/${assistant.business_id}/knowledge`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Knowledge Base
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              Business Assistant
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {assistant.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {business?.name ?? 'Business Assistant'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  assistant.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {assistant.is_active
                  ? 'Active'
                  : 'Inactive'}
              </span>

              {!assistant.is_active && (
                <span className="text-sm text-slate-500">
                  This assistant is inactive, so chat is disabled.
                </span>
              )}
            </div>
          </div>
        </header>

        <section className="flex flex-1 flex-col py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-950">
              Customer chat
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ask questions exactly as a customer would.
            </p>
          </div>

          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-5">
              {!messages.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
                  {welcomeMessage
                    ? welcomeMessage
                    : 'No welcome message has been configured for this assistant yet.'}
                </div>
              )}

              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`flex ${
                    item.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-7 ${
                      item.role === 'user'
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}

              {loadingReply && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 border-t border-slate-200 pt-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                disabled={
                  loadingReply ||
                  !assistant.is_active
                }
                placeholder={
                  assistant.is_active
                    ? 'Ask your Business Assistant a question...'
                    : 'This Business Assistant is inactive.'
                }
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
              />

              <button
                type="submit"
                disabled={
                  loadingReply ||
                  !assistant.is_active ||
                  !message.trim()
                }
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingReply
                  ? 'Sending...'
                  : 'Send'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

