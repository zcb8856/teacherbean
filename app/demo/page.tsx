'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, FileText, MessageSquare, Gamepad2, PenTool, ClipboardList, Library, Play } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function DemoPage() {
  const { t } = useTranslation()
  const features = [
    {
      icon: BookOpen,
      title: t('AI Lesson Planning'),
      description: t('Generate comprehensive lesson plans with CEFR alignment, learning objectives, and structured activities'),
      demo: t('Create a lesson plan for "Present Perfect Tense" with A2 level, 45-minute duration')
    },
    {
      icon: FileText,
      title: t('Reading Materials'),
      description: t('Adaptive reading passages with vocabulary support and comprehension questions'),
      demo: t('Generate a reading about "Daily Routines" with vocabulary definitions and questions')
    },
    {
      icon: MessageSquare,
      title: t('Dialog Practice'),
      description: t('Interactive conversation scenarios for real-world situations'),
      demo: t('Practice restaurant conversations with role-play cards and key vocabulary')
    },
    {
      icon: Gamepad2,
      title: t('Quick Games'),
      description: t('Engaging vocabulary games and grammar exercises with real-time scoring'),
      demo: t('Play vocabulary spelling, sentence matching, and quick Q&A games')
    },
    {
      icon: PenTool,
      title: t('Writing Assistant'),
      description: t('AI-powered writing feedback with detailed rubric scoring and suggestions'),
      demo: t('Get AI feedback on student writing with grammar corrections and improvement tips')
    },
    {
      icon: ClipboardList,
      title: t('Assessment Hub'),
      description: t('Comprehensive test bank with auto-grading and analytics'),
      demo: t('Create quizzes with MCQ, cloze, and matching questions plus performance analytics')
    },
    {
      icon: Library,
      title: t('Resource Library'),
      description: t('Organize and share teaching materials with templates and collaboration'),
      demo: t('Browse saved lesson plans, reading materials, and shared templates')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text-primary drop-shadow-sm mb-6">
            {t('TeacherBean Platform Demo')}
          </h1>
          <p className="text-xl text-text-primary-light mb-8 max-w-3xl mx-auto">
            {t('Explore the comprehensive AI-powered English teaching platform designed to streamline lesson planning, material creation, and student assessment.')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">
                <Play className="h-5 w-5 mr-2" />
                {t('Try Full Platform')}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">
                {t('Back to Home')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden bg-soft-cyan-50 border-soft-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <CardHeader className="bg-white/90">
                  <CardTitle className="flex items-center gap-3 text-xl text-text-primary">
                    <div className="w-12 h-12 rounded-lg bg-soft-cyan-100 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-soft-cyan-600" />
                    </div>
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base text-text-primary-light">
                    {feature.description}
                  </CardDescription>
                  <div className="pt-4">
                    <div className="text-sm font-medium text-text-primary mb-2">{t('Demo Scenario')}:</div>
                    <div className="text-sm text-text-primary-light bg-soft-cyan-50 p-3 rounded-lg">
                      {feature.demo}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-warm-orange-50 p-6 flex items-center justify-center">
                  <div className="text-center text-text-primary-muted">
                    <feature.icon className="h-24 w-24 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">{t('Interactive demo would appear here')}</p>
                    <p className="text-xs mt-2">{t('Sign up to access the full platform')}</p>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-text-primary">{t('Ready to Transform Your Teaching?')}</CardTitle>
              <CardDescription className="text-text-primary-light">
                {t('Join thousands of educators using AI to create better learning experiences')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-soft-cyan-600">50+</div>
                  <div className="text-sm text-text-primary-light">{t('Built-in Templates')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-soft-cyan-600">A1-C2</div>
                  <div className="text-sm text-text-primary-light">{t('CEFR Levels Supported')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-soft-cyan-600">24/7</div>
                  <div className="text-sm text-text-primary-light">{t('AI Assistant Available')}</div>
                </div>
              </div>
              <Link href="/auth/signup">
                <Button size="lg" className="w-full mt-6">
                  {t('Start Free Trial')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}