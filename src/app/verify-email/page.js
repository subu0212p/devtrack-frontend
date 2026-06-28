'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Kanban, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      return
    }
    verifyEmail(token)
  }, [])

  const verifyEmail = async (token) => {
    try {
      const res = await authAPI.verifyEmail(token)
      login(res.data, res.data.token)
      setStatus('success')
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Kanban className="text-blue-500" size={32} />
          <span className="text-2xl font-bold text-white">DevTrack</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {status === 'loading' && (
            <>
              <div className="text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-bold text-white mb-2">Email verified!</h2>
              <p className="text-gray-400 mb-6">You're being redirected to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="text-red-500 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-bold text-white mb-2">Verification failed</h2>
              <p className="text-gray-400 mb-6">The link is invalid or has expired.</p>
              <Button
                onClick={() => router.push('/register')}
                className="w-full bg-blue-600 hover:bg-blue-700">
                Register again
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}