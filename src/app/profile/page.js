'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, User, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { usersAPI } from '@/lib/api'

export default function ProfilePage() {
  const router = useRouter()
  const { user, login } = useAuth()
  const [form, setForm] = useState({ name: '', username: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    setForm({ name: user.name || '', username: user.username || '' })
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await usersAPI.updateMe(form)
      login(res.data, localStorage.getItem('devtrack_token'))
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">Profile</h1>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-20 h-20 mb-4">
              {user?.avatar && <AvatarImage src={user.avatar} />}
              <AvatarFallback className="bg-blue-700 text-white text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            {user?.authProvider && user.authProvider !== 'local' && (
              <span className="mt-2 text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
                Signed in with {user.authProvider}
              </span>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-gray-300">Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-gray-300">Username</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({...form, username: e.target.value.toLowerCase()})}
                  className="bg-gray-800 border-gray-700 text-white pl-7"
                  placeholder="yourname"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Others can find you by @{form.username || 'username'}
              </p>
            </div>

            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                value={user?.email}
                disabled
                className="mt-1 bg-gray-800 border-gray-700 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <Button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
              <Save size={16} className="mr-2" />
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}