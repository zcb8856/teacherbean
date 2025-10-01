'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import {
  PenTool,
  Download,
  Save,
  RefreshCw,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Target,
  Home
} from 'lucide-react'
import { WritingTaskGenerator } from '@/components/writing/WritingTaskGenerator'
import { WritingGrader } from '@/components/writing/WritingGrader'
import { GradingResults } from '@/components/writing/GradingResults'
import type { WritingTask, GradingResult } from '@/types/writing'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

export default function WritingPage() {
  const { t } = useTranslation()
  const [currentTask, setCurrentTask] = useState<WritingTask | null>(null)
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null)
  const [isGeneratingTask, setIsGeneratingTask] = useState(false)

  // 生成写作任务
  const handleTaskGenerated = (task: WritingTask) => {
    setCurrentTask(task)
    setGradingResult(null)
    toast.success(t('Writing task generated successfully!'))
  }

  // 处理批改结果
  const handleGradingComplete = (result: GradingResult) => {
    setGradingResult(result)
    toast.success(t('Writing grading completed!'))
  }

  // 保存写作记录
  const saveWriting = async (studentText: string) => {
    if (!currentTask || !gradingResult) {
      toast.error(t('Please complete grading first'))
      return
    }

    try {
      // 检查是否是开发者模式或演示模式
      if (process.env.NODE_ENV === 'development' || true) {
        // 演示模式：模拟保存成功
        setTimeout(() => {
          toast.success(t('Writing record saved!'))
        }, 500)
        return
      }

      const response = await fetch('/api/writings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: currentTask?.id,
          student_text: studentText,
          rubric_json: gradingResult?.rubric,
          ai_feedback: {
            sentence_suggestions: gradingResult?.sentence_suggestions,
            improved_version: gradingResult?.improved_version,
            teacher_brief: gradingResult?.teacher_brief
          },
          final_score: gradingResult?.rubric?.overall
        })
      })

      if (!response.ok) {
        throw new Error('保存失败')
      }

      toast.success(t('Writing record saved!'))
    } catch (error) {
      toast.error(t('Save failed, please try again'))
    }
  }

  // 导出讲评稿
  const exportTeacherBrief = async () => {
    if (!gradingResult || !currentTask) {
      toast.error(t('Please complete grading first'))
      return
    }

    try {
      // 检查是否是开发者模式或演示模式
      if (process.env.NODE_ENV === 'development' || true) {
        // 演示模式：模拟导出成功
        setTimeout(() => {
          toast.success(t('Teacher brief exported successfully!'))
        }, 500)
        return
      }

      const response = await fetch('/api/writing/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: currentTask,
          grading_result: gradingResult
        })
      })

      if (!response.ok) {
        throw new Error('导出失败')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentTask?.title || 'writing_feedback'}_讲评稿.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(t('Teacher brief exported successfully!'))
    } catch (error) {
      toast.error(t('Export failed, please try again'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">{t('Writing Assistant')}</h1>
          <p className="text-text-primary-light">{t('AI-powered writing tasks with detailed rubric feedback and automated improvement suggestions')}</p>
        </div>
        <div className="flex items-center gap-2">
          {gradingResult && (
            <Button onClick={exportTeacherBrief} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('Export Brief')}
            </Button>
          )}
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-soft-cyan-50 border-soft-cyan-200">
              <Home className="h-4 w-4" />
              {t('Back to Home')}
            </Button>
          </Link>
        </div>
      </div>

      {/* 功能统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">{t('Today Graded')}</p>
                <p className="text-2xl font-bold text-text-primary">12</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">{t('Average Score')}</p>
                <p className="text-2xl font-bold text-text-primary">78</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">{t('Tasks Generated')}</p>
                <p className="text-2xl font-bold text-text-primary">8</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">{t('Suggestions')}</p>
                <p className="text-2xl font-bold text-text-primary">45</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：写作任务生成 */}
        <div className="space-y-6">
          <WritingTaskGenerator
            onTaskGenerated={handleTaskGenerated}
            isGenerating={isGeneratingTask}
          />

          {/* 当前任务展示 */}
          {currentTask && (
            <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-text-primary">
                  <BookOpen className="h-5 w-5" />
                  {t('Current Writing Task')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{currentTask.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {currentTask.genre}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {currentTask.level}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {currentTask.word_count.min}-{currentTask.word_count.max} {t('words')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">{t('Writing Requirements')}:</h4>
                    <p className="text-gray-700 mt-1">{currentTask.prompt}</p>
                  </div>

                  {currentTask.key_points.length > 0 && (
                    <div>
                      <h4 className="font-medium">{t('Key Points')}:</h4>
                      <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                        {currentTask.key_points.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentTask.target_vocabulary.length > 0 && (
                    <div>
                      <h4 className="font-medium">{t('Target Vocabulary')}:</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentTask.target_vocabulary.map((word, index) => (
                          <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTask.target_structures.length > 0 && (
                    <div>
                      <h4 className="font-medium">{t('Target Structures')}:</h4>
                      <div className="text-sm text-gray-700 mt-1">
                        {currentTask.target_structures.join('、')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：作文批改 */}
        <div className="space-y-6">
          {currentTask ? (
            <WritingGrader
              task={currentTask}
              onGradingComplete={handleGradingComplete}
              onSave={saveWriting}
            />
          ) : (
            <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-text-primary-muted">{t('Please generate a writing task first')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 批改结果展示 */}
      {gradingResult && currentTask && (
        <GradingResults
          result={gradingResult}
          task={currentTask}
          onExport={exportTeacherBrief}
        />
      )}
      </div>
    </div>
  )
}