import Link from 'next/link'

const businesses = [
  {
    id: '1',
    name: 'Maku Consulting',
    description: 'MAKU Technologies',
  },
]

export default function BusinessesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Businesses
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage the businesses connected to your Business Assistants.
              </p>
            </div>

            <Link
              href="/dashboard/businesses/new"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
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
              Select a business to manage its information and assistant setup.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {business.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {business.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard/businesses/${business.id}/knowledge`}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    >
                      Knowledge
                    </Link>

                    <Link
                      href={`/dashboard/businesses/${business.id}/services`}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    >
                      Services
                    </Link>

                    <Link
                      href={`/dashboard/businesses/${business.id}/pricing`}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    >
                      Pricing
                    </Link>

                    <Link
                      href={`/dashboard/businesses/${business.id}`}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
