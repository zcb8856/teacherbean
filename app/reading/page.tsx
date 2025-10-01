'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { FileText, Brain, BookOpen, Save, Download, Home } from 'lucide-react'
import type { ReadingMaterialForm, CEFRLevel } from '@/types'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

export default function ReadingPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<ReadingMaterialForm>({
    title: '',
    level: 'A2',
    topic: '',
    text_length: 'medium',
    question_types: ['mcq', 'reading_q'],
    vocabulary_focus: [],
    cultural_context: ''
  })
  const [generatedMaterial, setGeneratedMaterial] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const textLengths = [
    { value: 'short', label: 'Short (100-200 words)', words: '100-200' },
    { value: 'medium', label: 'Medium (200-400 words)', words: '200-400' },
    { value: 'long', label: 'Long (400+ words)', words: '400+' }
  ]

  const handleGenerate = async () => {
    if (!formData.title || !formData.topic) {
      toast.error(t('Please fill in title and topic'))
      return
    }

    setLoading(true)
    try {
      // Simulate API call - in real app would call OpenAI
      const mockMaterial = {
        title: formData.title,
        level: formData.level,
        text: generateSampleText(formData.topic, formData.text_length),
        vocabulary: generateVocabulary(formData.topic),
        questions: generateQuestions(formData.question_types),
        themes: [formData.topic],
        estimated_time: formData.text_length === 'short' ? 15 : formData.text_length === 'medium' ? 25 : 35
      }

      setGeneratedMaterial(mockMaterial)
      toast.success(t('Reading material generated!'))
    } catch (error) {
      toast.error(t('Failed to generate material'))
    } finally {
      setLoading(false)
    }
  }

  const generateSampleText = (topic: string, length: string) => {
    const texts = {
      'daily routines': `Sarah is a busy high school student. Every morning, she wakes up at 6:30 AM and immediately checks her phone for messages. After getting dressed, she goes to the kitchen where her mother has already prepared breakfast. Sarah usually eats cereal with milk and drinks orange juice.

Before leaving for school, she packs her backpack with textbooks, notebooks, and her laptop. The bus arrives at 7:45 AM, and she meets her best friend Emma at the bus stop. During the 20-minute ride to school, they talk about homework and plan their weekend activities.

School starts at 8:15 AM with math class, which is Sarah's least favorite subject. However, she enjoys her English literature class in the afternoon because she loves reading novels. After school ends at 3:30 PM, Sarah usually goes to the library to study for about an hour before heading home.`,

      'food and cooking': `Cooking has become increasingly popular among young people in recent years. Many teenagers now prefer to prepare their own meals rather than eating fast food. This trend has several benefits for both health and personal development.

When you cook at home, you have complete control over the ingredients. You can choose fresh vegetables, lean proteins, and whole grains instead of processed foods high in sugar and salt. Additionally, home cooking is much more economical than dining out regularly.

Learning to cook also teaches valuable life skills. Following recipes improves reading comprehension and measurement skills. Time management becomes essential when preparing multiple dishes simultaneously. Most importantly, cooking creativity allows people to experiment with different flavors and create their own unique dishes.`
    }

    return texts[topic as keyof typeof texts] || `This is a sample reading passage about ${topic}. The passage would be generated based on the specified topic and would be appropriate for ${formData.level} level students. The length would be ${length} as requested, containing relevant vocabulary and cultural context.`
  }

  const generateVocabulary = (topic: string) => {
    const vocab = {
      'daily routines': [
        { word: 'immediately', definition: 'right away, without delay', example: 'She immediately checked her phone.' },
        { word: 'backpack', definition: 'a bag carried on the back', example: 'She packed her backpack with books.' },
        { word: 'literature', definition: 'written works like novels and poems', example: 'She enjoys English literature class.' }
      ]
    }

    return vocab[topic as keyof typeof vocab] || [
      { word: 'example', definition: 'a sample or illustration', example: 'This is an example sentence.' }
    ]
  }

  const generateQuestions = (types: string[]) => {
    return [
      {
        type: 'mcq',
        question: 'What time does Sarah wake up?',
        options: ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM'],
        answer: 1,
        explanation: 'The text states she wakes up at 6:30 AM.'
      },
      {
        type: 'short_answer',
        question: 'What does Sarah usually eat for breakfast?',
        answer: 'cereal with milk',
        explanation: 'The text mentions she usually eats cereal with milk and drinks orange juice.'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">{t('Reading Materials')}</h1>
          <p className="text-text-primary-light">{t('Adaptive reading passages with vocabulary support, comprehension questions, and difficulty adjustment')}</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-soft-cyan-50 border-soft-cyan-200">
            <Home className="h-4 w-4" />
            {t('Back to Home')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <FileText className="h-5 w-5" />
              {t('Reading Material Setup')}
            </CardTitle>
            <CardDescription className="text-text-primary-light">
              {t('Configure your reading passage parameters')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary">{t('Title')} *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('e.g., My Daily Routine, Healthy Eating Habits')}
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
                <label className="text-sm font-medium text-text-primary">{t('Text Length')}</label>
                <select
                  value={formData.text_length}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_length: e.target.value as 'short' | 'medium' | 'long' }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {textLengths.map(length => (
                    <option key={length.value} value={length.value}>{length.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">{t('Topic/Theme')} *</label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder={t('e.g., daily routines, food and cooking, travel')}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">{t('Cultural Context')}</label>
              <Input
                value={formData.cultural_context}
                onChange={(e) => setFormData(prev => ({ ...prev, cultural_context: e.target.value }))}
                placeholder={t('e.g., American high school, British family life')}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">{t('Vocabulary Focus')}</label>
              <Input
                value={formData.vocabulary_focus.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  vocabulary_focus: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                placeholder={t('e.g., time expressions, food vocabulary, daily activities')}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? t('Generating...') : t('Generate Reading Material')}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <BookOpen className="h-5 w-5" />
              {t('Generated Material')}
            </CardTitle>
            <CardDescription className="text-text-primary-light">
              {t('Your reading passage and questions')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedMaterial ? (
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Button size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {t('Save to Library')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {t('Export PDF')}
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{generatedMaterial.title}</h3>
                  <p className="text-sm text-text-primary-light">
                    {t('Level')}: {generatedMaterial.level} • {t('Est. time')}: {generatedMaterial.estimated_time} {t('min')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t('Reading Passage')}</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                    {generatedMaterial.text.split('\n\n').map((paragraph: string, idx: number) => (
                      <p key={idx} className="mb-3 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t('Key Vocabulary')}</h4>
                  <div className="space-y-2">
                    {generatedMaterial.vocabulary.map((item: any, idx: number) => (
                      <div key={idx} className="border rounded p-3">
                        <div className="font-medium">{item.word}</div>
                        <div className="text-sm text-text-primary-light">{item.definition}</div>
                        <div className="text-sm italic text-text-primary-muted">"{item.example}"</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t('Comprehension Questions')}</h4>
                  <div className="space-y-3">
                    {generatedMaterial.questions.map((q: any, idx: number) => (
                      <div key={idx} className="border rounded p-3">
                        <p className="font-medium">{idx + 1}. {q.question}</p>
                        {q.options && (
                          <div className="mt-2 space-y-1">
                            {q.options.map((option: string, optIdx: number) => (
                              <div key={optIdx} className="text-sm">
                                {String.fromCharCode(97 + optIdx)}) {option}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-sm text-text-primary-light mt-2">
                          <strong>{t('Answer')}:</strong> {typeof q.answer === 'number' ? q.options[q.answer] : q.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-text-primary-muted">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('Configure your reading material and click generate to see the AI-created content here.')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}