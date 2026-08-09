import { Sidebar } from '@/components/navigation/Sidebar'

export default function FaqsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container grid gap-8 py-12 lg:grid-cols-[288px_1fr]">
        <Sidebar />
        <section className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-card">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">FAQs</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Build the frequently asked questions for each business</h1>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
            <p className="text-sm text-slate-500">Use FAQ content to shape assistant responses and reduce repetitive queries.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
