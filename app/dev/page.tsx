'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Settings, Zap, Home, BookOpen, FileText, Users } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function DevPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const quickAccess = [
    {
      title: '仪表板',
      description: '查看应用概览和统计',
      href: '/dashboard',
      icon: Home,
      color: 'bg-blue-500'
    },
    {
      title: '课程规划',
      description: 'AI驱动的课程计划生成',
      href: '/plan',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      title: '阅读材料',
      description: '自适应阅读内容创建',
      href: '/reading',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: '对话练习',
      description: '互动会话场景练习',
      href: '/dialog',
      icon: Users,
      color: 'bg-orange-500'
    },
    {
      title: '演示页面',
      description: '查看平台功能演示',
      href: '/demo',
      icon: Zap,
      color: 'bg-pink-500'
    },
    {
      title: '认证页面',
      description: '登录和注册界面',
      href: '/auth/login',
      icon: Settings,
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary drop-shadow-sm mb-4">
            🚀 TeacherBean 开发者面板
          </h1>
          <p className="text-xl text-text-primary-light mb-8">
            快速访问平台所有功能，无需登录验证
          </p>
          <Card className="max-w-2xl mx-auto bg-green-50 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                开发者模式已启用
              </CardTitle>
              <CardDescription className="text-green-700">
                您正在使用开发者访问模式。所有功能都可以直接体验，无需真实的后端服务。
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccess.map((item) => (
            <Link key={item.title} href={item.href}>
              <Card className="bg-white border-soft-cyan-200 hover:bg-soft-cyan-50 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-text-primary">{item.title}</CardTitle>
                  <CardDescription className="text-text-primary-light">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    {t('Access Feature')}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Card className="max-w-3xl mx-auto bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-text-primary">开发者说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">🎯 直接访问</h4>
                  <p className="text-sm text-text-primary-light">
                    点击上方卡片直接访问各功能模块，无需登录或注册流程。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">🌐 多语言支持</h4>
                  <p className="text-sm text-text-primary-light">
                    所有页面都支持12种语言切换，语言选择器位于每页右上角。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">🎨 响应式设计</h4>
                  <p className="text-sm text-text-primary-light">
                    界面适配各种设备尺寸，支持桌面、平板和移动端访问。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">⚡ 演示数据</h4>
                  <p className="text-sm text-text-primary-light">
                    所有功能使用模拟数据，展示完整的用户体验流程。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}