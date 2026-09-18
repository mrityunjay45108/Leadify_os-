'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500">
            <Zap size={18} className="text-black" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Leadyfy <span className="text-amber-500">OS</span>
          </span>
        </div>

        <div className="rounded-2xl border border-[#222] bg-[#1a1a1a] p-8">
          <h1 className="text-lg font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your agency dashboard</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                required
                className="h-10 w-full rounded-lg bg-[#222] border border-[#2a2a2a] px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 w-full rounded-lg bg-[#222] border border-[#2a2a2a] px-3 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Leadyfy OS · Internal Agency Platform
        </p>
      </div>
    </div>
  )
}
