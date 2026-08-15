'use client'

import { FormEvent, useState } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage || loading) {
      return
    }

    setError('')

    const userMessage: Message = {
      role: 'user',
      content: trimmedMessage,
    }

    setMessages((current) => [
      ...current,
      userMessage,
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

      const assistantMessage: Message = {
        role: 'assistant',
        content:
          result?.response ??
          'I could not generate a response.',
      }

      setMessages((current) => [
        ...current,
        assistantMessage,
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            MAKU Technologies
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Business Assistant
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ask a question and the Business Assistant will
            use the available business knowledge to respond.
          </p>
        </header>

        <section className="flex-1 py-8">
          {messages.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="max-w-lg text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  ✨
                </div>

                <h2 className="mt-6 text-xl font-semibold">
                  How can I help?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ask about services, pricing, opening hours,
                  policies, booking information or anything
                  contained in the business knowledge.
                </p>
              </div>
            </div>
          ) : (
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
          )}

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
              disabled={loading}
              placeholder="Ask a question..."
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !message.trim()
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

