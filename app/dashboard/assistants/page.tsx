import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function AssistantsPage() {
  const supabase = await createServerSupabase()

  const { data: assistants, error } = await supabase
    .from('assistants')
    .select(
      'id, name, welcome_message, system_instructions, is_active, business_id'
    )
    .order('name', { ascending: true })

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              MAKU
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Assistants
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your Business Assistants.
            </p>
          </div>

          <Link
            href="/dashboard/assistants/new"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Create assistant
          </Link>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700">
            <p className="font-semibold">
              Could not load Business Assistants.
            </p>

            <p className="mt-1">
              {error.message}
            </p>
          </div>
        )}

        {!error && (!assistants || assistants.length === 0) && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              No assistants saved
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your Business Assistants will appear here once they
              have been created.
            </p>

            <Link
              href="/dashboard/assistants/new"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              Create your first assistant
            </Link>
          </div>
        )}

        {!error && assistants && assistants.length > 0 && (
          <section className="mt-10">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-950">
                Business Assistants
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {assistants.length}{' '}
                {assistants.length === 1
                  ? 'assistant'
                  : 'assistants'}{' '}
                saved.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {assistants.map((assistant) => (
                <Link
                  key={assistant.id}
                  href={`/dashboard/assistants/${assistant.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950 group-hover:underline">
                        {assistant.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Business Assistant
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        assistant.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {assistant.is_active
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="text-sm leading-6 text-slate-600">
                      {assistant.welcome_message ||
                        'No welcome message configured.'}
                    </p>
                  </div>

                  <div className="mt-5 text-sm font-medium text-slate-500">
                    Open assistant →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
```
