'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Library,
  Star,
  FileText,
  Presentation,
  BookOpen,
  MessageSquare,
  Gamepad2,
  Layout,
  Users,
  Download
} from 'lucide-react'
import { MyResources } from '@/components/library/MyResources'
import { TemplateCenter } from '@/components/library/TemplateCenter'

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('my-resources')

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">教学资源库</h1>
          <p className="text-text-primary-light">管理和分享您的教学资源与模板</p>
        </div>
      </div>

      {/* 功能统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">我的资源</p>
                <p className="text-2xl font-bold text-text-primary">23</p>
              </div>
              <Library className="h-8 w-8 text-soft-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">收藏模板</p>
                <p className="text-2xl font-bold text-text-primary">8</p>
              </div>
              <Star className="h-8 w-8 text-soft-cyan-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">共享资源</p>
                <p className="text-2xl font-bold text-text-primary">15</p>
              </div>
              <Users className="h-8 w-8 text-soft-cyan-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">下载次数</p>
                <p className="text-2xl font-bold text-text-primary">156</p>
              </div>
              <Download className="h-8 w-8 text-soft-cyan-900" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要功能区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-resources" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            我的资源
          </TabsTrigger>
          <TabsTrigger value="template-center" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            模板中心
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-resources" className="space-y-6">
          <MyResources />
        </TabsContent>

        <TabsContent value="template-center" className="space-y-6">
          <TemplateCenter />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}