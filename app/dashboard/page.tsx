import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              MAKU Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your businesses and Business Assistants.
            </p>
          </div>

          <Link
            href="/dashboard/assistants"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Assistants
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Businesses
            </p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              —
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Business management
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Business Assistants
            </p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              —
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Manage your assistants
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Business Assistants
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage your Business Assistants from the assistants dashboard.
          </p>

          <Link
            href="/dashboard/assistants"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Manage Assistants
          </Link>
        </div>
      </section>
    </main>
  )
}
