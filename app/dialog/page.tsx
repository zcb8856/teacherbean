'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { MessageSquare, Users, Play, Save, Home } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function DialogPage() {
  const { t } = useTranslation()
  const [selectedScenario, setSelectedScenario] = useState('restaurant')

  const scenarios = [
    { id: 'restaurant', title: 'At a Restaurant', level: 'A2', description: 'Ordering food and making conversations' },
    { id: 'shopping', title: 'Shopping Mall', level: 'A2', description: 'Asking about prices and making purchases' },
    { id: 'doctor', title: 'Doctor Visit', level: 'B1', description: 'Describing symptoms and understanding advice' },
    { id: 'hotel', title: 'Hotel Check-in', level: 'A2', description: 'Booking rooms and asking for information' }
  ]

  const sampleDialog = {
    title: 'At a Restaurant',
    participants: ['Customer', 'Waiter'],
    exchanges: [
      { speaker: 'Waiter', text: 'Good evening! Welcome to our restaurant. How many people?', emotion: 'friendly' },
      { speaker: 'Customer', text: 'Good evening. Table for two, please.', emotion: 'polite' },
      { speaker: 'Waiter', text: 'Right this way. Here are your menus. Would you like something to drink?', emotion: 'helpful' },
      { speaker: 'Customer', text: 'Yes, could we have two glasses of water, please?', emotion: 'requesting' }
    ],
    vocabulary: ['menu', 'order', 'bill', 'tip', 'reservation']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">{t('Interactive Dialogs')}</h1>
          <p className="text-text-primary-light">{t('Scenario-based conversation practice with role-play cards and pronunciation feedback')}</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-soft-cyan-50 border-soft-cyan-200">
            <Home className="h-4 w-4" />
            {t('Back to Home')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <MessageSquare className="h-5 w-5" />
              Scenarios
            </CardTitle>
            <CardDescription className="text-text-primary-light">Choose a conversation scenario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedScenario === scenario.id ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{scenario.title}</div>
                  <div className="text-sm text-text-primary-light">{scenario.description}</div>
                  <div className="text-xs text-primary-600 mt-1">{scenario.level}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Users className="h-5 w-5" />
              {sampleDialog.title}
            </CardTitle>
            <CardDescription className="text-text-primary-light">Role-play conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start Practice
                </Button>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Dialog
                </Button>
              </div>

              <div className="space-y-3">
                {sampleDialog.exchanges.map((exchange, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${
                    exchange.speaker === 'Customer' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                  }`}>
                    <div className="font-medium text-sm text-text-primary-light">{exchange.speaker}</div>
                    <div className="mt-1">{exchange.text}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium mb-2">Key Vocabulary</h4>
                <div className="flex flex-wrap gap-2">
                  {sampleDialog.vocabulary.map((word) => (
                    <span key={word} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}