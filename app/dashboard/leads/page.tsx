import { Sidebar } from '@/components/navigation/Sidebar'

const sampleLeads = [
  {
    id: 'lead_1',
    name: 'Jamie Patel',
    email: 'jamie@example.com',
    enquiry: 'Can you tell me about your services?'
  },
]

export default function LeadsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container grid gap-8 py-12 lg:grid-cols-[288px_1fr]">
        <Sidebar />
        <section className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-card">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Leads</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Manage inbound enquiries</h1>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 text-slate-500">Name</th>
                    <th className="px-4 py-4 text-slate-500">Email</th>
                    <th className="px-4 py-4 text-slate-500">Enquiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">{lead.name}</td>
                      <td className="px-4 py-4 text-slate-600">{lead.email}</td>
                      <td className="px-4 py-4 text-slate-600">{lead.enquiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
