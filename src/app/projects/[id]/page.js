'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft, Plus, Settings, Brain,
  Calendar, Flag, Tag, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { tasksAPI, projectsAPI, aiAPI } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const COLUMNS = [
  { id: 'todo', label: 'Todo', color: 'border-gray-600' },
  { id: 'in-progress', label: 'In Progress', color: 'border-blue-500' },
  { id: 'in-review', label: 'In Review', color: 'border-yellow-500' },
  { id: 'done', label: 'Done', color: 'border-green-500' },
]

const PRIORITY_COLORS = {
  low: 'bg-gray-700 text-gray-300',
  medium: 'bg-blue-900 text-blue-300',
  high: 'bg-orange-900 text-orange-300',
  urgent: 'bg-red-900 text-red-300',
}

const PRIORITY_ICONS = {
  low: '↓',
  medium: '→',
  high: '↑',
  urgent: '⚡',
}

export default function ProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showTaskDetail, setShowTaskDetail] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [draggedTask, setDraggedTask] = useState(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo'
  })
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchData()
  }, [user, id])

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        tasksAPI.getByProject(id),
        projectsAPI.getAll()
      ])
      setTasks(tasksRes.data)
      const proj = projectsRes.data.find(p => p._id === id)
      setProject(proj)
    } catch (err) {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const res = await tasksAPI.create(id, {
        ...newTask,
        dueDate: newTask.dueDate || null
      })
      setTasks([...tasks, res.data])
      setShowNewTask(false)
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo' })
      toast.success('Task created!')
    } catch (err) {
      toast.error('Failed to create task')
    }
  }

  const handleDragStart = (task) => setDraggedTask(task)

  const handleDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) return
    try {
      await tasksAPI.updateStatus(draggedTask._id, status)
      setTasks(tasks.map(t => t._id === draggedTask._id ? { ...t, status } : t))
      toast.success(`Moved to ${status}`)
    } catch (err) {
      toast.error('Failed to update task')
    }
    setDraggedTask(null)
  }

  const handleAddComment = async () => {
    if (!comment.trim() || !showTaskDetail) return
    try {
      const res = await tasksAPI.addComment(showTaskDetail._id, comment)
      setShowTaskDetail({
        ...showTaskDetail,
        comments: [...(showTaskDetail.comments || []), res.data]
      })
      setComment('')
      toast.success('Comment added')
    } catch (err) {
      toast.error('Failed to add comment')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await tasksAPI.delete(taskId)
      setTasks(tasks.filter(t => t._id !== taskId))
      setShowTaskDetail(null)
      toast.success('Task deleted')
    } catch (err) {
      toast.error('Failed to delete task')
    }
  }

  const handleAISuggest = async () => {
    if (!project) return
    setAiLoading(true)
    try {
      const res = await aiAPI.suggestTasks(project.name, project.description)
      setAiSuggestions(res.data.suggestions)
    } catch (err) {
      toast.error('AI service unavailable')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAddAITask = async (suggestion) => {
    try {
      const res = await tasksAPI.create(id, {
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority || 'medium',
        status: 'todo'
      })
      setTasks([...tasks, res.data])
      setAiSuggestions(aiSuggestions.filter(s => s.title !== suggestion.title))
      toast.success('Task added!')
    } catch (err) {
      toast.error('Failed to add task')
    }
  }

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'done') return false
    return new Date() > new Date(task.dueDate)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg">{project?.name || 'Project'}</h1>
            <p className="text-gray-400 text-xs">{tasks.length} tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => { setShowAI(true); handleAISuggest() }}
            className="bg-purple-700 hover:bg-purple-600 text-sm">
            <Brain size={16} className="mr-2" /> AI Suggest
          </Button>
          <Button
            onClick={() => setShowNewTask(true)}
            className="bg-blue-600 hover:bg-blue-700 text-sm">
            <Plus size={16} className="mr-2" /> Add Task
          </Button>
          <button
            onClick={() => router.push(`/projects/${id}/settings`)}
            className="p-2 hover:bg-gray-800 rounded-lg">
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {/* Kanban Board */}
      <div className="p-6 flex gap-4 overflow-x-auto min-h-screen">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex-shrink-0 w-72"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}>

            {/* Column header */}
            <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${col.color}`}>
              <span className="font-semibold text-sm">{col.label}</span>
              <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                {getTasksByStatus(col.id).length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {getTasksByStatus(col.id).map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onClick={() => setShowTaskDetail(task)}
                  className={`bg-gray-900 border rounded-xl p-4 cursor-pointer hover:border-blue-700 transition-colors ${
                    isOverdue(task) ? 'border-red-800' : 'border-gray-700'
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-medium leading-tight">{task.title}</h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                      {PRIORITY_ICONS[task.priority]}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {task.labels?.map(label => (
                        <span key={label} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                          {label}
                        </span>
                      ))}
                    </div>
                    {task.dueDate && (
                      <span className={`text-xs flex items-center gap-1 ${isOverdue(task) ? 'text-red-400' : 'text-gray-500'}`}>
                        <Calendar size={10} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {task.comments?.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      💬 {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}

              {/* Add task button in column */}
              <button
                onClick={() => { setNewTask({...newTask, status: col.id}); setShowNewTask(true) }}
                className="w-full text-gray-600 hover:text-gray-400 text-sm py-2 border border-dashed border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
                + Add task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Task Dialog */}
      <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Create new task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 mt-2">
            <div>
              <label className="text-sm text-gray-300">Title</label>
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-300">Description</label>
              <Input
                placeholder="Optional description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-300">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300">Due date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline"
                className="flex-1 border-gray-700 text-gray-300"
                onClick={() => setShowNewTask(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Create task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      {showTaskDetail && (
        <Dialog open={!!showTaskDetail} onOpenChange={() => setShowTaskDetail(null)}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg">{showTaskDetail.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded font-medium ${PRIORITY_COLORS[showTaskDetail.priority]}`}>
                  {PRIORITY_ICONS[showTaskDetail.priority]} {showTaskDetail.priority}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300">
                  {showTaskDetail.status}
                </span>
                {showTaskDetail.dueDate && (
                  <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isOverdue(showTaskDetail) ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-300'}`}>
                    <Calendar size={10} />
                    {new Date(showTaskDetail.dueDate).toLocaleDateString()}
                    {isOverdue(showTaskDetail) && ' (overdue)'}
                  </span>
                )}
              </div>

              {showTaskDetail.description && (
                <p className="text-gray-400 text-sm">{showTaskDetail.description}</p>
              )}

              <div className="border-t border-gray-800 pt-4">
                <h4 className="text-sm font-medium mb-3">
                  Comments ({showTaskDetail.comments?.length || 0})
                </h4>
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {showTaskDetail.comments?.map((c, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">
                        {c.user?.name || 'User'}
                      </p>
                      <p className="text-sm">{c.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button onClick={handleAddComment}
                    className="bg-blue-600 hover:bg-blue-700 text-sm">
                    Send
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => handleDeleteTask(showTaskDetail._id)}
                  variant="outline"
                  className="border-red-800 text-red-400 hover:bg-red-950 text-sm">
                  Delete task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Suggestions Dialog */}
      <Dialog open={showAI} onOpenChange={setShowAI}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="text-purple-400" size={20} />
              AI Task Suggestions
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {aiLoading ? (
              <div className="text-center py-8 text-gray-400">
                <Brain className="mx-auto mb-3 animate-pulse text-purple-400" size={32} />
                <p>AI is thinking...</p>
              </div>
            ) : aiSuggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No suggestions available</p>
                <Button onClick={handleAISuggest}
                  className="mt-3 bg-purple-700 hover:bg-purple-600">
                  Try again
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {aiSuggestions.map((s, i) => (
                  <div key={i}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.title}</p>
                      {s.description && (
                        <p className="text-xs text-gray-400 mt-1">{s.description}</p>
                      )}
                      <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded ${PRIORITY_COLORS[s.priority || 'medium']}`}>
                        {s.priority || 'medium'}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleAddAITask(s)}
                      className="bg-purple-700 hover:bg-purple-600 text-xs px-3 py-1 h-auto flex-shrink-0">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}