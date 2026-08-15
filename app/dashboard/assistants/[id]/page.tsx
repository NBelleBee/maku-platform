'use client'

import { useEffect, useState } from 'react'
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

  const [messages, setMessages] =
    useState<Message[]>([])

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAssistant, setLoadingAssistant] =
    useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAssistant() {
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

        if (result.assistant?.welcome_message) {
          setMessages([
            {
              role: 'assistant',
              content:
                result.assistant.welcome_message,
            },
          ])
        }
      } catch (caughtError) {
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
      !trimmedMessage ||
      loading ||
      !assistant
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
    setLoading(true)

    try {
      const response = await fetch(
        '/api/ai/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            message: trimmedMessage,
            assistantId: assistant.id,
          }),
        }
      )

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
      setLoading(false)
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    sendMessage()
  }

  if (loadingAssistant) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">
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
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/assistants"
            className="text-sm text-slate-500 underline"
          >
            ← Back to assistants
          </Link>

          <h1 className="mt-8 text-2xl font-semibold">
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
              ← Back to assistants
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
              {business?.name ??
                'Business Assistant'}
            </p>

            <div className="mt-4">
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
            </div>
          </div>
        </header>

        <section className="flex-1 py-8">
          <div className="space-y-5">
            {messages.map(
              (item, index) => (
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
                        : 'border border-slate-200 bg-white text-slate-700 shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 pt-6"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              disabled={
                loading ||
                !assistant.is_active
              }
              placeholder={
                assistant.is_active
                  ? 'Ask this Business Assistant a question...'
                  : 'This Business Assistant is inactive.'
              }
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !message.trim() ||
                !assistant.is_active
              }
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Sending...'
                : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
