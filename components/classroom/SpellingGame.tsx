'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Zap, Volume2, Eye, EyeOff } from 'lucide-react'
import type { GameItem } from './QuickGames'

interface SpellingGameProps {
  item: GameItem
  onAnswer: (answer: string, responseTime: number) => void
  isPaused: boolean
}

export function SpellingGame({ item, onAnswer, isPaused }: SpellingGameProps) {
  const [userInput, setUserInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [startTime] = useState(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  // 模拟 TTS 朗读
  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(item.answer as string)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  // 处理提交答案
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || isPaused) return

    const responseTime = Date.now() - startTime
    onAnswer(userInput.trim(), responseTime)
    setUserInput('')
    setShowHint(false)
  }

  // 获取提示（显示部分字母）
  const getHint = (): string => {
    const word = item.answer as string
    const hintLength = Math.ceil(word.length * 0.4) // 显示 40% 的字母
    return word.substring(0, hintLength) + '_'.repeat(word.length - hintLength)
  }

  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current && !isPaused) {
      inputRef.current.focus()
    }
  }, [item, isPaused])

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center">
          <Zap className="h-6 w-6 text-blue-600" />
          拼写快打
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 题目显示 */}
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">请拼写下面单词：</div>
          <div className="text-2xl font-bold text-gray-900 mb-4 p-4 bg-gray-50 rounded-lg">
            {item.question}
          </div>

          {/* 发音按钮 */}
          <Button
            onClick={speakWord}
            variant="outline"
            size="sm"
            className="mb-4"
            disabled={isPaused}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            听发音
          </Button>
        </div>

        {/* 提示功能 */}
        <div className="text-center">
          <Button
            onClick={() => setShowHint(!showHint)}
            variant="ghost"
            size="sm"
            disabled={isPaused}
          >
            {showHint ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showHint ? '隐藏提示' : '显示提示'}
          </Button>

          {showHint && (
            <div className="mt-2 text-lg font-mono text-blue-600 bg-blue-50 p-2 rounded">
              {getHint()}
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="在这里输入拼写..."
              className="text-center text-xl font-medium h-12"
              disabled={isPaused}
              autoFocus
            />
            <div className="text-sm text-gray-500 mt-2 text-center">
              已输入 {userInput.length} 个字母
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUserInput('')}
              className="flex-1"
              disabled={isPaused}
            >
              清空
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!userInput.trim() || isPaused}
            >
              提交答案
            </Button>
          </div>
        </form>

        {/* 游戏说明 */}
        <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          💡 提示：根据中文意思拼写英文单词，可以点击"听发音"或"显示提示"来帮助记忆
        </div>
      </CardContent>
    </Card>
  )
}