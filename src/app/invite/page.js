'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Kanban, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { projectsAPI } from '@/lib/api'

export default function InvitePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const [error, setError] = useState(null)
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) return

        if (!user) {
            // save token and redirect to login
            localStorage.setItem('pending_invite_token', token)
            router.push('/login')
            return
        }
    }, [user, token])

    const handleAccept = async () => {
        if (!token) {
            toast.error('Invalid invite link')
            return
        }

        if (!user) {
            localStorage.setItem('pending_invite_token', token)
            router.push('/login')
            return
        }

        setLoading(true)
        try {
            await projectsAPI.acceptInvite(token)
            localStorage.removeItem('pending_invite_token')
            setAccepted(true)
            toast.success('You joined the project!')
            setTimeout(() => router.push('/dashboard'), 2000)
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to accept invite'
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    // auto-accept if token is in URL and user is logged in
    useEffect(() => {
        const pendingToken = localStorage.getItem('pending_invite_token')
        if (pendingToken && user && pendingToken === token) {
            handleAccept()
        }
    }, [user])

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Kanban className="text-blue-500" size={32} />
                    <span className="text-2xl font-bold text-white">DevTrack</span>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                    {accepted ? (
                        <>
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome to the team!</h2>
                            <p className="text-gray-400">Redirecting to your dashboard...</p>
                        </>
                    ) : error ? (
                        <>
                            <div className="text-5xl mb-4">❌</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
                            <p className="text-gray-400 mb-6">{error}</p>
                            <Button onClick={() => router.push('/dashboard')}
                                className="w-full bg-blue-600 hover:bg-blue-700">
                                Go to dashboard
                            </Button>
                        </>
                    ) : !user ? (
                        <>
                            <Users className="text-blue-500 mx-auto mb-4" size={48} />
                            <h2 className="text-2xl font-bold text-white mb-2">Sign in to accept</h2>
                            <p className="text-gray-400 mb-6">
                                You need to be signed in to accept this invitation.
                            </p>
                            <Button onClick={() => {
                                localStorage.setItem('pending_invite_token', token)
                                router.push('/login')
                            }} className="w-full bg-blue-600 hover:bg-blue-700 py-5">
                                Sign in to continue
                            </Button>
                        </>
                    ) : (
                        <>
                            <Users className="text-blue-500 mx-auto mb-4" size={48} />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                You've been invited!
                            </h2>
                            <p className="text-gray-400 mb-8">
                                You have been invited to collaborate on a DevTrack project.
                                Click below to accept and join the team.
                            </p>
                            {user && (
                                <p className="text-yellow-400 text-sm mb-4 bg-yellow-950 border border-yellow-800 rounded-lg p-3">
                                    ⚠ You are accepting as <b>{user.email}</b>.
                                    Make sure this is the correct account.
                                </p>
                            )}
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleAccept}
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 py-5 text-lg">
                                    {loading ? 'Joining...' : 'Accept invitation'}
                                </Button>
                                <Button
                                    onClick={() => router.push('/dashboard')}
                                    variant="outline"
                                    className="w-full border-gray-700 text-gray-300">
                                    Decline
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}