import { useState } from 'react'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    window.setTimeout(() => setIsSubmitting(false), 1400)
  }

  return (
    <div className="pt-20 min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        {isSubmitting && (
          <div className="absolute inset-0 z-10 bg-white/95 p-8 backdrop-blur-sm">
            <div className="animate-pulse">
              <div className="mx-auto mb-6 h-8 w-40 rounded-lg bg-orange-100" />
              <div className="space-y-4">
                <div className="h-12 rounded-xl bg-gray-100" />
                <div className="h-12 rounded-xl bg-gray-100" />
                <div className="h-12 rounded-xl bg-orange-200" />
              </div>
              <div className="mx-auto mt-5 h-4 w-48 rounded bg-gray-100" />
              <p className="mt-6 text-center text-sm font-semibold text-orange-600">
                Signing you in...
              </p>
            </div>
          </div>
        )}
        <h1 className="font-display text-2xl font-bold text-gray-900 text-center mb-6">
          Welcome Back
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input type="text" placeholder="Username or Email"
            value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            disabled={isSubmitting}
            required />
          <input type="password" placeholder="Password"
            value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            disabled={isSubmitting}
            required />
          <button className="w-full btn-primary py-3" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account? <a href="/signup" className="text-orange-500 font-medium">Sign up</a>
        </p>
      </div>
    </div>
  )
}
