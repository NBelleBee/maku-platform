'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

function ChatContent() {
  const searchParams = useSearchParams()
  const assistantId = searchParams.get('assistant')

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!assistantId) {
      setError(
        'This link is missing an assistant reference. Please use the link provided by the business.'
      )
      return
    }

    if (!message.trim() || loading) return

    const userMessage = message.trim()

    const updatedMessages: Message[] = [
      ...messages,
      {
        role: 'user',
        content: userMessage,
      },
    ]

    setMessages(updatedMessages)
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId,
          message: userMessage,
          history: messages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to contact the assistant.')
      }

      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content:
            data.answer ||
            'Sorry, I could not process your request.',
        },
      ])
    } catch (err) {
      setMessages(updatedMessages)
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF7FC]">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col bg-white">
        <header className="border-b border-[#FFB3DF] p-6">
          <p className="text-sm font-semibold text-[#6B7280]">
            MAKU Technologies
          </p>

          <h1 className="mt-1 text-xl font-semibold text-[#111827]">
            Business Assistant
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            How can we help you today?
          </p>
        </header>

        <section className="flex-1 space-y-4 overflow-y-auto p-6">
          {!assistantId && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No assistant specified. Please use the link provided by the
              business.
            </div>
          )}

          {messages.length === 0 && assistantId && (
            <div className="max-w-[80%] rounded-2xl bg-[#FFE6F4] px-4 py-3 text-[#111827]">
              Hi! Welcome. How can I help you today?
            </div>
          )}

          {messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={
                item.role === 'user'
                  ? 'ml-auto max-w-[80%] rounded-2xl bg-[#FC72C2] px-4 py-3 text-white'
                  : 'max-w-[80%] rounded-2xl bg-[#FFE6F4] px-4 py-3 text-[#111827]'
              }
            >
              {item.content}
            </div>
          ))}

          {loading && (
            <div className="max-w-[80%] rounded-2xl bg-[#FFE6F4] px-4 py-3 text-sm text-[#6B7280]">
              Thinking...
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        <form
          onSubmit={sendMessage}
          className="border-t border-[#FFB3DF] p-4"
        >
          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-[#FFB3DF] px-4 py-3 outline-none focus:border-[#FC72C2]"
            />

            <button
              type="submit"
              disabled={loading || !assistantId || !message.trim()}
              className="rounded-xl bg-[#FC72C2] px-5 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFF7FC]">
          <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center bg-white">
            <p className="text-sm text-[#6B7280]">
              Loading Business Assistant...
            </p>
          </div>
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
