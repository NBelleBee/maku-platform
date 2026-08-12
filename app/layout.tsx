import Link from 'next/link'

export default function CreateAssistantPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href="/dashboard/assistants"
            className="text-sm font-medium text-slate-600"
          >
            ← Back to Assistants
          </Link>

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Create assistant
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a personalised assistant for a business.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="business"
                className="block text-sm font-medium text-slate-900"
              >
                Business
              </label>

              <select
                id="business"
                name="business"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a business
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-900"
              >
                Assistant name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Maku Concierge"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="welcome"
                className="block text-sm font-medium text-slate-900"
              >
                Welcome message
              </label>

              <textarea
                id="welcome"
                name="welcome"
                rows={4}
                placeholder="How would you like your assistant to welcome customers?"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="instructions"
                className="block text-sm font-medium text-slate-900"
              >
                Assistant instructions
              </label>

              <textarea
                id="instructions"
                name="instructions"
                rows={6}
                placeholder="Describe how the assistant should respond to customers."
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="active"
                name="active"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300"
              />

              <label
                htmlFor="active"
                className="text-sm font-medium text-slate-900"
              >
                Active assistant
              </label>
            </div>

            <div className="flex gap-3 border-t border-slate-200 pt-6">
              <Link
                href="/dashboard/assistants"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
              >
                Create assistant
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
