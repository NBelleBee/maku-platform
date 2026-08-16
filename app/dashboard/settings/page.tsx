import { Sidebar } from '@/components/navigation/Sidebar'

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#FFF7FC] text-[#111827]">
      <div className="container grid gap-8 py-12 lg:grid-cols-[288px_1fr]">
        <Sidebar />
        <section className="space-y-6">
          <div className="rounded-[32px] border border-[#FFB3DF] bg-white p-10 shadow-card">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Settings</p>
              <h1 className="mt-2 text-3xl font-semibold text-[#111827]">Platform settings</h1>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">Configure account, authentication, and general platform options.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
