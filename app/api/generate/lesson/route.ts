import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import type { LessonPlanForm } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData: LessonPlanForm = await request.json()

    // In a real implementation, this would call OpenAI API
    // For demo purposes, we'll return a structured lesson plan
    const generatedPlan = {
      title: formData.title,
      level: formData.level,
      duration: formData.duration,
      objectives: [
        `Students will be able to understand and use ${formData.topic} vocabulary in context`,
        `Students will demonstrate comprehension through ${formData.focus_skills.join(' and ').toLowerCase()} activities`,
        `Students will show improved fluency in ${formData.focus_skills[0]?.toLowerCase() || 'communication'} skills`
      ],
      materials: [
        'Whiteboard/projector',
        'Handouts with exercises',
        'Audio/video materials',
        'Student worksheets'
      ],
      procedures: [
        {
          type: 'warm_up',
          duration: Math.ceil(formData.duration * 0.15),
          description: `Review previous lesson and introduce today's topic: ${formData.topic}. Engage students with a quick discussion or brainstorming activity.`,
          materials: ['Whiteboard'],
          instructions: [
            'Greet students and check homework',
            'Write topic on board',
            'Ask students what they know about the topic'
          ]
        },
        {
          type: 'presentation',
          duration: Math.ceil(formData.duration * 0.3),
          description: `Present new vocabulary and concepts related to ${formData.topic}. Use visual aids and examples.`,
          materials: ['Slides', 'Visual aids'],
          instructions: [
            'Introduce key vocabulary with examples',
            'Demonstrate usage in context',
            'Check understanding with concept questions'
          ]
        },
        {
          type: 'practice',
          duration: Math.ceil(formData.duration * 0.35),
          description: `Controlled practice activities focusing on ${formData.focus_skills.join(', ')} skills.`,
          materials: ['Worksheets', 'Audio materials'],
          instructions: [
            'Distribute practice materials',
            'Guide students through exercises',
            'Provide feedback and correction'
          ]
        },
        {
          type: 'production',
          duration: Math.ceil(formData.duration * 0.15),
          description: 'Students use new language in freer practice activities.',
          materials: ['Task cards'],
          instructions: [
            'Set up communicative activities',
            'Monitor and provide support',
            'Encourage peer interaction'
          ]
        },
        {
          type: 'wrap_up',
          duration: Math.ceil(formData.duration * 0.05),
          description: 'Review lesson objectives and assign homework.',
          materials: [],
          instructions: [
            'Summarize key points',
            'Check if objectives were met',
            'Assign relevant homework'
          ]
        }
      ],
      assessment: `Formative assessment through observation during activities. Exit ticket: Students write 3 sentences using new vocabulary from ${formData.topic}.`,
      homework: `Complete worksheet exercises. Practice using new ${formData.topic} vocabulary in a short paragraph (50-75 words).`,
      notes: formData.special_requirements || `Adapted for ${formData.level} level students. Class size: ${formData.class_size}.`
    }

    return NextResponse.json(generatedPlan)
  } catch (error) {
    console.error('Error generating lesson plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate lesson plan' },
      { status: 500 }
    )
  }
}