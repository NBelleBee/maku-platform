import Link from 'next/link'

export default function BusinessesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Businesses
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your businesses and Business Assistants.
              </p>
            </div>

            <Link
              href="/dashboard/businesses/new"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Manage Business
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Your Businesses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your business information, knowledge, services and pricing.
            </p>
          </div>

          <div className="p-6">
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Maku Consulting
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Business profile and assistant configuration
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/businesses/1"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Manage Business
                </Link>

                <Link
                  href="/dashboard/businesses/1/knowledge"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900"
                >
                  Knowledge
                </Link>

                <Link
                  href="/dashboard/businesses/1/services"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900"
                >
                  Services
                </Link>

                <Link
                  href="/dashboard/businesses/1/pricing"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900"
                >
                  Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
