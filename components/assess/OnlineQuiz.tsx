'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Flag,
  ArrowLeft,
  ArrowRight,
  Send
} from 'lucide-react'
import type { QuizSession, QuizAnswer, Item, AssembledPaper } from '@/types/assess'
import toast from 'react-hot-toast'

export function OnlineQuiz() {
  const [quizMode, setQuizMode] = useState<'select' | 'active' | 'finished'>('select')
  const [availablePapers, setAvailablePapers] = useState<AssembledPaper[]>([])
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null)
  const [currentPaper, setCurrentPaper] = useState<AssembledPaper | null>(null)
  const [studentName, setStudentName] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())

  // 模拟试卷数据（实际应从API获取）
  useEffect(() => {
    const samplePapers: AssembledPaper[] = [
      {
        id: 'paper_1',
        config: {
          title: '英语语法测试',
          level: 'A2',
          total_items: 10,
          time_limit: 30,
          instructions: '请在规定时间内完成所有题目',
          item_distribution: { mcq: 8, cloze: 2, error_correction: 0, matching: 0, reading_q: 0, writing_task: 0 },
          difficulty_distribution: { easy: 0.3, medium: 0.5, hard: 0.2 }
        },
        items: [],
        paper_json: {
          title: '英语语法测试',
          instructions: '请在规定时间内完成所有题目',
          time_limit: 30,
          sections: [
            {
              id: 'section_mcq',
              title: '选择题',
              items: [
                {
                  id: 'q1',
                  question_number: 1,
                  type: 'mcq',
                  stem: 'I _____ to school yesterday.',
                  options: ['go', 'went', 'gone', 'going'],
                  points: 2
                },
                {
                  id: 'q2',
                  question_number: 2,
                  type: 'mcq',
                  stem: 'She _____ English very well.',
                  options: ['speak', 'speaks', 'spoke', 'speaking'],
                  points: 2
                }
              ]
            }
          ]
        },
        printable_html: '',
        answer_key: [],
        created_at: '2024-01-20T10:00:00Z'
      }
    ]
    setAvailablePapers(samplePapers)
  }, [])

  // 倒计时逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (quizMode === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [quizMode, timeRemaining])

  // 开始测验
  const handleStartQuiz = (paper: AssembledPaper) => {
    if (!studentName.trim()) {
      toast.error('请输入学生姓名')
      return
    }

    const session: QuizSession = {
      id: `session_${Date.now()}`,
      paper_id: paper.id,
      student_name: studentName,
      started_at: new Date().toISOString(),
      time_remaining: paper.config.time_limit * 60, // Convert to seconds
      current_item: 0,
      answers: {},
      is_completed: false
    }

    setCurrentSession(session)
    setCurrentPaper(paper)
    setTimeRemaining(paper.config.time_limit * 60)
    setCurrentQuestion(0)
    setAnswers({})
    setFlaggedQuestions(new Set())
    setQuizMode('active')

    toast.success('测验已开始，祝你好运！')
  }

  // 回答问题
  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  // 标记问题
  const handleFlagQuestion = (questionIndex: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex)
      } else {
        newSet.add(questionIndex)
      }
      return newSet
    })
  }

  // 提交测验
  const handleSubmitQuiz = async () => {
    if (!currentSession || !currentPaper) return

    try {
      const submission = {
        paper_id: currentPaper.id,
        student_name: studentName,
        answers: answers,
        submitted_at: new Date().toISOString(),
        time_spent: currentPaper.config.time_limit * 60 - timeRemaining
      }

      const response = await fetch('/api/assess/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      })

      if (!response.ok) {
        throw new Error('提交失败')
      }

      setQuizMode('finished')
      toast.success('测验提交成功！')
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('提交失败，请重试')
    }
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 获取所有问题
  const getAllQuestions = () => {
    if (!currentPaper) return []
    return currentPaper.paper_json.sections.flatMap(section => section.items)
  }

  // 渲染试卷选择界面
  if (quizMode === 'select') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">在线测验</h2>
          <p className="text-gray-600">选择试卷开始在线答题</p>
        </div>

        {/* 学生信息输入 */}
        <Card>
          <CardHeader>
            <CardTitle>学生信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <label className="text-sm font-medium mb-2 block">学生姓名 *</label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="请输入您的姓名"
              />
            </div>
          </CardContent>
        </Card>

        {/* 可用试卷列表 */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">可用试卷</h3>
          {availablePapers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">暂无可用试卷</p>
              </CardContent>
            </Card>
          ) : (
            availablePapers.map((paper) => (
              <Card key={paper.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">{paper.config.title}</h4>
                      <div className="flex gap-4 text-sm text-gray-600 mb-3">
                        <span>级别: {paper.config.level}</span>
                        <span>题数: {paper.config.total_items}</span>
                        <span>时长: {paper.config.time_limit}分钟</span>
                      </div>
                      {paper.config.instructions && (
                        <p className="text-sm text-gray-700">{paper.config.instructions}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleStartQuiz(paper)}
                      disabled={!studentName.trim()}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      开始测验
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    )
  }

  // 渲染测验进行界面
  if (quizMode === 'active' && currentPaper) {
    const allQuestions = getAllQuestions()
    const currentQ = allQuestions[currentQuestion]
    const progress = ((currentQuestion + 1) / allQuestions.length) * 100

    return (
      <div className="space-y-6">
        {/* 测验头部 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{currentPaper.config.title}</h2>
            <p className="text-gray-600">{studentName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Button
              onClick={handleSubmitQuiz}
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              提交试卷
            </Button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>进度</span>
            <span>{currentQuestion + 1} / {allQuestions.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 主答题区域 */}
          <div className="lg:col-span-3">
            {currentQ && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      第 {currentQ.question_number} 题
                      <Badge variant="outline">{currentQ.points} 分</Badge>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagQuestion(currentQuestion)}
                    >
                      <Flag className={`h-4 w-4 ${flaggedQuestions.has(currentQuestion) ? 'text-red-500' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-lg">{currentQ.stem}</div>

                  {/* 选择题选项 */}
                  {currentQ.options && (
                    <div className="space-y-2">
                      {currentQ.options.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name={`question_${currentQ.id}`}
                            value={index}
                            checked={answers[currentQ.id] === index}
                            onChange={() => handleAnswer(currentQ.id, index)}
                            className="h-4 w-4"
                          />
                          <span>{String.fromCharCode(65 + index)}. {option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* 填空题输入 */}
                  {currentQ.answer_space && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">答案：</label>
                      <Input
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                        placeholder="请输入您的答案"
                      />
                    </div>
                  )}

                  {/* 导航按钮 */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      上一题
                    </Button>

                    <Button
                      onClick={() => {
                        if (currentQuestion === allQuestions.length - 1) {
                          handleSubmitQuiz()
                        } else {
                          setCurrentQuestion(Math.min(allQuestions.length - 1, currentQuestion + 1))
                        }
                      }}
                    >
                      {currentQuestion === allQuestions.length - 1 ? (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          提交试卷
                        </>
                      ) : (
                        <>
                          下一题
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 侧边导航 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">答题导航</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {allQuestions.map((_, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={`
                        ${index === currentQuestion ? 'bg-blue-500 text-white' : ''}
                        ${answers[allQuestions[index].id] !== undefined ? 'bg-green-100 text-green-800' : ''}
                        ${flaggedQuestions.has(index) ? 'border-red-500' : ''}
                      `}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>当前题目</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                    <span>已答题目</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
                    <span>标记题目</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // 渲染测验完成界面
  if (quizMode === 'finished') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">测验提交成功！</h2>
            <p className="text-gray-600 mb-6">
              感谢 {studentName} 参与测验，您的答案已保存并将进行评分。
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  setQuizMode('select')
                  setStudentName('')
                  setCurrentSession(null)
                  setCurrentPaper(null)
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                重新开始
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}