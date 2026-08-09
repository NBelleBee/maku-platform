import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { Sidebar } from '@/components/navigation/Sidebar'

export default async function DashboardPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)

  const businessIds = businesses?.map((business) => business.id) ?? []

  const { data: assistants } =
    businessIds.length > 0
      ? await supabase
          .from('assistants')
          .select('*')
          .in('business_id', businessIds)
      : { data: [] }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container grid gap-8 py-12 lg:grid-cols-[288px_1fr]">
        <Sidebar />

        <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-card">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Dashboard
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Welcome back to MAKU
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Manage your businesses, assistants, knowledge, services,
            conversations and settings from one place.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Businesses</p>
              <p className="mt-4 text-4xl font-semibold text-slate-950">
                {businesses?.length ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Assistants</p>
              <p className="mt-4 text-4xl font-semibold text-slate-950">
                {assistants?.length ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Conversations</p>
              <p className="mt-4 text-4xl font-semibold text-slate-950">
                0
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}