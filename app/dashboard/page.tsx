import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600"
          >
            MAKU
          </Link>

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            MAKU Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your businesses and Business Assistants.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Businesses
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage Businesses
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage your businesses, knowledge, services and pricing.
            </p>

            <Link
              href="/dashboard/businesses"
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Manage Businesses
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Business Assistants
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage Assistants
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create and manage your Business Assistants.
            </p>

            <Link
              href="/dashboard/assistants"
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Manage Assistants
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
