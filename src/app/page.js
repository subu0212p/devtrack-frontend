'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Kanban, Zap, Users, Bell, Brain, Shield,
  ArrowRight, GitBranch, CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: Kanban,
    title: 'Kanban Board',
    description: 'Drag and drop tasks between Todo, In Progress, In Review and Done columns',
    color: 'text-blue-500'
  },
  {
    icon: Brain,
    title: 'AI Powered',
    description: 'Get AI task suggestions, improve descriptions, and plan sprints automatically',
    color: 'text-purple-500'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite members, assign tasks, and work together in real time',
    color: 'text-green-500'
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Get email reminders for due dates and never miss a deadline again',
    color: 'text-orange-500'
  },
  {
    icon: Zap,
    title: 'Priority System',
    description: 'Mark tasks as urgent, high, medium or low priority with color coding',
    color: 'text-yellow-500'
  },
  {
    icon: Shield,
    title: 'Secure Auth',
    description: 'Sign in with Google, GitHub or email with full verification',
    color: 'text-red-500'
  }
]

const stats = [
  { value: '8+', label: 'API Endpoints' },
  { value: 'AI', label: 'Powered' },
  { value: '∞', label: 'Projects' },
  { value: '100%', label: 'Free' }
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Kanban className="text-blue-500" size={28} />
          <span className="text-xl font-bold">DevTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/login')}>
            Login
          </Button>
          <Button onClick={() => router.push('/register')}
            className="bg-blue-600 hover:bg-blue-700">
            Get Started Free
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <Badge className="mb-6 bg-blue-950 text-blue-400 border-blue-800">
          ✨ Now with AI task suggestions
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Project management
          <span className="text-blue-500"> built for developers</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Track projects, manage tasks with AI assistance, collaborate with your team,
          and never miss a deadline — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            size="lg"
            onClick={() => router.push('/register')}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
            Start for free <ArrowRight size={20} className="ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/login')}
            className="text-lg px-8 py-6 border-gray-700 text-gray-300 hover:bg-gray-800">
            <GitBranch size={20} className="mr-2" />  Sign in with GitHub
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-black text-blue-500 mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Everything your team needs
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Built with the tools developers actually use and love
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-800 transition-colors">
              <feature.icon className={`${feature.color} mb-4`} size={32} />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-950 to-purple-950 border border-blue-800 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to ship faster?</h2>
          <p className="text-gray-400 mb-8">
            Join developers who use DevTrack to stay organized and deliver on time.
          </p>
          <div className="flex flex-col gap-3 items-center">
            {['Kanban board with drag and drop', 'AI task suggestions', 'Email reminders for due dates'].map(item => (
              <div key={item} className="flex items-center gap-2 text-gray-300">
                <CheckCircle size={18} className="text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Button
            size="lg"
            onClick={() => router.push('/register')}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-lg px-10 py-6">
            Get started — it's free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Kanban className="text-blue-500" size={16} />
          <span className="font-semibold text-gray-400">DevTrack</span>
        </div>
        Built with Node.js, MongoDB, Docker, GitHub Actions & ❤️
      </footer>
    </div>
  )
}