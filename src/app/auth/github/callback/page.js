'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authAPI } from '@/lib/api'
import { Kanban } from 'lucide-react'

export default function GitHubCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setError('No authorization code received')
      return
    }
    handleGitHubCallback(code)
  }, [])

  const handleGitHubCallback = async (code) => {
    try {
      const res = await authAPI.githubLogin({ code })
      login(res.data, res.data.token)
    } catch (err) {
      setError('GitHub login failed. Please try again.')
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
          {error ? (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-xl font-bold text-white mb-2">Login failed</h2>
              <p className="text-gray-400">{error}</p>
              <button
                onClick={() => router.push('/login')}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
                Back to login
              </button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-white">Signing you in...</h2>
              <p className="text-gray-400 mt-2">Please wait</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}