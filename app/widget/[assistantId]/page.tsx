'use client'

import { useEffect, useState } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function WidgetPage({
  params,
}: {
  params: { assistantId: string }
}) {
  const assistantId = params.assistantId

  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function loadAssistant() {
      try {
        const response = await fetch('/api/widget/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistantId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.error || 'Unable to load Business Assistant.'
          )
        }

        setMessages([
          {
            role: 'assistant',
            content:
              data?.welcomeMessage ||
              'Hi! Welcome. How can I help you today?',
          },
        ])
      } catch (error) {
        setMessages([
          {
            role: 'assistant',
            content:
              error instanceof Error
                ? error.message
                : 'Unable to load this Business Assistant.',
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadAssistant()
  }, [assistantId])

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const text = message.trim()

    if (!text || sending) return

    const history = messages

    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content: text,
      },
    ])

    setMessage('')
    setSending(true)

    try {
      const response = await fetch('/api/widget/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId,
          message: text,
          history,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error || 'Unable to contact the assistant.'
        )
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            data?.answer ||
            'Sorry, I could not process your request.',
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-white text-[#111827]">
      <header className="border-b border-[#FFB3DF] bg-[#FC72C2] px-5 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
          MAKU Technologies
        </p>

        <h1 className="mt-1 text-lg font-semibold">
          Business Assistant
        </h1>

        <p className="mt-1 text-xs text-white/90">
          How can we help you today?
        </p>
      </header>

      <section className="flex-1 space-y-3 overflow-y-auto bg-[#FFF7FC] p-4">
        {loading ? (
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#6B7280] shadow-sm">
            Loading Business Assistant...
          </div>
        ) : (
          messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={
                item.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-2xl bg-[#FC72C2] px-4 py-3 text-sm text-white'
                  : 'max-w-[85%] rounded-2xl border border-[#FFB3DF] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm'
              }
            >
              <div className="whitespace-pre-wrap">
                {item.content}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="max-w-[85%] rounded-2xl border border-[#FFB3DF] bg-white px-4 py-3 text-sm text-[#6B7280] shadow-sm">
            Thinking...
          </div>
        )}
      </section>

      <form
        onSubmit={sendMessage}
        className="border-t border-[#FFB3DF] bg-white p-3"
      >
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading || sending}
            className="min-w-0 flex-1 rounded-xl border border-[#FFB3DF] px-3 py-3 text-sm outline-none focus:border-[#FC72C2]"
          />

          <button
            type="submit"
            disabled={loading || sending || !message.trim()}
            className="rounded-xl bg-[#FC72C2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#E94FA8] disabled:opacity-50"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </main>
  )
}
