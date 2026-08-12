import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-semibold text-slate-900">
            MAKU Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your businesses and Business Assistants.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/dashboard/businesses"
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <p className="text-sm text-slate-500">
              Businesses
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage Businesses
            </h2>
          </Link>

          <Link
            href="/dashboard/assistants"
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <p className="text-sm text-slate-500">
              Business Assistants
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage Assistants
            </h2>
          </Link>
        </div>
      </section>
    </main>
  )
}
