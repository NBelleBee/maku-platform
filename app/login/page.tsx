'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      router.replace('/dashboard')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold tracking-widest text-[#6B7280]">
          MAKU TECHNOLOGIES
        </p>

        <h1 className="mt-6 text-3xl font-semibold text-[#111827]">
          Welcome back
        </h1>

        <p className="mt-3 text-sm text-[#6B7280]">
          Sign in to manage your Business Assistant.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-[#FFB3DF] px-4 py-3"
          />

          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-[#FFB3DF] px-4 py-3"
          />

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#FC72C2] px-5 py-3 font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="font-medium text-[#111827] underline"
          >
            Create an account
          </button>
        </p>
      </div>
    </main>
  )
}
