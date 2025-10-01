'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Loader2, Plus, X, Wand2 } from 'lucide-react'
import type { WritingTask, WritingTaskForm } from '@/types/writing'
import toast from 'react-hot-toast'

interface WritingTaskGeneratorProps {
  onTaskGenerated: (task: WritingTask) => void
  isGenerating?: boolean
}

export function WritingTaskGenerator({ onTaskGenerated, isGenerating = false }: WritingTaskGeneratorProps) {
  const [formData, setFormData] = useState<WritingTaskForm>({
    genre: '记叙文',
    level: 'A2',
    topic: '',
    requirements: '',
    word_count_min: 80,
    word_count_max: 120,
    target_vocabulary: '',
    target_structures: ''
  })
  const [localLoading, setLocalLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.topic.trim()) {
      toast.error('请输入写作主题')
      return
    }

    if (!formData.requirements.trim()) {
      toast.error('请输入写作要求')
      return
    }

    if (formData.word_count_min >= formData.word_count_max) {
      toast.error('最小字数应小于最大字数')
      return
    }

    setLocalLoading(true)

    try {
      const response = await fetch('/api/writing/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '生成任务失败')
      }

      const task = await response.json()
      onTaskGenerated(task)
    } catch (error) {
      console.error('Error generating task:', error)
      toast.error(error instanceof Error ? error.message : '生成任务失败，请重试')
    } finally {
      setLocalLoading(false)
    }
  }

  const isLoading = localLoading || isGenerating

  // 预设主题选项
  const topicSuggestions = {
    '记叙文': ['我的假期生活', '难忘的一天', '我的好朋友', '第一次做饭', '学校生活趣事'],
    '应用文': ['写信给朋友', '商店投诉信', '求职申请', '活动邀请函', '感谢信'],
    '议论文': ['网络学习的利弊', '环保的重要性', '读书的价值', '运动与健康', '科技对生活的影响']
  }

  const handleTopicSuggestion = (topic: string) => {
    setFormData(prev => ({ ...prev, topic }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          生成写作任务
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 文体和级别选择 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">文体类型</label>
              <Select
                value={formData.genre}
                onValueChange={(value: '记叙文' | '应用文' | '议论文') =>
                  setFormData(prev => ({ ...prev, genre: value, topic: '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="记叙文">记叙文</SelectItem>
                  <SelectItem value="应用文">应用文</SelectItem>
                  <SelectItem value="议论文">议论文</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">难度级别</label>
              <Select
                value={formData.level}
                onValueChange={(value: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') =>
                  setFormData(prev => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1 (初级)</SelectItem>
                  <SelectItem value="A2">A2 (初中级)</SelectItem>
                  <SelectItem value="B1">B1 (中级)</SelectItem>
                  <SelectItem value="B2">B2 (中高级)</SelectItem>
                  <SelectItem value="C1">C1 (高级)</SelectItem>
                  <SelectItem value="C2">C2 (精通级)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 主题输入 */}
          <div>
            <label className="text-sm font-medium mb-2 block">写作主题</label>
            <Input
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="请输入写作主题"
              className="mb-2"
            />

            {/* 主题建议 */}
            <div className="space-y-2">
              <p className="text-xs text-gray-600">主题建议：</p>
              <div className="flex flex-wrap gap-1">
                {topicSuggestions[formData.genre].map((topic, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary-50 text-xs"
                    onClick={() => handleTopicSuggestion(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 写作要求 */}
          <div>
            <label className="text-sm font-medium mb-2 block">写作要求</label>
            <Textarea
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="请描述具体的写作要求和任务背景..."
              rows={3}
            />
          </div>

          {/* 字数范围 */}
          <div>
            <label className="text-sm font-medium mb-2 block">字数要求</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={formData.word_count_min}
                onChange={(e) => setFormData(prev => ({ ...prev, word_count_min: parseInt(e.target.value) || 0 }))}
                placeholder="最少字数"
                min="20"
                max="500"
              />
              <Input
                type="number"
                value={formData.word_count_max}
                onChange={(e) => setFormData(prev => ({ ...prev, word_count_max: parseInt(e.target.value) || 0 }))}
                placeholder="最多字数"
                min="30"
                max="1000"
              />
            </div>
          </div>

          {/* 目标词汇 */}
          <div>
            <label className="text-sm font-medium mb-2 block">目标词汇</label>
            <Input
              value={formData.target_vocabulary}
              onChange={(e) => setFormData(prev => ({ ...prev, target_vocabulary: e.target.value }))}
              placeholder="用逗号分隔，如：house, school, friend"
            />
          </div>

          {/* 目标句型 */}
          <div>
            <label className="text-sm font-medium mb-2 block">目标句型</label>
            <Input
              value={formData.target_structures}
              onChange={(e) => setFormData(prev => ({ ...prev, target_structures: e.target.value }))}
              placeholder="用逗号分隔，如：I think that..., It is important to..."
            />
          </div>

          {/* 生成按钮 */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                生成任务中...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                生成写作任务
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}