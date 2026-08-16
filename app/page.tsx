import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold tracking-widest text-[#6B7280]">
          MAKU TECHNOLOGIES
        </p>

        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-[#111827]">
          Personalised Business Assistants for small businesses.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B7280]">
          Build and manage personalised Business Assistants designed to help
          businesses manage customer enquiries, improve customer experience
          and capture more opportunities.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-2xl bg-[#FC72C2] px-6 py-3 font-medium text-white"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="rounded-2xl border border-[#FFB3DF] bg-white px-6 py-3 font-medium text-[#111827]"
          >
            Create an account
          </Link>
        </div>
      </section>
    </main>
  )
}
