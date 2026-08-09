import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function AssistantPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabase()

  const { data: assistant, error } = await supabase
    .from('assistants')
    .select('id, name, welcome_message, system_instructions, is_active, business_id')
    .eq('id', params.id)
    .single()

  if (error || !assistant) {
    return (
      <main className="p-8">
        <Link
          href="/dashboard/assistants"
          className="text-sm text-slate-500 underline"
        >
          ← Back to assistants
        </Link>

        <h1 className="mt-8 text-2xl font-semibold text-slate-950">
          Assistant not found
        </h1>

        <p className="mt-2 text-slate-500">
          We could not find this Business Assistant.
        </p>
      </main>
    )
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', assistant.business_id)
    .single()

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/assistants"
          className="text-sm text-slate-500 underline underline-offset-4"
        >
          ← Back to assistants
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium uppercase tracking-widest text-slate-400">
            Business Assistant
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {assistant.name}
          </h1>

          <p className="mt-2 text-slate-500">
            {business?.name ?? 'No business assigned'}
          </p>
        </div>

        <div className="mt-10 grid gap-6">
          <section className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Status
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {assistant.is_active ? 'Active' : 'Inactive'}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Welcome message
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {assistant.welcome_message || 'No welcome message configured.'}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Assistant instructions
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {assistant.system_instructions || 'No instructions configured.'}
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
