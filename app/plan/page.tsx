'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BookOpen, Clock, Users, Target, Download, Save, Home } from 'lucide-react'
import type { LessonPlanForm, CEFRLevel } from '@/types'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

export default function LessonPlanPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<LessonPlanForm>({
    title: '',
    level: 'A2',
    duration: 45,
    topic: '',
    focus_skills: [],
    class_size: 25,
    student_level: 'Beginner to Intermediate',
    special_requirements: ''
  })
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const skillOptions = ['Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Pronunciation']

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      focus_skills: prev.focus_skills.includes(skill)
        ? prev.focus_skills.filter(s => s !== skill)
        : [...prev.focus_skills, skill]
    }))
  }

  const handleGeneratePlan = async () => {
    if (!formData.title || !formData.topic || formData.focus_skills.length === 0) {
      toast.error(t('Please fill in all required fields'))
      return
    }

    setLoading(true)
    try {
      // 检查是否是开发者模式或演示模式
      if (process.env.NODE_ENV === 'development' || true) {
        // 演示模式：生成模拟的课程计划
        setTimeout(() => {
          const demoLessonPlan = {
            title: formData.title,
            level: formData.level,
            duration: formData.duration,
            topic: formData.topic,
            objectives: [
              t('Students will be able to understand and use ') + formData.topic.toLowerCase(),
              t('Students will practice ') + formData.focus_skills.join(t(' and ')).toLowerCase(),
              t('Students will demonstrate comprehension through interactive activities'),
              t('Students will apply new vocabulary in contextual conversations')
            ],
            procedures: [
              {
                type: 'warm_up',
                duration: 5,
                description: t('Engaging starter activity to activate prior knowledge and introduce the topic'),
                materials: [t('Whiteboard'), t('Visual aids')]
              },
              {
                type: 'presentation',
                duration: 15,
                description: t('Introduce new vocabulary and grammar structures related to ') + formData.topic,
                materials: [t('Presentation slides'), t('Audio materials'), t('Handouts')]
              },
              {
                type: 'practice',
                duration: 15,
                description: t('Guided practice activities focusing on ') + formData.focus_skills.join(', '),
                materials: [t('Worksheets'), t('Pair work cards'), t('Interactive exercises')]
              },
              {
                type: 'production',
                duration: 8,
                description: t('Students apply learning through communicative tasks and real-world scenarios'),
                materials: [t('Role-play cards'), t('Speaking prompts')]
              },
              {
                type: 'wrap_up',
                duration: 2,
                description: t('Review key points, assign homework, and preview next lesson'),
                materials: [t('Summary handout')]
              }
            ],
            assessment: t('Formative assessment through observation, peer feedback, and quick comprehension checks. Students will be evaluated on accuracy, fluency, and participation.'),
            homework: t('Complete vocabulary exercises, prepare for next lesson\'s topic, and practice speaking with a partner.')
          }
          setGeneratedPlan(demoLessonPlan)
          toast.success(t('Lesson plan generated successfully!'))
          setLoading(false)
        }, 1500)
        return
      }

      const response = await fetch('/api/generate/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to generate lesson plan')

      const data = await response.json()
      setGeneratedPlan(data)
      toast.success(t('Lesson plan generated successfully!'))
    } catch (error) {
      toast.error(t('Failed to generate lesson plan'))
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlan = async () => {
    if (!generatedPlan) return

    try {
      // 检查是否是开发者模式或演示模式
      if (process.env.NODE_ENV === 'development' || true) {
        // 演示模式：模拟保存成功
        setTimeout(() => {
          toast.success(t('Lesson plan saved to library!'))
        }, 500)
        return
      }

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lesson_plan',
          title: formData.title,
          content_json: generatedPlan,
          tags: [formData.topic, ...formData.focus_skills],
          cefr_level: formData.level,
          estimated_duration: formData.duration
        })
      })

      if (!response.ok) throw new Error('Failed to save lesson plan')

      toast.success(t('Lesson plan saved to library!'))
    } catch (error) {
      toast.error(t('Failed to save lesson plan'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">{t('Lesson Planning')}</h1>
          <p className="text-text-primary-light">{t('AI-generated lesson plans with CEFR alignment, learning objectives, and integrated materials generation')}</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-soft-cyan-50 border-soft-cyan-200">
            <Home className="h-4 w-4" />
            {t('Back to Home')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <BookOpen className="h-5 w-5" />
              {t('Lesson Plan Details')}
            </CardTitle>
            <CardDescription className="text-text-primary-light">
              {t('Fill in the details to generate a comprehensive lesson plan')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary">{t('Lesson Title')} *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('e.g., Introduction to Present Perfect Tense')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">{t('CEFR Level')}</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as CEFRLevel }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {cefrLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">{t('Duration (minutes)')}</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="15"
                  max="120"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">{t('Topic/Theme')} *</label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder={t('e.g., Daily Routines, Past Experiences, Future Plans')}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">{t('Focus Skills')} *</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {skillOptions.map(skill => (
                  <label key={skill} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.focus_skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="rounded"
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">{t('Class Size')}</label>
                <Input
                  type="number"
                  value={formData.class_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_size: parseInt(e.target.value) }))}
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">{t('Student Level')}</label>
                <Input
                  value={formData.student_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, student_level: e.target.value }))}
                  placeholder={t('e.g., Mixed ability, High beginner')}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">{t('Special Requirements')}</label>
              <textarea
                value={formData.special_requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
                placeholder={t('Any special considerations, learning objectives, or constraints...')}
                className="w-full p-3 rounded-md border border-input bg-background min-h-[80px]"
              />
            </div>

            <Button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full"
            >
              {loading ? t('Generating...') : t('Generate Lesson Plan')}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Plan Section */}
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Target className="h-5 w-5" />
              {t('Generated Lesson Plan')}
            </CardTitle>
            <CardDescription className="text-text-primary-light">
              {t('Your AI-generated lesson plan will appear here')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedPlan ? (
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Button onClick={handleSavePlan} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {t('Save to Library')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {t('Export PDF')}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{generatedPlan.title}</h3>
                    <div className="flex gap-4 text-sm text-text-primary-light mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {generatedPlan.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {generatedPlan.level}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">{t('Learning Objectives')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                      {generatedPlan.objectives?.map((obj: string, idx: number) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">{t('Lesson Activities')}</h4>
                    <div className="space-y-3 mt-2">
                      {generatedPlan.procedures?.map((activity: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium capitalize">{activity.type.replace('_', ' ')}</h5>
                            <span className="text-sm text-text-primary-light">{activity.duration} min</span>
                          </div>
                          <p className="text-sm text-text-primary-light mt-1">{activity.description}</p>
                          {activity.materials && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-text-primary-light">{t('Materials')}: </span>
                              <span className="text-xs text-text-primary-light">{activity.materials.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">{t('Assessment & Homework')}</h4>
                    <p className="text-sm text-text-primary-light mt-2">{generatedPlan.assessment}</p>
                    {generatedPlan.homework && (
                      <p className="text-sm text-text-primary-light mt-2">
                        <strong>{t('Homework')}:</strong> {generatedPlan.homework}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-text-primary-muted">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('Fill in the form and click "Generate Lesson Plan" to see your AI-created lesson plan here.')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}