'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Target, Clock, Zap } from 'lucide-react'
import type { GameItem } from './QuickGames'

interface QuickQAProps {
  item: GameItem
  onAnswer: (answer: string, responseTime: number) => void
  isPaused: boolean
}

export function QuickQA({ item, onAnswer, isPaused }: QuickQAProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [startTime] = useState(Date.now())
  const [hasAnswered, setHasAnswered] = useState(false)

  // 倒计时
  useEffect(() => {
    if (isPaused || hasAnswered) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 时间到，自动提交
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused, hasAnswered])

  // 时间到了自动提交
  const handleTimeUp = () => {
    if (hasAnswered) return

    const responseTime = Date.now() - startTime
    onAnswer(selectedOption || '', responseTime)
    setHasAnswered(true)
  }

  // 处理选项点击
  const handleOptionClick = (option: string) => {
    if (isPaused || hasAnswered) return

    setSelectedOption(option)
    setHasAnswered(true)

    const responseTime = Date.now() - startTime
    onAnswer(option, responseTime)
  }

  // 获取选项样式
  const getOptionStyle = (option: string): string => {
    if (!hasAnswered) {
      if (selectedOption === option) {
        return 'ring-2 ring-primary-500 bg-primary-50'
      }
      return 'bg-white hover:bg-gray-50 hover:scale-105'
    }

    // 已答题后显示正确/错误
    if (option === item.answer) {
      return 'bg-green-100 border-green-500 text-green-800'
    }
    if (selectedOption === option && option !== item.answer) {
      return 'bg-red-100 border-red-500 text-red-800'
    }
    return 'bg-gray-100 text-gray-600'
  }

  // 获取时间条颜色
  const getTimeBarColor = (): string => {
    if (timeLeft > 6) return 'bg-green-500'
    if (timeLeft > 3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center">
          <Target className="h-6 w-6 text-purple-600" />
          快问快答
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 倒计时显示 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">{timeLeft}</span>
            <span className="text-gray-600">秒</span>
          </div>

          {/* 时间进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${getTimeBarColor()}`}
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>

          {timeLeft <= 3 && timeLeft > 0 && (
            <div className="text-red-600 font-medium animate-pulse">
              <Zap className="h-5 w-5 inline mr-1" />
              时间紧迫！
            </div>
          )}
        </div>

        {/* 问题显示 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-6 p-4 bg-gray-50 rounded-lg">
            {item.question}
          </div>
        </div>

        {/* 选项列表 */}
        <div className="space-y-3">
          {item.options?.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`w-full h-16 text-left justify-start text-lg font-medium transition-all ${getOptionStyle(option)}`}
              variant="outline"
              disabled={isPaused || hasAnswered}
            >
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </span>
            </Button>
          ))}
        </div>

        {/* 答题结果提示 */}
        {hasAnswered && (
          <div className="text-center">
            {selectedOption === item.answer ? (
              <div className="text-green-600 font-medium text-lg">
                ✅ 回答正确！
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-600 font-medium text-lg">
                  ❌ 回答错误
                </div>
                <div className="text-gray-600">
                  正确答案是: <span className="font-medium text-green-600">{item.answer}</span>
                </div>
              </div>
            )}
            {item.explanation && (
              <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                💡 {item.explanation}
              </div>
            )}
          </div>
        )}

        {/* 游戏说明 */}
        <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          💡 提示：在10秒内选择正确答案，时间越快得分越高！
        </div>
      </CardContent>
    </Card>
  )
}