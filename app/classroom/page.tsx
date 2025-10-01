'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Gamepad2, MessageSquare, Trophy, Clock } from 'lucide-react'
import { QuickGames } from '@/components/classroom/QuickGames'
import { DialogCards } from '@/components/classroom/DialogCards'

export default function ClassroomPage() {
  const [activeTab, setActiveTab] = useState<'games' | 'dialogs'>('games')

  const tabs = [
    {
      id: 'games' as const,
      label: '一分钟小游戏',
      icon: Gamepad2,
      description: '拼写快打、句型匹配、快问快答'
    },
    {
      id: 'dialogs' as const,
      label: '情景对话卡',
      icon: MessageSquare,
      description: '生成对话练习卡片'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">智能课堂</h1>
        <p className="text-text-primary-light">互动游戏和对话练习，让课堂更生动有趣</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">今日游戏场次</p>
                <p className="text-2xl font-bold text-text-primary">12</p>
              </div>
              <Gamepad2 className="h-8 w-8 text-soft-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">平均正确率</p>
                <p className="text-2xl font-bold text-text-primary">78%</p>
              </div>
              <Trophy className="h-8 w-8 text-soft-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">平均用时</p>
                <p className="text-2xl font-bold text-text-primary">45秒</p>
              </div>
              <Clock className="h-8 w-8 text-soft-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab 导航 */}
      <div className="border-b border-soft-cyan-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-soft-cyan-500 text-soft-cyan-600'
                  : 'border-transparent text-text-primary-muted hover:text-text-primary hover:border-soft-cyan-300'
              }`}
            >
              <tab.icon className="h-5 w-5 inline-block mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.icon.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 内容 */}
      <div className="mt-6">
        {activeTab === 'games' && <QuickGames />}
        {activeTab === 'dialogs' && <DialogCards />}
      </div>
      </div>
    </div>
  )
}