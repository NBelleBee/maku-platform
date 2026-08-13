export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-slate-900">
          MAKU Dashboard
        </h1>

        <p className="mt-2 text-slate-600">
          Manage your businesses and Business Assistants.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <a
            href="/dashboard/businesses"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Businesses
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage businesses, knowledge, services and pricing.
            </p>
          </a>

          <a
            href="/dashboard/assistants"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Business Assistants
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create and manage your Business Assistants.
            </p>
          </a>
        </div>
      </div>
    </main>
  )
}
