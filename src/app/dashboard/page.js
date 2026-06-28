'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Kanban, Plus, LogOut, Bell, User,
  FolderOpen, CheckCircle, Clock, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { projectsAPI, tasksAPI, notificationsAPI } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const getProjectStatus = (tasks) => {
  if (!tasks || tasks.length === 0) return 'empty'
  const allDone = tasks.every(t => t.status === 'done')
  if (allDone) return 'completed'
  const hasOverdue = tasks.some(t =>
    t.dueDate && new Date() > new Date(t.dueDate) && t.status !== 'done'
  )
  if (hasOverdue) return 'overdue'
  const hasInProgress = tasks.some(t =>
    t.status === 'in-progress' || t.status === 'in-review'
  )
  if (hasInProgress) return 'in-progress'
  return 'not-started'
}

const STATUS_STYLES = {
  completed: 'bg-green-900 text-green-300',
  'in-progress': 'bg-blue-900 text-blue-300',
  overdue: 'bg-red-900 text-red-300',
  'not-started': 'bg-gray-800 text-gray-400',
  empty: 'bg-gray-800 text-gray-500',
}

const STATUS_LABELS = {
  completed: '✓ Completed',
  'in-progress': '→ In Progress',
  overdue: '⚠ Overdue',
  'not-started': '○ Not Started',
  empty: '+ No tasks yet',
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [projectTasks, setProjectTasks] = useState({})
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [projectsRes, countRes] = await Promise.all([
        projectsAPI.getAll(),
        notificationsAPI.getUnreadCount()
      ])
      const projs = projectsRes.data
      setProjects(projs)
      setUnreadCount(countRes.data.count)

      // fetch tasks for each project
      const tasksMap = {}
      await Promise.all(projs.map(async (p) => {
        try {
          const res = await tasksAPI.getByProject(p._id)
          tasksMap[p._id] = res.data
        } catch {
          tasksMap[p._id] = []
        }
      }))
      setProjectTasks(tasksMap)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll()
      setNotifications(res.data)
    } catch (err) {
      toast.error('Failed to load notifications')
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await projectsAPI.create(newProject)
      setProjects([...projects, res.data])
      setProjectTasks({ ...projectTasks, [res.data._id]: [] })
      setShowNewProject(false)
      setNewProject({ name: '', description: '' })
      toast.success('Project created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await projectsAPI.delete(id)
      setProjects(projects.filter(p => p._id !== id))
      toast.success('Project deleted')
    } catch (err) {
      toast.error('Failed to delete project')
    }
  }

  const handleBellClick = async () => {
    setShowNotifications(true)
    await fetchNotifications()
    if (unreadCount > 0) {
      await notificationsAPI.markAllRead()
      setUnreadCount(0)
    }
  }

  const handleAcceptInvite = async (notification) => {
    if (!notification.link) return
    const token = notification.link.split('token=')[1]
    if (!token) return
    try {
      await projectsAPI.acceptInvite(token)
      toast.success('Joined project!')
      setShowNotifications(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join project')
    }
  }

  // stats
  const stats = {
    all: projects.length,
    completed: projects.filter(p => getProjectStatus(projectTasks[p._id]) === 'completed').length,
    'in-progress': projects.filter(p => getProjectStatus(projectTasks[p._id]) === 'in-progress').length,
    overdue: projects.filter(p => getProjectStatus(projectTasks[p._id]) === 'overdue').length,
  }

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => getProjectStatus(projectTasks[p._id]) === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Kanban className="text-blue-500" size={24} />
          <span className="text-lg font-bold">DevTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleBellClick} className="relative p-2 hover:bg-gray-800 rounded-lg">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => router.push('/profile')}
            className="p-2 hover:bg-gray-800 rounded-lg">
            <User size={20} />
          </button>
          <Button variant="ghost" onClick={logout} className="text-gray-400 hover:text-white">
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => setShowNewProject(true)}
            className="bg-blue-600 hover:bg-blue-700">
            <Plus size={18} className="mr-2" /> New Project
          </Button>
        </div>

        {/* Stats — clickable filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'all', icon: FolderOpen, label: 'All Projects', color: 'text-blue-500' },
            { key: 'completed', icon: CheckCircle, label: 'Completed', color: 'text-green-500' },
            { key: 'in-progress', icon: Clock, label: 'In Progress', color: 'text-yellow-500' },
            { key: 'overdue', icon: AlertCircle, label: 'Overdue', color: 'text-red-500' },
          ].map((stat) => (
            <button key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`bg-gray-900 border rounded-xl p-4 text-left transition-colors ${
                filter === stat.key ? 'border-blue-500' : 'border-gray-800 hover:border-gray-600'
              }`}>
              <stat.icon className={`${stat.color} mb-2`} size={24} />
              <div className="text-2xl font-bold">{stats[stat.key]}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Filter label */}
        {filter !== 'all' && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-400 text-sm">
              Showing: <b className="text-white capitalize">{filter}</b> projects
            </span>
            <button onClick={() => setFilter('all')}
              className="text-xs text-blue-400 hover:text-blue-300">
              Clear filter
            </button>
          </div>
        )}

        {/* Projects grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <FolderOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">
              {filter === 'all' ? 'No projects yet' : `No ${filter} projects`}
            </p>
            {filter === 'all' && (
              <Button onClick={() => setShowNewProject(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus size={16} className="mr-2" /> Create project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const tasks = projectTasks[project._id] || []
              const status = getProjectStatus(tasks)
              const doneTasks = tasks.filter(t => t.status === 'done').length
              return (
                <div key={project._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-700 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/projects/${project._id}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(project._id) }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity">
                      Delete
                    </button>
                  </div>

                  {project.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Status badge */}
                  <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_STYLES[status]}`}>
                    {STATUS_LABELS[status]}
                  </span>

                  {/* Progress bar */}
                  {tasks.length > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{doneTasks}/{tasks.length} tasks done</span>
                        <span>{Math.round((doneTasks / tasks.length) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(doneTasks / tasks.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <span>{(project.members?.length || 0) + 1} member{((project.members?.length || 0) + 1) !== 1 ? 's' : ''}</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New Project Dialog */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4 mt-2">
            <div>
              <label className="text-sm text-gray-300">Project name</label>
              <Input
                placeholder="My awesome project"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-300">Description (optional)</label>
              <Input
                placeholder="What is this project about?"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline"
                className="flex-1 border-gray-700 text-gray-300"
                onClick={() => setShowNewProject(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}
                className="flex-1 bg-blue-600 hover:bg-blue-700">
                {creating ? 'Creating...' : 'Create project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div key={n._id}
                  className={`p-3 rounded-lg border ${n.read ? 'border-gray-800 bg-gray-900' : 'border-blue-800 bg-blue-950'}`}>
                  <p className="text-sm text-white">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                  {n.type === 'invite_received' && n.link && (
                    <Button
                      onClick={() => handleAcceptInvite(n)}
                      className="mt-2 bg-green-700 hover:bg-green-600 text-xs h-7 px-3">
                      Accept invitation
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}