import Link from 'next/link'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/businesses', label: 'Businesses' },
  { href: '/dashboard/assistants', label: 'Assistants' },
  { href: '/dashboard/knowledge', label: 'Knowledge Base' },
  { href: '/dashboard/services', label: 'Services' },
  { href: '/dashboard/faqs', label: 'FAQs' },
  { href: '/dashboard/policies', label: 'Policies' },
  { href: '/dashboard/conversations', label: 'Conversations' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white px-6 py-8 lg:block">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">MAKU</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Platform</h2>
          <p className="mt-2 text-sm text-slate-500">Personalised assistants and business setup.</p>
        </div>
        <nav className="space-y-1">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
