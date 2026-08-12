'use client'

import Link from 'next/link'

export default function AssistantsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Assistants
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your Business Assistants.
            </p>
          </div>

          <Link
            href="/dashboard/assistants/new"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Create assistant
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-10">
          <h2 className="text-lg font-semibold text-slate-900">
            Business Assistants
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your assistants will appear here.
          </p>
        </div>
      </section>
    </main>
  )
}
