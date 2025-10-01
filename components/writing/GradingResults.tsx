'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  ClipboardCheck,
  Download,
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp,
  FileText,
  MessageSquare
} from 'lucide-react'
import type { GradingResult, WritingTask } from '@/types/writing'

interface GradingResultsProps {
  result: GradingResult
  task: WritingTask
  onExport: () => void
}

export function GradingResults({ result, task, onExport }: GradingResultsProps) {
  const { rubric, sentence_suggestions, improved_version, teacher_brief } = result

  // 计算等级
  const getGradeLevel = (score: number) => {
    if (score >= 90) return { level: 'A', color: 'bg-green-500', label: '优秀' }
    if (score >= 80) return { level: 'B', color: 'bg-blue-500', label: '良好' }
    if (score >= 70) return { level: 'C', color: 'bg-yellow-500', label: '中等' }
    if (score >= 60) return { level: 'D', color: 'bg-orange-500', label: '及格' }
    return { level: 'F', color: 'bg-red-500', label: '不及格' }
  }

  const gradeInfo = getGradeLevel(rubric.overall)

  // 评分标准详情
  const rubricItems = [
    { key: 'task_response', label: '任务完成度', score: rubric.task_response, icon: Target },
    { key: 'accuracy', label: '语言准确性', score: rubric.accuracy, icon: ClipboardCheck },
    { key: 'lexical_range', label: '词汇丰富度', score: rubric.lexical_range, icon: BookOpen },
    { key: 'cohesion', label: '语言连贯性', score: rubric.cohesion, icon: MessageSquare },
    { key: 'organization', label: '文章结构', score: rubric.organization, icon: FileText }
  ]

  return (
    <div className="space-y-6">
      {/* 总体评分卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              批改结果
            </CardTitle>
            <Button onClick={onExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出讲评稿
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 总分展示 */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${gradeInfo.color} text-white text-2xl font-bold mb-2`}>
                {gradeInfo.level}
              </div>
              <div className="text-3xl font-bold text-gray-900">{rubric.overall}/100</div>
              <div className="text-sm text-gray-600">{gradeInfo.label}</div>
            </div>

            {/* 评分分布 */}
            <div className="space-y-3">
              {rubricItems.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-gray-600">{item.score}/5</span>
                    </div>
                    <Progress value={(item.score / 5) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>

            {/* 讲评摘要 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">讲评重点</h4>
              <p className="text-sm text-blue-800 leading-relaxed">{rubric.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 修改建议 */}
      {sentence_suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              句子修改建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentence_suggestions.map((suggestion, index) => (
                <div key={suggestion.idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">第 {suggestion.idx} 句</Badge>
                    <span className="text-sm text-gray-600">{suggestion.reason}</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-red-700">原句：</span>
                      <p className="text-sm bg-red-50 border border-red-200 rounded p-2 mt-1">
                        {suggestion.before}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-green-700">建议：</span>
                      <p className="text-sm bg-green-50 border border-green-200 rounded p-2 mt-1">
                        {suggestion.after}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 改进版本 */}
      {improved_version && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              改进版本参考
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{improved_version}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * 此为AI生成的改进版本，仅供参考。鼓励学生保持自己的写作风格。
            </p>
          </CardContent>
        </Card>
      )}

      {/* 教师简评 */}
      {teacher_brief && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              教师简评
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{teacher_brief}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 任务信息回顾 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            任务信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">写作任务：</span>
              <span className="text-gray-700">{task.title}</span>
            </div>
            <div>
              <span className="font-medium">文体级别：</span>
              <span className="text-gray-700">{task.genre} - {task.level}</span>
            </div>
            <div>
              <span className="font-medium">字数要求：</span>
              <span className="text-gray-700">{task.word_count.min}-{task.word_count.max} 词</span>
            </div>
            <div>
              <span className="font-medium">批改时间：</span>
              <span className="text-gray-700">{new Date().toLocaleString('zh-CN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}