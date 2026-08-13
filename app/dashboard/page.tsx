import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
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
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Businesses
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage your businesses
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create and manage the businesses connected to MAKU.
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
              Manage your assistants
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create and manage personalised Business Assistants.
            </p>

            <Link
              href="/dashboard/assistants"
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Manage Assistants
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Business Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage the information your Business Assistants use.
          </p>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/businesses"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
          >
            <p className="text-sm font-medium text-slate-500">
              Businesses
            </p>

            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              Businesses
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage your client businesses.
            </p>
          </Link>

          <Link
            href="/dashboard/services"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
          >
            <p className="text-sm font-medium text-slate-500">
              Services
            </p>

            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              Services
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage services offered by businesses.
            </p>
          </Link>

          <Link
            href="/dashboard/knowledge"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
          >
            <p className="text-sm font-medium text-slate-500">
              Knowledge
            </p>

            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              Knowledge Base
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage business information and assistant knowledge.
            </p>
          </Link>

          <Link
            href="/dashboard/policies"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
          >
            <p className="text-sm font-medium text-slate-500">
              Policies
            </p>

            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              Policies
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage booking, cancellation and business policies.
            </p>
          </Link>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Business Assistants
          </h2>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Create and manage your Business Assistants from the assistants
              dashboard.
            </p>

            <Link
              href="/dashboard/assistants"
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Manage Assistants
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
