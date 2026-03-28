'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { AuthTokens } from '@geta/types'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<AuthTokens>('/api/auth/register', {
        email, password, name: name || undefined,
      })
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push('/chat')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-saffron to-gold
            flex items-center justify-center text-white text-2xl shadow-warm-md">ॐ</div>
          <h1 className="font-yatra text-3xl text-deep-brown">Geta-AI</h1>
          <p className="text-muted text-sm">Create your account to begin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-xs text-muted mb-1.5 font-semibold uppercase tracking-wider">
              Name <span className="normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-deep-brown
                placeholder:text-muted/40 focus:outline-none focus:border-saffron/40 focus:ring-2
                focus:ring-saffron/10 transition-all shadow-warm"
              placeholder="Arjuna" />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs text-muted mb-1.5 font-semibold uppercase tracking-wider">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-deep-brown
                placeholder:text-muted/40 focus:outline-none focus:border-saffron/40 focus:ring-2
                focus:ring-saffron/10 transition-all shadow-warm"
              placeholder="arjuna@kurukshetra.com" />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-muted mb-1.5 font-semibold uppercase tracking-wider">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-deep-brown
                placeholder:text-muted/40 focus:outline-none focus:border-saffron/40 focus:ring-2
                focus:ring-saffron/10 transition-all shadow-warm"
              placeholder="Min 8 characters" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-saffron to-saffron-dark
              hover:from-saffron-dark hover:to-saffron disabled:opacity-50
              text-white font-semibold py-3 rounded-xl transition-all duration-200
              active:scale-[0.98] shadow-warm-md tracking-wide">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-saffron hover:text-saffron-dark font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
