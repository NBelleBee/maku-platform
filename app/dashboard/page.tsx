import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { Sidebar } from '@/components/navigation/Sidebar'

export default async function DashboardPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()
'use client'

import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              MAKU Technologies
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Welcome back. Manage your Business Assistants from here.
            </p>
          </div>

          <Link
            href="/dashboard/assistants"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Assistants
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Business Assistants
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Customer Enquiries
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Leads Captured
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              0
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-semibold text-slate-950">
            Welcome to your MAKU workspace
          </h2>

          <p className="mt-2 text-slate-600">
            Create your first Business Assistant to begin managing customer
            enquiries and opportunities.
          </p>

          <Link
            href="/dashboard/assistants/new"
            className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-medium text-white hover:bg-slate-800"
          >
            Create Business Assistant
          </Link>
        </div>
      </section>
    </main>
  )
}
  if (!user) {
    redirect('/login')a
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-64 p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            MAKU Technologies
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Welcome back. Manage your Business Assistants from here.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Business Assistants</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">0</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Customer Enquiries</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">0</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Leads Captured</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">0</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-semibold text-slate-950">
            Welcome to your MAKU workspace
          </h2>

          <p className="mt-2 text-slate-600">
            Create your first Business Assistant to begin managing customer
            enquiries and opportunities.
          </p>

          <a
            href="/dashboard/assistants/new"
            className="mt-6 inline-block rounded-2xl bg-slate-950 px-6 py-3 font-medium text-white"
          >
            Create Business Assistant
          </a>
        </div>
      </main>
    </div>
  )
}
