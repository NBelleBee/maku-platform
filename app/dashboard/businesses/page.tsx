import Link from 'next/link'

export default function BusinessesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Businesses
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage the businesses connected to MAKU.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Your Businesses
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add a client business to begin creating and managing its
                Business Assistants.
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Add Business
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <h3 className="font-medium text-slate-900">
              No businesses yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your client businesses will appear here once they are added.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
