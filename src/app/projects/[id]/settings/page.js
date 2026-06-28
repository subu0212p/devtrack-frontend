'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, UserPlus, Trash2, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { projectsAPI, usersAPI } from '@/lib/api'

export default function ProjectSettingsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchProject()
  }, [user, id])

  const fetchProject = async () => {
    try {
      const res = await projectsAPI.getAll()
      const proj = res.data.find(p => p._id === id)
      if (!proj) { router.push('/dashboard'); return }
      setProject(proj)
    } catch (err) {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (q) => {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await usersAPI.search(q)
      setSearchResults(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const handleInvite = async (email) => {
    const emailToInvite = email || inviteEmail
    if (!emailToInvite) return
    setInviting(true)
    try {
      await projectsAPI.invite(id, emailToInvite)
      toast.success(`Invitation sent to ${emailToInvite}`)
      setInviteEmail('')
      setSearchResults([])
      setSearchQuery('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await projectsAPI.removeMember(id, userId)
      setProject({
        ...project,
        members: project.members.filter(m => m.user._id !== userId)
      })
      toast.success('Member removed')
    } catch (err) {
      toast.error('Failed to remove member')
    }
  }

  const isOwner = project?.owner?._id === user?._id ||
                  project?.owner === user?._id

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push(`/projects/${id}`)}
          className="p-2 hover:bg-gray-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-lg">{project?.name} — Settings</h1>
          <p className="text-gray-400 text-xs">Manage members and invitations</p>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* Invite member */}
        {isOwner && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-blue-400" />
              Invite member
            </h2>

            {/* Search users */}
            <div className="relative mb-4">
              <Input
                placeholder="Search by name, email or username..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-10">
                  {searchResults.map((u) => (
                    <div key={u._id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleInvite(u.email)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-700 text-white text-xs">
                            {u.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                        Invite
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual email invite */}
            <div className="flex gap-3">
              <Input
                placeholder="Or enter email directly..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                type="email"
              />
              <Button
                onClick={() => handleInvite()}
                disabled={inviting || !inviteEmail}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                {inviting ? 'Sending...' : 'Send invite'}
              </Button>
            </div>
          </div>
        )}

        {/* Members list */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Members ({(project?.members?.length || 0) + 1})
          </h2>
          <div className="space-y-3">

            {/* Owner */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-purple-700 text-white">
                    {project?.owner?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {project?.owner?.name}
                    {project?.owner?._id === user?._id && ' (you)'}
                  </p>
                  <p className="text-xs text-gray-400">{project?.owner?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Crown size={14} className="text-yellow-500" />
                <span className="text-xs text-yellow-500 font-medium">Owner</span>
              </div>
            </div>

            {/* Members */}
            {project?.members?.map((member) => (
              <div key={member.user?._id}
                className="flex items-center justify-between py-2 border-t border-gray-800">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-blue-700 text-white">
                      {member.user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.user?.name}
                      {member.user?._id === user?._id && ' (you)'}
                    </p>
                    <p className="text-xs text-gray-400">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 capitalize">{member.role}</span>
                  {(isOwner || member.user?._id === user?._id) && (
                    <button
                      onClick={() => handleRemoveMember(member.user?._id)}
                      className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending invites */}
        {isOwner && project?.invites?.filter(i => i.status === 'pending').length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Pending invites</h2>
            <div className="space-y-2">
              {project.invites
                .filter(i => i.status === 'pending')
                .map((invite, i) => (
                  <div key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-800">
                    <p className="text-sm text-gray-300">{invite.email}</p>
                    <span className="text-xs text-yellow-500 bg-yellow-950 px-2 py-0.5 rounded">
                      Pending
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}