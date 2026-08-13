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
              Manage your businesses, Business Assistants and business
              information.
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          <Link
            href="/dashboard/businesses"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-400"
          >
            <p className="text-sm text-slate-500">
              Businesses
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage Businesses
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create and manage the businesses connected to MAKU.
            </p>
          </Link>

          <Link
            href="/dashboard/assistants"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-400"
          >
            <p className="text-sm text-slate-500">
              Business Assistants
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage Assistants
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create and manage personalised Business Assistants.
            </p>
          </Link>

          <Link
            href="/dashboard/knowledge"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-400"
          >
            <p className="text-sm text-slate-500">
              Knowledge
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Business Knowledge
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage the information your Business Assistants use.
            </p>
          </Link>

          <Link
            href="/dashboard/services"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-400"
          >
            <p className="text-sm text-slate-500">
              Services
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage Services
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage services offered by each business.
            </p>
          </Link>

          <Link
            href="/dashboard/pricing"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-400"
          >
            <p className="text-sm text-slate-500">
              Pricing
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage Pricing
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage business pricing and customer-facing information.
            </p>
          </Link>

          <Link
            href="/dashboard/policies"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-400"
          >
            <p className="text-sm text-slate-500">
              Policies
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage Policies
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage cancellation, deposits, booking and business policies.
            </p>
          </Link>

        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Business Assistants
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage your Business Assistants, business knowledge,
            services, pricing and policies from the dashboard.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/businesses"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900"
            >
              Businesses
            </Link>

            <Link
              href="/dashboard/assistants"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Assistants
            </Link>

            <Link
              href="/dashboard/knowledge"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900"
            >
              Knowledge
            </Link>

            <Link
              href="/dashboard/services"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900"
            >
              Services
            </Link>

            <Link
              href="/dashboard/pricing"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900"
            >
              Pricing
            </Link>

            <Link
              href="/dashboard/policies"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900"
            >
              Policies
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
