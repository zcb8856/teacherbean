'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  AlertTriangle,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react'
import type { AnalyticsData, ErrorAnalysis } from '@/types/assess'
import toast from 'react-hot-toast'

// 简单的图表组件（实际项目中建议使用 recharts 或其他图表库）
function SimpleBarChart({ data, title }: { data: Array<{ name: string; value: number }>, title: string }) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">{title}</h4>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span>{item.name}</span>
            <span className="font-medium">{item.value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'class' | 'student'>('class')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      total_submissions: 0,
      average_score: 0,
      completion_rate: 0,
      on_time_rate: 0
    },
    score_distribution: [],
    difficulty_analysis: [],
    topic_performance: [],
    time_analysis: {
      average_completion_time: 0,
      time_distribution: []
    },
    student_performance: [],
    class_performance: []
  })
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis>({
    by_grammar_point: [],
    by_topic: [],
    by_item_type: [],
    by_difficulty: []
  })

  // 加载分析数据
  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        view_mode: viewMode,
        class_id: selectedClass !== 'all' ? selectedClass : '',
        period: selectedPeriod
      })

      const response = await fetch(`/api/assess/analytics?${params}`)
      if (!response.ok) throw new Error('Failed to load analytics')

      const data = await response.json()
      setAnalyticsData(data.analytics)
      setErrorAnalysis(data.error_analysis)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('加载数据失败')

      // 使用模拟数据
      setAnalyticsData({
        overview: {
          total_submissions: 156,
          average_score: 76.5,
          completion_rate: 89.2,
          on_time_rate: 84.6
        },
        score_distribution: [
          { range: '90-100', count: 23, percentage: 14.7 },
          { range: '80-89', count: 45, percentage: 28.8 },
          { range: '70-79', count: 52, percentage: 33.3 },
          { range: '60-69', count: 28, percentage: 17.9 },
          { range: '0-59', count: 8, percentage: 5.1 }
        ],
        difficulty_analysis: [
          { difficulty: '容易', average_score: 85.2, item_count: 45 },
          { difficulty: '中等', average_score: 72.8, item_count: 68 },
          { difficulty: '困难', average_score: 58.3, item_count: 43 }
        ],
        topic_performance: [
          { topic: 'Present Simple', average_score: 82.1, submissions: 156, common_errors: ['第三人称单数', '疑问句结构'] },
          { topic: 'Past Tense', average_score: 74.5, submissions: 134, common_errors: ['不规则动词', '过去式拼写'] },
          { topic: 'Vocabulary', average_score: 68.9, submissions: 145, common_errors: ['词义理解', '搭配使用'] }
        ],
        time_analysis: {
          average_completion_time: 18.5,
          time_distribution: [
            { range: '0-10分钟', count: 12 },
            { range: '10-20分钟', count: 89 },
            { range: '20-30分钟', count: 45 },
            { range: '30分钟以上', count: 10 }
          ]
        },
        student_performance: [
          { student_id: '1', student_name: '张三', score: 92, completion_time: 15, strengths: ['语法', '词汇'], weaknesses: ['阅读理解'] },
          { student_id: '2', student_name: '李四', score: 78, completion_time: 22, strengths: ['基础语法'], weaknesses: ['时态', '语序'] }
        ],
        class_performance: [
          { class_id: '1', class_name: '初二(1)班', average_score: 82.3, submission_count: 28, completion_rate: 96.4 },
          { class_id: '2', class_name: '初二(2)班', average_score: 75.8, submission_count: 26, completion_rate: 86.7 }
        ]
      })

      setErrorAnalysis({
        by_grammar_point: [
          { grammar_point: '现在完成时', error_count: 45, total_attempts: 156, error_rate: 28.8, common_mistakes: ['have/has混用', '过去分词错误'] },
          { grammar_point: '被动语态', error_count: 38, total_attempts: 134, error_rate: 28.4, common_mistakes: ['be动词时态', '过去分词形式'] },
          { grammar_point: '条件句', error_count: 32, total_attempts: 98, error_rate: 32.7, common_mistakes: ['if从句时态', '主句结构'] }
        ],
        by_topic: [
          { topic: '时态语法', error_count: 89, total_attempts: 312, error_rate: 28.5 },
          { topic: '词汇运用', error_count: 67, total_attempts: 245, error_rate: 27.3 },
          { topic: '句型结构', error_count: 54, total_attempts: 189, error_rate: 28.6 }
        ],
        by_item_type: [
          { item_type: '选择题', error_count: 123, total_attempts: 623, error_rate: 19.7 },
          { item_type: '填空题', error_count: 78, total_attempts: 234, error_rate: 33.3 },
          { item_type: '改错题', error_count: 45, total_attempts: 89, error_rate: 50.6 }
        ],
        by_difficulty: [
          { difficulty_level: '容易', error_count: 34, total_attempts: 445, error_rate: 7.6 },
          { difficulty_level: '中等', error_count: 145, total_attempts: 456, error_rate: 31.8 },
          { difficulty_level: '困难', error_count: 67, total_attempts: 145, error_rate: 46.2 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [viewMode, selectedClass, selectedPeriod])

  // 导出数据
  const handleExport = (format: 'csv' | 'pdf') => {
    const data = viewMode === 'class' ? analyticsData.class_performance : analyticsData.student_performance

    if (format === 'csv') {
      const csvContent = convertToCSV(data || [])
      downloadFile(csvContent, `analytics_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
    } else {
      // For PDF, we would use a library like jsPDF
      toast('PDF导出功能正在开发中')
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(','))
    return [headers, ...rows].join('\n')
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和控制 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">学情看板</h2>
          <p className="text-gray-600">全面分析学生学习表现和错题分布</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            导出CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            导出PDF
          </Button>
        </div>
      </div>

      {/* 筛选控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            数据筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">视图模式</label>
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'class' | 'student')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">班级维度</SelectItem>
                  <SelectItem value="student">学生维度</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">班级筛选</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部班级</SelectItem>
                  <SelectItem value="class1">初二(1)班</SelectItem>
                  <SelectItem value="class2">初二(2)班</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">时间范围</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">近一周</SelectItem>
                  <SelectItem value="month">近一月</SelectItem>
                  <SelectItem value="quarter">近三月</SelectItem>
                  <SelectItem value="year">近一年</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 总体概况 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总提交数</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.total_submissions}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均分数</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.average_score.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">完成率</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.completion_rate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">按时率</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.on_time_rate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 分数分布 */}
        <Card>
          <CardHeader>
            <CardTitle>分数分布</CardTitle>
            <CardDescription>学生成绩区间分布情况</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={analyticsData.score_distribution.map(item => ({
                name: item.range,
                value: item.percentage
              }))}
              title="成绩分布"
            />
          </CardContent>
        </Card>

        {/* 难度分析 */}
        <Card>
          <CardHeader>
            <CardTitle>难度分析</CardTitle>
            <CardDescription>不同难度题目的表现情况</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={analyticsData.difficulty_analysis.map(item => ({
                name: item.difficulty,
                value: item.average_score
              }))}
              title="难度表现"
            />
          </CardContent>
        </Card>
      </div>

      {/* Top 错因分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Top 错因分析
          </CardTitle>
          <CardDescription>按语法点、话题分析常见错误</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 语法点错误 */}
            <div>
              <h4 className="font-medium mb-4">语法点错误率 Top 3</h4>
              <div className="space-y-3">
                {errorAnalysis.by_grammar_point.slice(0, 3).map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{item.grammar_point}</span>
                      <Badge variant="destructive">{item.error_rate.toFixed(1)}%</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      错误次数: {item.error_count} / {item.total_attempts}
                    </div>
                    <div className="text-xs text-gray-500">
                      常见错误: {item.common_mistakes.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 题型错误 */}
            <div>
              <h4 className="font-medium mb-4">题型错误率分析</h4>
              <div className="space-y-3">
                {errorAnalysis.by_item_type.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.item_type}</div>
                      <div className="text-sm text-gray-600">
                        {item.error_count} / {item.total_attempts} 错误
                      </div>
                    </div>
                    <Badge
                      variant={item.error_rate > 30 ? "destructive" : item.error_rate > 20 ? "secondary" : "outline"}
                    >
                      {item.error_rate.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 班级/学生表现 */}
      <Card>
        <CardHeader>
          <CardTitle>{viewMode === 'class' ? '班级表现' : '学生表现'}</CardTitle>
          <CardDescription>
            {viewMode === 'class' ? '各班级的整体表现情况' : '个人学习表现详情'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  {viewMode === 'class' ? (
                    <>
                      <th className="text-left py-2">班级名称</th>
                      <th className="text-left py-2">平均分</th>
                      <th className="text-left py-2">提交数量</th>
                      <th className="text-left py-2">完成率</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left py-2">学生姓名</th>
                      <th className="text-left py-2">分数</th>
                      <th className="text-left py-2">用时</th>
                      <th className="text-left py-2">优势</th>
                      <th className="text-left py-2">待改进</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {((viewMode === 'class' ? analyticsData.class_performance : analyticsData.student_performance) || [])
                  .slice(0, 10)
                  .map((item, index) => (
                    <tr key={index} className="border-b">
                      {viewMode === 'class' ? (
                        <>
                          <td className="py-2">{(item as any).class_name}</td>
                          <td className="py-2">{(item as any).average_score.toFixed(1)}</td>
                          <td className="py-2">{(item as any).submission_count}</td>
                          <td className="py-2">{(item as any).completion_rate.toFixed(1)}%</td>
                        </>
                      ) : (
                        <>
                          <td className="py-2">{(item as any).student_name}</td>
                          <td className="py-2">{(item as any).score}</td>
                          <td className="py-2">{(item as any).completion_time}分钟</td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              {(item as any).strengths.map((strength: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              {(item as any).weaknesses.map((weakness: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {weakness}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}