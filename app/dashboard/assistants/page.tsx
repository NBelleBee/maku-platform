'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'

type Assistant = {
  id: string
  name: string
  welcome_message: string | null
  is_active: boolean
  business_id: string
  businesses: {
    name: string
  } | null
}

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAssistants() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You are not signed in.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('assistants')
      .select(`
        id,
        name,
        welcome_message,
        is_active,
        business_id,
        businesses (
          name
        )
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('LOAD ASSISTANTS ERROR:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    setAssistants((data || []) as unknown as Assistant[])
    setLoading(false)
  }

  useEffect(() => {
    loadAssistants()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-xl font-semibold text-slate-950">
              MAKU Technologies
            </div>

            <div className="text-sm text-slate-500">
              Business Assistant Platform
            </div>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4
