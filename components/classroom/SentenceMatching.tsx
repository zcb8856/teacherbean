'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shuffle, Check, RotateCcw } from 'lucide-react'
import type { GameItem } from './QuickGames'

interface SentenceMatchingProps {
  item: GameItem
  onAnswer: (answer: string[], responseTime: number) => void
  isPaused: boolean
}

interface MatchingData {
  sentences: string[]
  categories: string[]
  correctMatches: number[] // sentences[i] 属于 categories[correctMatches[i]]
}

export function SentenceMatching({ item, onAnswer, isPaused }: SentenceMatchingProps) {
  const [selectedSentence, setSelectedSentence] = useState<number | null>(null)
  const [userMatches, setUserMatches] = useState<{ [sentenceIndex: number]: number }>({})
  const [startTime] = useState(Date.now())

  // 解析题目数据
  const matchingData: MatchingData = typeof item.question === 'string'
    ? JSON.parse(item.question)
    : item.question as any

  // 获取句子的分类颜色
  const getCategoryColor = (categoryIndex: number): string => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-orange-100 border-orange-300 text-orange-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800'
    ]
    return colors[categoryIndex % colors.length]
  }

  // 获取句子的状态样式
  const getSentenceStyle = (sentenceIndex: number): string => {
    if (selectedSentence === sentenceIndex) {
      return 'ring-2 ring-primary-500 bg-primary-50'
    }
    if (userMatches[sentenceIndex] !== undefined) {
      const categoryIndex = userMatches[sentenceIndex]
      return getCategoryColor(categoryIndex)
    }
    return 'bg-white hover:bg-gray-50'
  }

  // 处理句子选择
  const handleSentenceClick = (sentenceIndex: number) => {
    if (isPaused) return

    if (userMatches[sentenceIndex] !== undefined) {
      // 如果句子已匹配，取消匹配
      setUserMatches(prev => {
        const newMatches = { ...prev }
        delete newMatches[sentenceIndex]
        return newMatches
      })
    } else {
      // 选择句子
      setSelectedSentence(sentenceIndex)
    }
  }

  // 处理分类选择
  const handleCategoryClick = (categoryIndex: number) => {
    if (isPaused || selectedSentence === null) return

    setUserMatches(prev => ({
      ...prev,
      [selectedSentence]: categoryIndex
    }))
    setSelectedSentence(null)
  }

  // 重置匹配
  const resetMatches = () => {
    if (isPaused) return
    setUserMatches({})
    setSelectedSentence(null)
  }

  // 提交答案
  const submitAnswer = () => {
    if (isPaused) return

    const responseTime = Date.now() - startTime
    const userAnswer = matchingData.sentences.map((_, index) => userMatches[index] ?? -1)
    onAnswer(userAnswer.map(String), responseTime)
  }

  // 检查是否所有句子都已匹配
  const allMatched = matchingData.sentences.every((_, index) => userMatches[index] !== undefined)

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center">
          <Shuffle className="h-6 w-6 text-green-600" />
          句型匹配
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 游戏说明 */}
        <div className="text-center text-gray-600 bg-blue-50 p-3 rounded-lg">
          将下面的句子拖放到正确的语法分类中
        </div>

        {/* 分类区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchingData.categories.map((category, categoryIndex) => (
            <Card
              key={categoryIndex}
              className={`cursor-pointer transition-all min-h-[120px] ${getCategoryColor(categoryIndex)} ${
                selectedSentence !== null ? 'hover:scale-105' : ''
              }`}
              onClick={() => handleCategoryClick(categoryIndex)}
            >
              <CardContent className="p-4">
                <div className="font-medium text-center mb-3">{category}</div>

                {/* 显示已匹配的句子 */}
                <div className="space-y-2">
                  {Object.entries(userMatches)
                    .filter(([_, catIndex]) => catIndex === categoryIndex)
                    .map(([sentenceIndex, _]) => (
                      <div
                        key={sentenceIndex}
                        className="text-sm p-2 bg-white/70 rounded border-2 border-dashed"
                      >
                        {matchingData.sentences[parseInt(sentenceIndex)]}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 句子列表 */}
        <div>
          <h3 className="font-medium mb-3">请选择句子并拖放到对应分类：</h3>
          <div className="grid grid-cols-1 gap-3">
            {matchingData.sentences.map((sentence, sentenceIndex) => (
              <div
                key={sentenceIndex}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${getSentenceStyle(sentenceIndex)}`}
                onClick={() => handleSentenceClick(sentenceIndex)}
              >
                <div className="flex items-center justify-between">
                  <span>{sentence}</span>
                  {userMatches[sentenceIndex] !== undefined && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            onClick={resetMatches}
            variant="outline"
            className="flex-1"
            disabled={isPaused || Object.keys(userMatches).length === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            重置匹配
          </Button>
          <Button
            onClick={submitAnswer}
            className="flex-1"
            disabled={isPaused || !allMatched}
          >
            提交答案 ({Object.keys(userMatches).length}/{matchingData.sentences.length})
          </Button>
        </div>

        {/* 进度提示 */}
        <div className="text-center">
          <div className="text-sm text-gray-500">
            {selectedSentence !== null && (
              <span className="text-blue-600 font-medium">
                已选择句子，请点击对应的语法分类
              </span>
            )}
            {selectedSentence === null && Object.keys(userMatches).length > 0 && (
              <span className="text-green-600 font-medium">
                继续选择剩余句子进行匹配
              </span>
            )}
            {Object.keys(userMatches).length === 0 && (
              <span className="text-gray-600">
                点击句子开始匹配
              </span>
            )}
          </div>
        </div>

        {/* 游戏说明 */}
        <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          💡 提示：点击句子选中后，再点击对应的语法分类完成匹配。点击已匹配的句子可以取消匹配。
        </div>
      </CardContent>
    </Card>
  )
}