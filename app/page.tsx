import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          MAKU Technologies
        </p>

        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950">
          Personalised Business Assistants for small businesses.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Build and manage personalised Business Assistants designed to help
          businesses manage customer enquiries, improve customer experience
          and capture more opportunities.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-2xl bg-slate-950 px-6 py-3 font-medium text-white"
          >
            Sign in
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
