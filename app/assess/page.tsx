'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import Link from 'next/link'
import {
  Database,
  FileText,
  Monitor,
  BarChart3,
  TrendingUp,
  Home
} from 'lucide-react'
import { ItemBank } from '@/components/assess/ItemBank'
import { PaperAssembler } from '@/components/assess/PaperAssembler'
import { OnlineQuiz } from '@/components/assess/OnlineQuiz'
import { AnalyticsDashboard } from '@/components/assess/AnalyticsDashboard'
import { useTranslation } from '@/hooks/useTranslation'

export default function AssessPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('bank')

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">{t('Assessment Hub')}</h1>
          <p className="text-text-primary-light">{t('Comprehensive test bank with auto-grading, analytics dashboard, and progress tracking')}</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-soft-cyan-50 border-soft-cyan-200">
            <Home className="h-4 w-4" />
            {t('Back to Home')}
          </Button>
        </Link>
      </div>

      {/* 功能统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">{t('Question Bank')}</p>
                <p className="text-2xl font-bold text-text-primary">1,247</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">{t('Monthly Papers')}</p>
                <p className="text-2xl font-bold text-text-primary">32</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">{t('Online Quizzes')}</p>
                <p className="text-2xl font-bold text-text-primary">156</p>
              </div>
              <Monitor className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">{t('Average Score')}</p>
                <p className="text-2xl font-bold text-text-primary">76.5</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要功能区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {t('Item Bank')}
          </TabsTrigger>
          <TabsTrigger value="assemble" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('Paper Assembly')}
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            {t('Online Quiz')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('Analytics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bank" className="space-y-6">
          <ItemBank />
        </TabsContent>

        <TabsContent value="assemble" className="space-y-6">
          <PaperAssembler />
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6">
          <OnlineQuiz />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}