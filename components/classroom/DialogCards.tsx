'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  MessageSquare,
  Users,
  Volume2,
  Printer,
  Download,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Lightbulb
} from 'lucide-react'
import type { CEFRLevel } from '@/types'
import toast from 'react-hot-toast'

export interface DialogTurn {
  speaker: string
  en: string
  zh: string
  note?: string
  target_phrases: string[]
}

export interface DialogData {
  title: string
  scenario: string
  level: CEFRLevel
  participants: string[]
  turns: DialogTurn[]
  vocabulary: { word: string; meaning: string; pronunciation?: string }[]
  cultural_notes: string[]
  objectives: string[]
}

export function DialogCards() {
  const [dialogForm, setDialogForm] = useState({
    scenario: '在餐厅点餐',
    level: 'A2' as CEFRLevel,
    turnCount: 8,
    participants: 'customer,waiter'
  })
  const [generatedDialog, setGeneratedDialog] = useState<DialogData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  const scenarios = [
    '在餐厅点餐',
    '购物买衣服',
    '看医生就诊',
    '酒店入住',
    '问路指路',
    '机场办理登机',
    '银行开户',
    '租房咨询',
    '求职面试',
    '课堂讨论'
  ]

  // 生成对话
  const generateDialog = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate/dialog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: dialogForm.scenario,
          level: dialogForm.level,
          turnCount: dialogForm.turnCount,
          participants: dialogForm.participants.split(',').map(p => p.trim())
        })
      })

      if (!response.ok) {
        throw new Error('生成对话失败')
      }

      const data = await response.json()
      setGeneratedDialog(data.dialog)
      setCurrentTurn(0)
      setIsPlaying(false)
      toast.success('对话生成成功！')
    } catch (error) {
      toast.error('生成对话失败，请重试')
      console.error('Generate dialog error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 播放对话
  const playDialog = () => {
    if (!generatedDialog) return

    setIsPlaying(true)
    playCurrentTurn()
  }

  const playCurrentTurn = () => {
    if (!generatedDialog || currentTurn >= generatedDialog.turns.length) {
      setIsPlaying(false)
      return
    }

    const turn = generatedDialog.turns[currentTurn]
    speakText(turn.en, () => {
      setTimeout(() => {
        setCurrentTurn(prev => prev + 1)
        if (currentTurn + 1 < generatedDialog.turns.length) {
          playCurrentTurn()
        } else {
          setIsPlaying(false)
          setCurrentTurn(0)
        }
      }, 1500)
    })
  }

  // TTS 朗读
  const speakText = (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      if (onEnd) {
        utterance.onend = onEnd
      }
      speechSynthesis.speak(utterance)
    } else if (onEnd) {
      onEnd()
    }
  }

  // 暂停播放
  const pauseDialog = () => {
    setIsPlaying(false)
    speechSynthesis.cancel()
  }

  // 下一句
  const nextTurn = () => {
    if (!generatedDialog) return
    setCurrentTurn(prev => Math.min(prev + 1, generatedDialog.turns.length - 1))
  }

  // 重置
  const resetDialog = () => {
    setCurrentTurn(0)
    setIsPlaying(false)
    speechSynthesis.cancel()
  }

  // 单句朗读
  const speakTurn = (turn: DialogTurn) => {
    speakText(turn.en)
  }

  // 打印讲义
  const printHandout = () => {
    if (!generatedDialog) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const content = generatePrintContent()
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.print()
  }

  // 生成打印内容
  const generatePrintContent = (): string => {
    if (!generatedDialog) return ''

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${generatedDialog.title} - 对话练习</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; }
          .dialog-turn { margin: 15px 0; padding: 10px; border-left: 3px solid #3b82f6; }
          .speaker { font-weight: bold; color: #1d4ed8; }
          .english { font-size: 16px; margin: 5px 0; }
          .chinese { font-size: 14px; color: #6b7280; font-style: italic; }
          .vocabulary { margin-top: 30px; }
          .vocab-item { margin: 5px 0; }
          .notes { margin-top: 30px; background: #f3f4f6; padding: 15px; border-radius: 8px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${generatedDialog.title}</h1>
          <p><strong>场景：</strong>${generatedDialog.scenario} | <strong>级别：</strong>${generatedDialog.level}</p>
          <p><strong>参与者：</strong>${generatedDialog.participants.join('、')}</p>
        </div>

        <h2>对话内容</h2>
        ${generatedDialog.turns.map(turn => `
          <div class="dialog-turn">
            <div class="speaker">${turn.speaker}:</div>
            <div class="english">${turn.en}</div>
            <div class="chinese">${turn.zh}</div>
            ${turn.note ? `<div style="font-size: 12px; color: #059669; margin-top: 5px;">💡 ${turn.note}</div>` : ''}
          </div>
        `).join('')}

        <div class="vocabulary">
          <h2>重点词汇</h2>
          ${generatedDialog.vocabulary.map(item => `
            <div class="vocab-item">
              <strong>${item.word}</strong> ${item.pronunciation || ''} - ${item.meaning}
            </div>
          `).join('')}
        </div>

        ${generatedDialog.cultural_notes.length > 0 ? `
          <div class="notes">
            <h2>文化注释</h2>
            ${generatedDialog.cultural_notes.map(note => `<p>• ${note}</p>`).join('')}
          </div>
        ` : ''}

        <div class="notes">
          <h2>学习目标</h2>
          ${generatedDialog.objectives.map(obj => `<p>• ${obj}</p>`).join('')}
        </div>
      </body>
      </html>
    `
  }

  return (
    <div className="space-y-6">
      {/* 对话设置表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            对话设置
          </CardTitle>
          <CardDescription>配置情景对话参数</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">对话场景</label>
              <select
                value={dialogForm.scenario}
                onChange={(e) => setDialogForm(prev => ({ ...prev, scenario: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {scenarios.map(scenario => (
                  <option key={scenario} value={scenario}>{scenario}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">CEFR 级别</label>
              <select
                value={dialogForm.level}
                onChange={(e) => setDialogForm(prev => ({ ...prev, level: e.target.value as CEFRLevel }))}
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
              <label className="text-sm font-medium text-gray-700">对话轮数</label>
              <Input
                type="number"
                value={dialogForm.turnCount}
                onChange={(e) => setDialogForm(prev => ({ ...prev, turnCount: parseInt(e.target.value) }))}
                min="4"
                max="20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">参与者（用逗号分隔）</label>
              <Input
                value={dialogForm.participants}
                onChange={(e) => setDialogForm(prev => ({ ...prev, participants: e.target.value }))}
                placeholder="例如：customer,waiter"
              />
            </div>
          </div>

          <Button
            onClick={generateDialog}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? '生成中...' : '生成对话卡'}
          </Button>
        </CardContent>
      </Card>

      {/* 对话内容 */}
      {generatedDialog && (
        <>
          {/* 对话控制 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{generatedDialog.title}</h3>
                  <p className="text-sm text-gray-600">
                    {generatedDialog.scenario} | {generatedDialog.level} 级别 | 第 {currentTurn + 1}/{generatedDialog.turns.length} 句
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowTranslation(!showTranslation)}
                    variant="outline"
                    size="sm"
                  >
                    {showTranslation ? '隐藏' : '显示'}中文
                  </Button>
                  <Button
                    onClick={() => setShowNotes(!showNotes)}
                    variant="outline"
                    size="sm"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showNotes ? '隐藏' : '显示'}注释
                  </Button>
                  {isPlaying ? (
                    <Button onClick={pauseDialog} size="sm">
                      <Pause className="h-4 w-4 mr-2" />
                      暂停
                    </Button>
                  ) : (
                    <Button onClick={playDialog} size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      播放
                    </Button>
                  )}
                  <Button onClick={nextTurn} variant="outline" size="sm">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button onClick={resetDialog} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button onClick={printHandout} variant="outline" size="sm">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 对话展示 */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {generatedDialog.turns.map((turn, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg transition-all ${
                      index === currentTurn
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-blue-600">{turn.speaker}:</span>
                          <Button
                            onClick={() => speakTurn(turn)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-lg mb-2">{turn.en}</div>
                        {showTranslation && (
                          <div className="text-gray-600 italic mb-2">{turn.zh}</div>
                        )}
                        {showNotes && turn.note && (
                          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                            💡 {turn.note}
                          </div>
                        )}
                        {turn.target_phrases.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {turn.target_phrases.map((phrase, phraseIndex) => (
                              <span
                                key={phraseIndex}
                                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                              >
                                {phrase}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 词汇和文化注释 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>重点词汇</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedDialog.vocabulary.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium flex items-center gap-2">
                        {item.word}
                        {item.pronunciation && (
                          <span className="text-sm text-gray-500">{item.pronunciation}</span>
                        )}
                        <Button
                          onClick={() => speakText(item.word)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600">{item.meaning}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>文化注释</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedDialog.cultural_notes.map((note, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">{note}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}