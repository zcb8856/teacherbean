'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Loader2, PenTool, Bot, Save, RotateCcw } from 'lucide-react'
import type { WritingTask, GradingResult } from '@/types/writing'
import toast from 'react-hot-toast'

interface WritingGraderProps {
  task: WritingTask
  onGradingComplete: (result: GradingResult) => void
  onSave: (studentText: string) => void
}

export function WritingGrader({ task, onGradingComplete, onSave }: WritingGraderProps) {
  const [studentText, setStudentText] = useState('')
  const [studentName, setStudentName] = useState('')
  const [isGrading, setIsGrading] = useState(false)
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null)

  const wordCount = studentText.trim().split(/\s+/).filter(word => word.length > 0).length

  const handleGrading = async () => {
    if (!studentText.trim()) {
      toast.error('请输入学生作文内容')
      return
    }

    if (wordCount < task.word_count.min || wordCount > task.word_count.max) {
      toast.error(`字数应在 ${task.word_count.min}-${task.word_count.max} 词之间`)
      return
    }

    setIsGrading(true)

    try {
      const response = await fetch('/api/writing/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: task.id,
          student_text: studentText,
          student_name: studentName,
          task: task
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '批改失败')
      }

      const result = await response.json()
      setGradingResult(result)
      onGradingComplete(result)
      toast.success('批改完成！')
    } catch (error) {
      console.error('Error grading:', error)
      toast.error(error instanceof Error ? error.message : '批改失败，请重试')
    } finally {
      setIsGrading(false)
    }
  }

  const handleSave = () => {
    if (!gradingResult) {
      toast.error('请先完成批改')
      return
    }
    onSave(studentText)
  }

  const handleReset = () => {
    setStudentText('')
    setStudentName('')
    setGradingResult(null)
    toast.success('已重置')
  }

  const isWordCountValid = wordCount >= task.word_count.min && wordCount <= task.word_count.max
  const isWordCountWarning = wordCount > 0 && !isWordCountValid

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          学生作文批改
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 学生信息 */}
        <div>
          <label className="text-sm font-medium mb-2 block">学生姓名（可选）</label>
          <Input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="请输入学生姓名"
          />
        </div>

        {/* 作文输入区域 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">学生作文</label>
            <div className="flex items-center gap-2 text-sm">
              <span className={`${isWordCountWarning ? 'text-red-600' : 'text-gray-600'}`}>
                当前字数: {wordCount}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                要求: {task.word_count.min}-{task.word_count.max} 词
              </span>
            </div>
          </div>

          <Textarea
            value={studentText}
            onChange={(e) => setStudentText(e.target.value)}
            placeholder={`请粘贴或输入学生作文内容...\n\n写作任务：${task.title}\n要求：${task.prompt}`}
            rows={12}
            className={`${isWordCountWarning ? 'border-red-300 focus:border-red-500' : ''}`}
          />

          {isWordCountWarning && (
            <p className="text-sm text-red-600 mt-1">
              字数超出范围，请检查输入内容
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            onClick={handleGrading}
            disabled={isGrading || !studentText.trim() || isWordCountWarning}
            className="flex-1"
          >
            {isGrading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI 批改中...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                AI 批改
              </>
            )}
          </Button>

          {gradingResult && (
            <Button
              onClick={handleSave}
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              保存记录
            </Button>
          )}

          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* 快速批改状态 */}
        {gradingResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">批改完成</span>
              </div>
              <div className="text-lg font-bold text-green-800">
                {gradingResult.rubric.overall}/100
              </div>
            </div>
            <p className="text-sm text-green-700 mt-1">
              点击下方查看详细批改结果和改进建议
            </p>
          </div>
        )}

        {/* 任务提醒 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">当前任务提醒</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>主题：</strong>{task.title}</p>
            <p><strong>文体：</strong>{task.genre} | <strong>级别：</strong>{task.level}</p>
            {task.target_vocabulary.length > 0 && (
              <p><strong>目标词汇：</strong>{task.target_vocabulary.join(', ')}</p>
            )}
            {task.target_structures.length > 0 && (
              <p><strong>目标句型：</strong>{task.target_structures.join(', ')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}