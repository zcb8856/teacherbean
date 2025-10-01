'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatAssistant() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('Hello! I\'m your AI teaching assistant. I can help you with lesson planning, teaching strategies, and answer questions about English language teaching. How can I assist you today?'),
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      // 演示模式：使用模拟响应
      const demoResponses = [
        t('I can help you create engaging lesson plans! What topic or skill would you like to focus on?'),
        t('That\'s a great question about teaching methodology. Here are some evidence-based strategies you can try...'),
        t('For that grammar point, I recommend starting with context and examples before explaining the rules. Would you like me to create a sample lesson structure?'),
        t('Assessment is crucial for learning. Consider using formative assessment techniques like exit tickets, quick polls, or peer feedback activities.'),
        t('Classroom management becomes easier with clear routines and positive reinforcement. What specific challenge are you facing?')
      ]

      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      }

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage])
      }, 1000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={() => {
            console.log('Chat button clicked!')
            setIsOpen(true)
          }}
          className="w-12 h-12 rounded-full bg-white border-2 border-soft-cyan-600 hover:border-soft-cyan-700 shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center cursor-pointer"
          style={{ zIndex: 9999 }}
        >
          {/* 机器人头像 */}
          <div className="relative flex items-center justify-center">
            {/* 机器人头部 */}
            <div className="w-5 h-4 bg-soft-cyan-600 rounded-t-md relative">
              {/* 机器人眼睛 */}
              <div className="absolute top-1 left-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-1 right-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* 机器人嘴巴 */}
              <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-0.5 bg-white rounded-full"></div>
            </div>
            {/* 机器人身体 */}
            <div className="absolute top-3 w-4 h-2 bg-soft-cyan-500 rounded-b"></div>
            {/* 机器人天线 */}
            <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-1.5 bg-soft-cyan-600"></div>
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-soft-cyan-600 rounded-full"></div>
          </div>
          <span className="sr-only">{t('Open AI Chat Assistant')}</span>
        </button>
        {/* 添加一个小的提示气泡 */}
        <div className="absolute bottom-14 right-0 bg-text-primary text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          {t('AI Teaching Assistant')}
          <div className="absolute top-full right-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-text-primary"></div>
        </div>
        {/* 添加一个动态光环效果 */}
        <div className="absolute inset-0 w-12 h-12 rounded-full border border-soft-cyan-400 animate-ping opacity-30 pointer-events-none"></div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 bg-white border-soft-cyan-200 shadow-xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-96'
      }`}>
        <CardHeader className="p-4 bg-soft-cyan-600 text-white cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" />
              {t('AI Teaching Assistant')}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMinimized(!isMinimized)
                }}
                className="h-6 w-6 p-0 text-white hover:bg-soft-cyan-700"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                className="h-6 w-6 p-0 text-white hover:bg-soft-cyan-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-soft-cyan-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-soft-cyan-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-2 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-soft-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-soft-cyan-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-3 w-3 text-soft-cyan-600" />
                  </div>
                  <div className="bg-gray-100 p-2 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('Ask me anything about teaching...')}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-soft-cyan-600 hover:bg-soft-cyan-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}