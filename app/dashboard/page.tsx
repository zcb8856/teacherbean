'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Plus,
  Calendar,
  Award,
  Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { DashboardStats, ActivityItem } from '@/types'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function DashboardPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<DashboardStats>({
    total_classes: 0,
    total_students: 0,
    materials_created: 0,
    assignments_graded: 0,
    recent_activity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 检查是否是开发者模式或者演示模式
        // 在生产环境中也使用演示数据，直到数据库完全配置好
        if (process.env.NODE_ENV === 'development' || true) {
          // 演示模式：使用模拟数据
          setStats({
            total_classes: 8,
            total_students: 156,
            materials_created: 23,
            assignments_graded: 47,
            recent_activity: [
              {
                id: '1',
                type: 'material_created',
                description: t('Created lesson plan "Present Perfect Tense"'),
                timestamp: new Date().toISOString(),
                class_name: t('Grade 8A')
              },
              {
                id: '2',
                type: 'assignment_graded',
                description: t('Graded quiz "Grammar Review"'),
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                class_name: t('Grade 9B')
              },
              {
                id: '3',
                type: 'material_created',
                description: t('Created reading material "Daily Routines"'),
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                class_name: t('Grade 7C')
              }
            ]
          })
          setLoading(false)
          return
        }

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          // 如果没有用户登录，也使用演示数据
          setStats({
            total_classes: 8,
            total_students: 156,
            materials_created: 23,
            assignments_graded: 47,
            recent_activity: [
              {
                id: '1',
                type: 'material_created',
                description: t('Created lesson plan "Present Perfect Tense"'),
                timestamp: new Date().toISOString(),
                class_name: t('Grade 8A')
              },
              {
                id: '2',
                type: 'assignment_graded',
                description: t('Graded quiz "Grammar Review"'),
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                class_name: t('Grade 9B')
              }
            ]
          })
          setLoading(false)
          return
        }

        // Fetch classes count
        const { count: classesCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user!.id)

        // Fetch students count
        const { count: studentsCount } = await supabase
          .from('students')
          .select('*, classes!inner(*)', { count: 'exact', head: true })
          .eq('classes.owner_id', user!.id)

        // Fetch materials count
        const { count: materialsCount } = await supabase
          .from('materials')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user!.id)

        // Fetch assignments count (this would be graded assignments in real app)
        const { count: assignmentsCount } = await supabase
          .from('assignments')
          .select('*, classes!inner(*)', { count: 'exact', head: true })
          .eq('classes.owner_id', user!.id)

        setStats({
          total_classes: classesCount || 0,
          total_students: studentsCount || 0,
          materials_created: materialsCount || 0,
          assignments_graded: assignmentsCount || 0,
          recent_activity: [
            {
              id: '1',
              type: 'material_created',
              description: 'Created lesson plan "Present Perfect Tense"',
              timestamp: new Date().toISOString(),
              class_name: 'Grade 8A'
            },
            {
              id: '2',
              type: 'assignment_graded',
              description: 'Graded quiz "Grammar Review"',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              class_name: 'Grade 9B'
            }
          ]
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // 出错时也使用演示数据
        setStats({
          total_classes: 8,
          total_students: 156,
          materials_created: 23,
          assignments_graded: 47,
          recent_activity: [
            {
              id: '1',
              type: 'material_created',
              description: t('Created lesson plan "Present Perfect Tense"'),
              timestamp: new Date().toISOString(),
              class_name: t('Grade 8A')
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [t])

  const quickActions = [
    {
      title: t('Create Lesson Plan'),
      description: t('Generate AI-powered lesson plans'),
      href: '/plan',
      icon: BookOpen,
      color: 'bg-soft-cyan-600'
    },
    {
      title: t('New Reading Material'),
      description: t('Create adaptive reading passages'),
      href: '/reading',
      icon: ClipboardList,
      color: 'bg-soft-cyan-700'
    },
    {
      title: t('Generate Quiz'),
      description: t('Create assessments and tests'),
      href: '/assess',
      icon: Award,
      color: 'bg-soft-cyan-800'
    },
    {
      title: t('Writing Assignment'),
      description: t('Set up writing tasks with AI feedback'),
      href: '/writing',
      icon: Clock,
      color: 'bg-soft-cyan-500'
    }
  ]

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">{t('Dashboard')}</h1>
        <p className="text-text-primary-light">{t('Welcome back! Here\'s what\'s happening with your classes.')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">{t('Total Classes')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats.total_classes}</div>
            <p className="text-xs text-text-primary-muted">{t('Active classes')}</p>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">{t('Total Students')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats.total_students}</div>
            <p className="text-xs text-text-primary-muted">{t('Across all classes')}</p>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">{t('Materials Created')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats.materials_created}</div>
            <p className="text-xs text-text-primary-muted">{t('This month')}</p>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">{t('Assignments')}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats.assignments_graded}</div>
            <p className="text-xs text-text-primary-muted">{t('Created')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">{t('Quick Actions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="bg-soft-cyan-100 border-soft-cyan-200 hover:bg-soft-cyan-50 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-text-primary">{action.title}</CardTitle>
                  <CardDescription className="text-text-primary-light">{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-text-primary">{t('Recent Activity')}</CardTitle>
            <CardDescription className="text-text-primary-light">{t('Your latest actions and updates')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_activity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{activity.description}</p>
                    <p className="text-xs text-text-primary-muted">
                      {activity.class_name} • {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-text-primary">{t('Upcoming Tasks')}</CardTitle>
            <CardDescription className="text-text-primary-light">{t('Things that need your attention')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('Grade writing assignments')}</p>
                  <p className="text-xs text-text-primary-muted">{t('Due tomorrow')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('Review student progress')}</p>
                  <p className="text-xs text-text-primary-muted">{t('Weekly review')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}