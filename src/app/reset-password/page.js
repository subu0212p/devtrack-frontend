'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Kanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authAPI } from '@/lib/api'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      return toast.error('Passwords do not match')
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    const token = searchParams.get('token')
    if (!token) {
      return toast.error('Invalid reset link')
    }

    setLoading(true)
    try {
      await authAPI.resetPassword(token, password)
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Kanban className="text-blue-500" size={32} />
          <span className="text-2xl font-bold text-white">DevTrack</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
          <p className="text-gray-400 mb-6">Enter your new password below</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">New password</Label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">Confirm new password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <Button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-5">
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}