'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  Wand2,
  FileText,
  Download,
  Eye,
  Settings,
  PieChart,
  BarChart,
  Save,
  Printer
} from 'lucide-react'
import type { PaperAssemblyForm, AssembledPaper } from '@/types/assess'
import toast from 'react-hot-toast'

export function PaperAssembler() {
  const [formData, setFormData] = useState<PaperAssemblyForm>({
    title: '',
    level: 'A2',
    total_items: 20,
    time_limit: 60,
    instructions: '',
    mcq_count: 8,
    cloze_count: 4,
    error_correction_count: 2,
    matching_count: 2,
    reading_q_count: 3,
    writing_task_count: 1,
    easy_percentage: 30,
    medium_percentage: 50,
    hard_percentage: 20,
    topics: [],
    tags: []
  })

  const [assembledPaper, setAssembledPaper] = useState<AssembledPaper | null>(null)
  const [isAssembling, setIsAssembling] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // 处理表单数据变化
  const handleFormChange = (field: keyof PaperAssemblyForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // 如果是题型数量变化，重新计算总数
    if (field.endsWith('_count')) {
      const counts = {
        mcq_count: field === 'mcq_count' ? value : formData.mcq_count,
        cloze_count: field === 'cloze_count' ? value : formData.cloze_count,
        error_correction_count: field === 'error_correction_count' ? value : formData.error_correction_count,
        matching_count: field === 'matching_count' ? value : formData.matching_count,
        reading_q_count: field === 'reading_q_count' ? value : formData.reading_q_count,
        writing_task_count: field === 'writing_task_count' ? value : formData.writing_task_count
      }

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
      setFormData(prev => ({ ...prev, total_items: total }))
    }
  }

  // 组装试卷
  const handleAssemble = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入试卷标题')
      return
    }

    if (formData.total_items < 5 || formData.total_items > 50) {
      toast.error('题目数量应在5-50之间')
      return
    }

    if (formData.easy_percentage + formData.medium_percentage + formData.hard_percentage !== 100) {
      toast.error('难度分布百分比之和应为100%')
      return
    }

    setIsAssembling(true)

    try {
      const response = await fetch('/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            title: formData.title,
            level: formData.level,
            total_items: formData.total_items,
            time_limit: formData.time_limit,
            instructions: formData.instructions,
            item_distribution: {
              mcq: formData.mcq_count,
              cloze: formData.cloze_count,
              error_correction: formData.error_correction_count,
              matching: formData.matching_count,
              reading_q: formData.reading_q_count,
              writing_task: formData.writing_task_count
            },
            difficulty_distribution: {
              easy: formData.easy_percentage / 100,
              medium: formData.medium_percentage / 100,
              hard: formData.hard_percentage / 100
            },
            topics: formData.topics,
            tags: formData.tags
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '组卷失败')
      }

      const paper = await response.json()
      setAssembledPaper(paper)
      setShowPreview(true)
      toast.success('试卷组装成功！')
    } catch (error) {
      console.error('Error assembling paper:', error)
      toast.error(error instanceof Error ? error.message : '组卷失败，请重试')
    } finally {
      setIsAssembling(false)
    }
  }

  // 下载试卷
  const handleDownload = (format: 'pdf' | 'docx') => {
    if (!assembledPaper) return

    const url = window.URL.createObjectURL(new Blob([assembledPaper.printable_html], {
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${assembledPaper.config.title}.${format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // 题型选项
  const itemTypes = [
    { key: 'mcq', label: '选择题', description: '单选或多选题目' },
    { key: 'cloze', label: '填空题', description: '完形填空或单句填空' },
    { key: 'error_correction', label: '改错题', description: '句子或段落改错' },
    { key: 'matching', label: '配对题', description: '词汇或概念匹配' },
    { key: 'reading_q', label: '阅读理解', description: '阅读文章回答问题' },
    { key: 'writing_task', label: '写作任务', description: '作文或写作练习' }
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">智能组卷器</h2>
          <p className="text-gray-600">根据您的要求自动组装测试试卷</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：组卷设置 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                基本设置
              </CardTitle>
              <CardDescription>设置试卷的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">试卷标题 *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="例如：期中测验 - 语法与词汇"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">难度级别</label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleFormChange('level', value)}
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

                <div>
                  <label className="text-sm font-medium mb-2 block">考试时长（分钟）</label>
                  <Input
                    type="number"
                    value={formData.time_limit}
                    onChange={(e) => handleFormChange('time_limit', parseInt(e.target.value) || 60)}
                    min="15"
                    max="180"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">考试说明</label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => handleFormChange('instructions', e.target.value)}
                  placeholder="请在规定时间内完成所有题目，注意答题规范..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 题型分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                题型分布
              </CardTitle>
              <CardDescription>设置各题型的数量分布</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {itemTypes.map((type) => (
                <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      value={formData[`${type.key}_count` as keyof PaperAssemblyForm] as number}
                      onChange={(e) => handleFormChange(`${type.key}_count` as keyof PaperAssemblyForm, parseInt(e.target.value) || 0)}
                      min="0"
                      max="20"
                      className="text-center"
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-medium text-blue-800">总题数</span>
                <span className="text-lg font-bold text-blue-800">{formData.total_items}</span>
              </div>
            </CardContent>
          </Card>

          {/* 难度分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                难度分布
              </CardTitle>
              <CardDescription>设置题目难度的百分比分布</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">容易 (%)</label>
                  <Input
                    type="number"
                    value={formData.easy_percentage}
                    onChange={(e) => handleFormChange('easy_percentage', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">中等 (%)</label>
                  <Input
                    type="number"
                    value={formData.medium_percentage}
                    onChange={(e) => handleFormChange('medium_percentage', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">困难 (%)</label>
                  <Input
                    type="number"
                    value={formData.hard_percentage}
                    onChange={(e) => handleFormChange('hard_percentage', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">总计</span>
                <span className={`font-bold ${
                  formData.easy_percentage + formData.medium_percentage + formData.hard_percentage === 100
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formData.easy_percentage + formData.medium_percentage + formData.hard_percentage}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleAssemble}
              disabled={isAssembling}
              className="flex-1"
            >
              {isAssembling ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  组装中...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  智能组卷
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 右侧：预览和结果 */}
        <div className="space-y-6">
          {!assembledPaper ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>完成设置后点击"智能组卷"生成试卷</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 组卷结果概览 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    组卷结果
                  </CardTitle>
                  <CardDescription>
                    成功组装试卷：{assembledPaper.config.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">题目数量：</span>
                      <span>{assembledPaper.items.length}</span>
                    </div>
                    <div>
                      <span className="font-medium">考试时长：</span>
                      <span>{assembledPaper.config.time_limit}分钟</span>
                    </div>
                    <div>
                      <span className="font-medium">难度级别：</span>
                      <span>{assembledPaper.config.level}</span>
                    </div>
                    <div>
                      <span className="font-medium">生成时间：</span>
                      <span>{new Date(assembledPaper.created_at).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? '隐藏预览' : '查看预览'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload('pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload('docx')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载Word
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 试卷预览 */}
              {showPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle>试卷预览</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose max-w-none bg-white p-6 border rounded-lg"
                      dangerouslySetInnerHTML={{ __html: assembledPaper.printable_html }}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}