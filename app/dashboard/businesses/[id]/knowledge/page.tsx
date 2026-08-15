'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function KnowledgePage() {
  const params = useParams()

  const businessId = params.id as string

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard/businesses"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              ← Back to Businesses
            </Link>

            <Link
              href={`/dashboard/businesses/${businessId}/knowledge/new`}
              className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              + Add Business Knowledge
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Business Management
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Knowledge Base
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage the information MAKU uses to understand
              this business and support its Business Assistant.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📚
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Build this business's knowledge base
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Add the business information that MAKU should
              use when responding to customer enquiries.
              This can include services, pricing, policies,
              opening hours, FAQs, booking information and
              other important business details.
            </p>

            <Link
              href={`/dashboard/businesses/${businessId}/knowledge/new`}
              className="mt-6 inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add Business Knowledge
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
