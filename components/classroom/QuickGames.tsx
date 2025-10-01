'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Trophy,
  Clock,
  Target,
  Zap,
  Shuffle,
  CheckCircle
} from 'lucide-react'
import { GameControls } from './GameControls'
import { SpellingGame } from './SpellingGame'
import { SentenceMatching } from './SentenceMatching'
import { QuickQA } from './QuickQA'
import toast from 'react-hot-toast'

export interface GameItem {
  id: string
  type: 'spelling' | 'matching' | 'qa'
  question: string
  answer: string | string[]
  options?: string[]
  explanation?: string
  difficulty: number
}

export interface GameResult {
  itemId: string
  question: string
  userAnswer: string | string[]
  correctAnswer: string | string[]
  isCorrect: boolean
  responseTime: number
  timestamp: Date
}

export interface GameStats {
  totalQuestions: number
  correctAnswers: number
  averageTime: number
  accuracy: number
}

type GameType = 'spelling' | 'matching' | 'qa'
type GameStatus = 'setup' | 'playing' | 'paused' | 'finished'

export function QuickGames() {
  const [gameType, setGameType] = useState<GameType>('spelling')
  const [gameStatus, setGameStatus] = useState<GameStatus>('setup')
  const [currentItems, setCurrentItems] = useState<GameItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gameResults, setGameResults] = useState<GameResult[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    averageTime: 0,
    accuracy: 0
  })
  const [timeLeft, setTimeLeft] = useState(60)
  const [isGenerating, setIsGenerating] = useState(false)

  // 游戏设置
  const [gameSettings, setGameSettings] = useState({
    topic: '日常生活',
    grammarPoints: ['present_simple'],
    level: 'A2' as const,
    duration: 60
  })

  const timerRef = useRef<NodeJS.Timeout>()
  const gameStartTime = useRef<Date>()

  const gameTypes = [
    {
      id: 'spelling' as const,
      name: '拼写快打',
      description: '根据词义快速拼写单词',
      icon: Zap,
      color: 'text-blue-600'
    },
    {
      id: 'matching' as const,
      name: '句型匹配',
      description: '将句子拖到正确的语法分类',
      icon: Shuffle,
      color: 'text-green-600'
    },
    {
      id: 'qa' as const,
      name: '快问快答',
      description: '10秒内选择正确答案',
      icon: Target,
      color: 'text-purple-600'
    }
  ]

  // 一键出题
  const generateGameItems = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: gameType,
          topic: gameSettings.topic,
          grammarPoints: gameSettings.grammarPoints,
          level: gameSettings.level,
          count: 20
        })
      })

      if (!response.ok) {
        throw new Error('生成题目失败')
      }

      const data = await response.json()
      setCurrentItems(data.items)
      toast.success(`成功生成 ${data.items.length} 道题目！`)
    } catch (error) {
      toast.error('生成题目失败，请重试')
      console.error('Generate items error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 开始游戏
  const startGame = () => {
    if (currentItems.length === 0) {
      toast.error('请先生成题目')
      return
    }

    setGameStatus('playing')
    setCurrentIndex(0)
    setGameResults([])
    setTimeLeft(gameSettings.duration)
    gameStartTime.current = new Date()

    // 启动计时器
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 暂停游戏
  const pauseGame = () => {
    setGameStatus('paused')
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  // 继续游戏
  const resumeGame = () => {
    setGameStatus('playing')
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 结束游戏
  const finishGame = () => {
    setGameStatus('finished')
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // 计算统计数据
    const stats = calculateStats()
    setGameStats(stats)
  }

  // 重置游戏
  const resetGame = () => {
    setGameStatus('setup')
    setCurrentIndex(0)
    setGameResults([])
    setTimeLeft(gameSettings.duration)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  // 计算统计数据
  const calculateStats = (): GameStats => {
    const totalQuestions = gameResults.length
    const correctAnswers = gameResults.filter(r => r.isCorrect).length
    const totalTime = gameResults.reduce((sum, r) => sum + r.responseTime, 0)
    const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    return {
      totalQuestions,
      correctAnswers,
      averageTime: Math.round(averageTime),
      accuracy: Math.round(accuracy * 100) / 100
    }
  }

  // 处理答题结果
  const handleAnswer = (answer: string | string[], responseTime: number) => {
    const currentItem = currentItems[currentIndex]
    if (!currentItem) return

    const isCorrect = checkAnswer(currentItem, answer)
    const result: GameResult = {
      itemId: currentItem.id,
      question: currentItem.question,
      userAnswer: answer,
      correctAnswer: currentItem.answer,
      isCorrect,
      responseTime,
      timestamp: new Date()
    }

    setGameResults(prev => [...prev, result])

    // 移动到下一题或结束游戏
    if (currentIndex >= currentItems.length - 1 || timeLeft <= 0) {
      finishGame()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  // 检查答案是否正确
  const checkAnswer = (item: GameItem, userAnswer: string | string[]): boolean => {
    if (Array.isArray(item.answer)) {
      if (Array.isArray(userAnswer)) {
        return JSON.stringify(item.answer.sort()) === JSON.stringify(userAnswer.sort())
      }
      return false
    } else {
      if (typeof userAnswer === 'string') {
        return item.answer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
      }
      return false
    }
  }

  // 导出 CSV
  const exportResults = () => {
    if (gameResults.length === 0) {
      toast.error('没有可导出的数据')
      return
    }

    const csv = generateCSV()
    downloadCSV(csv, `game_results_${new Date().toISOString().split('T')[0]}.csv`)
    toast.success('结果已导出！')
  }

  const generateCSV = (): string => {
    const headers = ['题目', '学生答案', '正确答案', '是否正确', '用时(秒)', '时间戳']
    const rows = gameResults.map(result => [
      `"${result.question}"`,
      `"${Array.isArray(result.userAnswer) ? result.userAnswer.join(', ') : result.userAnswer}"`,
      `"${Array.isArray(result.correctAnswer) ? result.correctAnswer.join(', ') : result.correctAnswer}"`,
      result.isCorrect ? '正确' : '错误',
      (result.responseTime / 1000).toFixed(1),
      result.timestamp.toLocaleString()
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* 游戏设置 */}
      {gameStatus === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle>游戏设置</CardTitle>
            <CardDescription>选择游戏类型和参数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 游戏类型选择 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                选择游戏类型
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gameTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all ${
                      gameType === type.id
                        ? 'ring-2 ring-primary-500 bg-primary-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setGameType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <type.icon className={`h-8 w-8 ${type.color}`} />
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 游戏参数 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">主题</label>
                <Input
                  value={gameSettings.topic}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="例如：日常生活、学校生活"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">CEFR 级别</label>
                <select
                  value={gameSettings.level}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, level: e.target.value as any }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">语法点</label>
                <Input
                  value={gameSettings.grammarPoints.join(', ')}
                  onChange={(e) => setGameSettings(prev => ({
                    ...prev,
                    grammarPoints: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="例如：present_simple, past_tense"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">游戏时长（秒）</label>
                <Input
                  type="number"
                  value={gameSettings.duration}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="30"
                  max="300"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={generateGameItems}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? '生成中...' : '一键出题'}
              </Button>
              {currentItems.length > 0 && (
                <Button onClick={startGame} className="flex-1">
                  开始游戏 ({currentItems.length} 题)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 游戏控制台 */}
      {(gameStatus === 'playing' || gameStatus === 'paused') && (
        <GameControls
          gameStatus={gameStatus}
          timeLeft={timeLeft}
          currentIndex={currentIndex}
          totalItems={currentItems.length}
          onPause={pauseGame}
          onResume={resumeGame}
          onStop={finishGame}
          onReset={resetGame}
        />
      )}

      {/* 游戏内容 */}
      {(gameStatus === 'playing' || gameStatus === 'paused') && currentItems[currentIndex] && (
        <div className="min-h-[400px]">
          {gameType === 'spelling' && (
            <SpellingGame
              item={currentItems[currentIndex]}
              onAnswer={handleAnswer}
              isPaused={gameStatus === 'paused'}
            />
          )}
          {gameType === 'matching' && (
            <SentenceMatching
              item={currentItems[currentIndex]}
              onAnswer={handleAnswer}
              isPaused={gameStatus === 'paused'}
            />
          )}
          {gameType === 'qa' && (
            <QuickQA
              item={currentItems[currentIndex]}
              onAnswer={handleAnswer}
              isPaused={gameStatus === 'paused'}
            />
          )}
        </div>
      )}

      {/* 游戏结果 */}
      {gameStatus === 'finished' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  游戏结束
                </CardTitle>
                <CardDescription>
                  {gameTypes.find(t => t.id === gameType)?.name} - 结果统计
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  导出 CSV
                </Button>
                <Button onClick={resetGame}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重新开始
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{gameStats.totalQuestions}</div>
                <div className="text-sm text-gray-600">总题数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{gameStats.correctAnswers}</div>
                <div className="text-sm text-gray-600">答对数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{gameStats.accuracy}%</div>
                <div className="text-sm text-gray-600">正确率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{gameStats.averageTime}ms</div>
                <div className="text-sm text-gray-600">平均用时</div>
              </div>
            </div>

            {/* 详细结果 */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {gameResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{result.question}</div>
                    <div className="text-sm text-gray-600">
                      答案: {Array.isArray(result.userAnswer) ? result.userAnswer.join(', ') : result.userAnswer}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">
                      {(result.responseTime / 1000).toFixed(1)}s
                    </div>
                    {result.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}