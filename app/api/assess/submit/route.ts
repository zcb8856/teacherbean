// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { Submission } from '@/types/assess'

const SubmitRequestSchema = z.object({
  paper_id: z.string(),
  student_name: z.string().optional(),
  student_id: z.string().optional(),
  assignment_id: z.string().optional(),
  answers: z.record(z.any()),
  time_spent: z.number().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication (optional for anonymous quiz submissions)
    const { data: { session } } = await supabase.auth.getSession()

    const body = await request.json()
    const data = SubmitRequestSchema.parse(body)

    // Calculate scores based on answers
    const scoringResult = await calculateScores(data.paper_id, data.answers)

    // Create submission record
    const submission: Partial<Submission> = {
      assignment_id: data.assignment_id,
      student_id: data.student_id,
      student_name: data.student_name,
      answers_json: data.answers,
      score_json: scoringResult.score_json,
      total_score: scoringResult.total_score,
      feedback_json: scoringResult.feedback_json,
      submitted_at: new Date().toISOString(),
      is_late: false // This would be calculated based on assignment due date
    }

    if (session && data.assignment_id) {
      // Save to database if it's a formal assignment
      const { data: savedSubmission, error } = await supabase
        .from('submissions')
        .insert(submission)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json(
          { message: 'Failed to save submission' },
          { status: 500 }
        )
      }

      return NextResponse.json(savedSubmission)
    } else {
      // Return results for anonymous quiz
      return NextResponse.json({
        id: `temp_${Date.now()}`,
        ...submission,
        message: '测验完成，结果已生成'
      })
    }

  } catch (error) {
    console.error('Error submitting quiz:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}

async function calculateScores(paperId: string, answers: Record<string, any>) {
  // This would normally fetch the answer key from the paper/items
  // For now, we'll use a simplified scoring system

  // Sample answer key (normally would be fetched from database)
  const answerKey = {
    'q1': { correct_answer: 1, points: 2, type: 'mcq' },
    'q2': { correct_answer: 1, points: 2, type: 'mcq' }
  }

  let totalScore = 0
  let maxScore = 0
  const itemScores = []
  const itemFeedback = []

  for (const [itemId, keyData] of Object.entries(answerKey)) {
    const studentAnswer = answers[itemId]
    const isCorrect = studentAnswer === keyData.correct_answer
    const pointsEarned = isCorrect ? keyData.points : 0

    totalScore += pointsEarned
    maxScore += keyData.points

    itemScores.push({
      item_id: itemId,
      points_earned: pointsEarned,
      max_points: keyData.points,
      is_correct: isCorrect
    })

    itemFeedback.push({
      item_id: itemId,
      feedback: isCorrect ? '回答正确！' : '回答错误，请复习相关知识点。',
      correct_answer: keyData.correct_answer
    })
  }

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  // Generate overall feedback
  let overallFeedback = ''
  let strengths = []
  let areasForImprovement = []

  if (percentage >= 90) {
    overallFeedback = '优秀！您的表现非常出色，继续保持！'
    strengths.push('语法掌握扎实', '答题准确率高')
  } else if (percentage >= 70) {
    overallFeedback = '良好！您的基础不错，继续努力提升！'
    strengths.push('基础知识掌握较好')
    areasForImprovement.push('细节理解有待加强')
  } else if (percentage >= 60) {
    overallFeedback = '及格，但还有很大提升空间。'
    areasForImprovement.push('基础语法需要加强', '多做练习题')
  } else {
    overallFeedback = '需要更多努力，建议系统复习基础知识。'
    areasForImprovement.push('基础知识薄弱', '需要系统复习', '多练习基础题目')
  }

  return {
    score_json: {
      total_score: totalScore,
      max_score: maxScore,
      percentage: Math.round(percentage * 100) / 100,
      item_scores: itemScores
    },
    total_score: totalScore,
    feedback_json: {
      overall_feedback: overallFeedback,
      item_feedback: itemFeedback,
      strengths,
      areas_for_improvement: areasForImprovement
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignment_id')
    const studentId = searchParams.get('student_id')

    let query = supabase
      .from('submissions')
      .select(`
        *,
        assignments!inner(
          class_id,
          classes!inner(owner_id)
        )
      `)
      .eq('assignments.classes.owner_id', session.user.id)

    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId)
    }

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { data: submissions, error } = await query.order('submitted_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    return NextResponse.json(submissions)

  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { message: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}