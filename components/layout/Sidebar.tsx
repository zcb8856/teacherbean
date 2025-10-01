'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  FileText,
  MessageSquare,
  Gamepad2,
  PenTool,
  ClipboardList,
  Library,
  LayoutDashboard,
  LogOut,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Classes',
    href: '/classes',
    icon: Users,
    description: 'Manage classes and students'
  },
  {
    name: 'Smart Classroom',
    href: '/classroom',
    icon: Gamepad2,
    description: 'Interactive games and dialogs'
  },
  {
    name: 'Lesson Planning',
    href: '/plan',
    icon: BookOpen,
    description: 'AI-powered lesson plans'
  },
  {
    name: 'Reading Materials',
    href: '/reading',
    icon: FileText,
    description: 'Adaptive reading passages'
  },
  {
    name: 'Dialog Practice',
    href: '/dialog',
    icon: MessageSquare,
    description: 'Interactive conversations'
  },
  {
    name: 'Quick Games',
    href: '/game',
    icon: Gamepad2,
    description: 'Engaging mini games'
  },
  {
    name: 'Writing Assistant',
    href: '/writing',
    icon: PenTool,
    description: 'AI writing feedback'
  },
  {
    name: 'Assessment Hub',
    href: '/assess',
    icon: ClipboardList,
    description: 'Tests and grading'
  },
  {
    name: 'Library',
    href: '/library',
    icon: Library,
    description: 'Templates and resources'
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
      router.push('/')
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-2xl font-bold text-primary-600">TeacherBean</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col px-6 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-6 w-6 shrink-0',
                          isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                        )}
                        aria-hidden="true"
                      />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-gray-500 font-normal">
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          <li className="mt-auto">
            <button
              onClick={handleSignOut}
              className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-600" />
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}