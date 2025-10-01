'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Gamepad2, Clock, Target, Trophy, Home } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function GamePage() {
  const { t } = useTranslation()
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)

  const games = [
    {
      id: 'vocabulary_spelling',
      title: 'Vocabulary Spelling',
      description: 'Type the correct spelling of spoken words',
      difficulty: 'A2',
      timeLimit: 60
    },
    {
      id: 'sentence_matching',
      title: 'Sentence Matching',
      description: 'Match sentence halves to complete meanings',
      difficulty: 'B1',
      timeLimit: 90
    },
    {
      id: 'quick_qa',
      title: 'Quick Q&A',
      description: 'Answer questions as fast as you can',
      difficulty: 'A1',
      timeLimit: 45
    }
  ]

  const sampleQuestions = {
    vocabulary_spelling: [
      { prompt: '🏠 A place where you live', answer: 'house' },
      { prompt: '📚 You read this', answer: 'book' },
      { prompt: '🚗 Transportation with four wheels', answer: 'car' }
    ],
    sentence_matching: [
      { left: 'I usually wake up', right: 'at seven o\'clock' },
      { left: 'She is going to', right: 'the supermarket' },
      { left: 'We have been studying', right: 'English for two years' }
    ],
    quick_qa: [
      { question: 'What color is the sun?', answer: 'yellow' },
      { question: 'How many days are in a week?', answer: 'seven' },
      { question: 'What do you use to write?', answer: 'pen' }
    ]
  }

  const startGame = (gameId: string) => {
    setActiveGame(gameId)
    setScore(0)
    const game = games.find(g => g.id === gameId)
    setTimeLeft(game?.timeLimit || 60)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">{t('Quick Games')}</h1>
          <p className="text-text-primary-light">{t('Engaging vocabulary games, sentence matching, and rapid-fire Q&A with real-time scoring')}</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-soft-cyan-50 border-soft-cyan-200">
            <Home className="h-4 w-4" />
            {t('Back to Home')}
          </Button>
        </Link>
      </div>

      {!activeGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-text-primary">
                  <Gamepad2 className="h-5 w-5 text-primary-600" />
                  {game.title}
                </CardTitle>
                <CardDescription className="text-text-primary-light">{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Level: {game.difficulty}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {game.timeLimit}s
                    </span>
                  </div>
                  <Button onClick={() => startGame(game.id)} className="w-full">
                    Start Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-text-primary">
                  <Target className="h-5 w-5" />
                  {games.find(g => g.id === activeGame)?.title}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Score: {score}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-red-500" />
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activeGame === 'vocabulary_spelling' && (
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🏠</div>
                    <p className="text-lg">A place where you live</p>
                    <input
                      type="text"
                      placeholder="Type your answer..."
                      className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg"
                    />
                    <Button className="w-full">Submit Answer</Button>
                  </div>
                )}

                {activeGame === 'sentence_matching' && (
                  <div className="space-y-4">
                    <p className="font-medium">Match the sentence parts:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Beginning</h4>
                        {['I usually wake up', 'She is going to', 'We have been studying'].map((item, idx) => (
                          <div key={idx} className="p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Ending</h4>
                        {['at seven o\'clock', 'the supermarket', 'English for two years'].map((item, idx) => (
                          <div key={idx} className="p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeGame === 'quick_qa' && (
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">What color is the sun?</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['yellow', 'blue', 'red', 'green'].map((option) => (
                        <Button key={option} variant="outline" className="h-12">
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setActiveGame(null)}>
                    Exit Game
                  </Button>
                  <Button>Next Question</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}