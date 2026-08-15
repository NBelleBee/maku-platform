import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

type KnowledgePageProps = {
  params: {
    id: string
  }
}

export default async function KnowledgePage({
  params,
}: KnowledgePageProps) {
  const supabase = await createServerSupabase()

  const { data: business, error: businessError } =
    await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', params.id)
      .single()

  if (businessError || !business) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/dashboard/businesses"
            className="text-sm font-medium text-slate-500 underline underline-offset-4"
          >
            ← Back to Businesses
          </Link>

          <h1 className="mt-8 text-2xl font-semibold">
            Business not found
          </h1>
        </div>
      </main>
    )
  }

  const { data: knowledge, error: knowledgeError } =
    await supabase
      .from('knowledge')
      .select(
        'id, title, content, is_active'
      )
      .eq('business_id', params.id)
      .order('title')

  const { count: chunkCount } =
    await supabase
      .from('knowledge_chunks')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('business_id', params.id)
      .eq('is_active', true)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard/businesses"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              ← Back to Businesses
            </Link>

            <Link
              href={`/dashboard/businesses/${params.id}/knowledge/new`}
              className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              + Add Business Knowledge
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Business Knowledge
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {business.name}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage the information MAKU uses to help this
              business's Business Assistant answer customer
              enquiries.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {knowledgeError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Could not load knowledge:
            {' '}
            {knowledgeError.message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Knowledge sources
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {knowledge?.length ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Searchable sections
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {chunkCount ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Retrieval status
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {chunkCount && chunkCount > 0
                ? 'Ready'
                : 'Not processed'}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {knowledge &&
          knowledge.length > 0 ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Business Knowledge
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your complete business information sources.
                  </p>
                </div>

                <Link
                  href={`/dashboard/businesses/${params.id}/knowledge/new`}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Add another source
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {knowledge.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                          {item.is_active
                            ? 'Active'
                            : 'Inactive'}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                      {item.content}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📚
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                Build this business's knowledge base
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Add the business information MAKU should use
                when responding to customer enquiries.
              </p>

              <Link
                href={`/dashboard/businesses/${params.id}/knowledge/new`}
                className="mt-6 inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Add Business Knowledge
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
)
}
