import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

type AssistantPageProps = {
  params: {
    id: string
  }
}

export default async function AssistantPage({
  params,
}: AssistantPageProps) {
  const supabase = await createServerSupabase()

  const { data: assistant, error } = await supabase
    .from('assistants')
    .select(
      'id, name, welcome_message, system_instructions, is_active, business_id'
    )
    .eq('id', params.id)
    .single()

  if (error || !assistant) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/assistants"
            className="text-sm font-medium text-slate-500 underline underline-offset-4"
          >
            ← Back to assistants
          </Link>

          <h1 className="mt-8 text-2xl font-semibold">
            Assistant not found
          </h1>

          <p className="mt-2 text-slate-500">
            We could not find this Business Assistant.
          </p>
        </div>
      </main>
    )
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', assistant.business_id)
    .single()

  const { data: knowledgeSources } = await supabase
    .from('knowledge')
    .select('id, title, content, is_active')
    .eq('business_id', assistant.business_id)
    .eq('is_active', true)
    .order('title')

  const { count: chunkCount } = await supabase
    .from('knowledge_chunks')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('business_id', assistant.business_id)
    .eq('is_active', true)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link
            href="/dashboard/assistants"
            className="text-sm font-medium text-slate-500 underline underline-offset-4"
          >
            ← Back to assistants
          </Link>

          <div className="mt-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              Business Assistant
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {assistant.name}
            </h1>

            <p className="mt-2 text-slate-500">
              {business?.name ?? 'No business assigned'}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Status
            </p>

            <p className="mt-2 text-lg font-semibold">
              {assistant.is_active
                ? 'Active'
                : 'Inactive'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Knowledge sources
            </p>

            <p className="mt-2 text-lg font-semibold">
              {knowledgeSources?.length ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Searchable sections
            </p>

            <p className="mt-2 text-lg font-semibold">
              {chunkCount ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Business Knowledge
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Information this Business Assistant can
                  use when responding to customers.
                </p>
              </div>

              <Link
                href={`/dashboard/businesses/${assistant.business_id}/knowledge`}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Manage Knowledge
              </Link>
            </div>

            {knowledgeSources &&
            knowledgeSources.length > 0 ? (
              <div className="mt-6 space-y-3">
                {knowledgeSources.map((source) => (
                  <div
                    key={source.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-medium">
                      {source.title}
                    </p>

                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                      {source.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  No business knowledge has been added yet.
                </p>

                <Link
                  href={`/dashboard/businesses/${assistant.business_id}/knowledge/new`}
                  className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
                >
                  Add Business Knowledge
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Welcome message
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {assistant.welcome_message ||
                'No welcome message configured.'}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Assistant instructions
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {assistant.system_instructions ||
                'No instructions configured.'}
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}

