'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Kanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authAPI } from '@/lib/api'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      return toast.error('Passwords do not match')
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password
      })
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 mb-4">
              We sent a verification link to <b className="text-white">{form.email}</b>
            </p>
            <p className="text-gray-500 text-sm">
              Click the link in the email to activate your account. Check your spam folder if you don't see it.
            </p>
            <Link href="/login">
              <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700">
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Kanban className="text-blue-500" size={32} />
          <span className="text-2xl font-bold text-white">DevTrack</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400 mb-6">Start managing projects for free</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-gray-300">Full name</Label>
              <Input
                name="name"
                placeholder="Subodh Patel"
                value={form.name}
                onChange={handleChange}
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">Password</Label>
              <Input
                name="password"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">Confirm password</Label>
              <Input
                name="confirm"
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange}
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <Button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}