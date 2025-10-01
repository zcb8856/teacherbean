'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Play, Pause, Square, RotateCcw, Clock, Target } from 'lucide-react'

interface GameControlsProps {
  gameStatus: 'playing' | 'paused'
  timeLeft: number
  currentIndex: number
  totalItems: number
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onReset: () => void
}

export function GameControls({
  gameStatus,
  timeLeft,
  currentIndex,
  totalItems,
  onPause,
  onResume,
  onStop,
  onReset
}: GameControlsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* 左侧：进度信息 */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-lg">
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="font-medium">
                {currentIndex + 1} / {totalItems}
              </span>
            </div>
            {/* 进度条 */}
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* 右侧：控制按钮 */}
          <div className="flex items-center gap-2">
            {gameStatus === 'playing' ? (
              <Button onClick={onPause} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                暂停
              </Button>
            ) : (
              <Button onClick={onResume} size="sm">
                <Play className="h-4 w-4 mr-2" />
                继续
              </Button>
            )}
            <Button onClick={onStop} variant="outline" size="sm">
              <Square className="h-4 w-4 mr-2" />
              结束
            </Button>
            <Button onClick={onReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </div>

        {/* 游戏暂停提示 */}
        {gameStatus === 'paused' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <span className="text-yellow-800 font-medium">游戏已暂停</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}