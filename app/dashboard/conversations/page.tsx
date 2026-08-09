import { Sidebar } from '@/components/navigation/Sidebar'

const sampleConversations = [
  {
    id: 'conv_1',
    assistant: 'Maku Concierge',
    updatedAt: 'Today',
  },
]

export default function ConversationsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container grid gap-8 py-12 lg:grid-cols-[288px_1fr]">
        <Sidebar />
        <section className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-card">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Conversations</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Conversation history</h1>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 text-slate-500">Conversation ID</th>
                    <th className="px-4 py-4 text-slate-500">Assistant</th>
                    <th className="px-4 py-4 text-slate-500">Last updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleConversations.map((conversation) => (
                    <tr key={conversation.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">{conversation.id}</td>
                      <td className="px-4 py-4 text-slate-600">{conversation.assistant}</td>
                      <td className="px-4 py-4 text-slate-600">{conversation.updatedAt}</td>
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
