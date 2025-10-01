'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'
import { useTranslation } from '@/hooks/useTranslation'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-text-primary mb-6 drop-shadow-sm">
            {t('TeacherBean')}
          </h1>
          <p className="text-xl text-text-primary-light mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('AI-powered English teaching platform for comprehensive lesson planning, interactive materials, and intelligent assessment')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg">{t('Get Started')}</Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg">{t('View Demo')}</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Link href="/plan" className="block group">
            <Card className="bg-soft-cyan-100 border-soft-cyan-200 hover:bg-soft-cyan-50 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-text-primary">
                  <span className="text-2xl">📚</span>
                  <span>{t('Lesson Planning')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-text-primary-light text-base leading-relaxed">
                  {t('Create AI-powered lesson plans with CEFR alignment')}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reading" className="block group">
            <Card className="bg-soft-cyan-100 border-soft-cyan-200 hover:bg-soft-cyan-50 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-text-primary">
                  <span className="text-2xl">📖</span>
                  <span>{t('Reading Materials')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-text-primary-light text-base leading-relaxed">
                  {t('Adaptive reading passages with vocabulary support, comprehension questions, and difficulty adjustment')}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dialog" className="block group">
            <Card className="bg-soft-cyan-100 border-soft-cyan-200 hover:bg-soft-cyan-50 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-text-primary">
                  <span className="text-2xl">🎭</span>
                  <span>{t('Interactive Dialogs')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-text-primary-light text-base leading-relaxed">
                  {t('Scenario-based conversation practice with role-play cards and pronunciation feedback')}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/game" className="block group">
            <Card className="bg-soft-cyan-100 border-soft-cyan-200 hover:bg-soft-cyan-50 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-text-primary">
                  <span className="text-2xl">🎮</span>
                  <span>{t('Quick Games')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-text-primary-light text-base leading-relaxed">
                  {t('Engaging vocabulary games, sentence matching, and rapid-fire Q&A with real-time scoring')}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/writing" className="block group">
            <Card className="bg-soft-cyan-100 border-soft-cyan-200 hover:bg-soft-cyan-50 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-text-primary">
                  <span className="text-2xl">✍️</span>
                  <span>{t('Writing Assistant')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-text-primary-light text-base leading-relaxed">
                  {t('AI-powered writing feedback and improvement suggestions')}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/assess" className="block group">
            <Card className="bg-soft-cyan-100 border-soft-cyan-200 hover:bg-soft-cyan-50 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-text-primary">
                  <span className="text-2xl">📊</span>
                  <span>{t('Assessment Hub')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-text-primary-light text-base leading-relaxed">
                  {t('Comprehensive test bank with auto-grading, analytics dashboard, and progress tracking')}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4 drop-shadow-sm">
            {t('Ready to Transform Your Teaching?')}
          </h2>
          <p className="text-text-primary-light mb-8 text-lg leading-relaxed">
            {t('Join thousands of educators using AI to create better learning experiences')}
          </p>
          <Link href="/auth/signup">
            <Button size="lg">{t('Start Free Trial')}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}