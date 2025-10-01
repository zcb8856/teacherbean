import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { AnalyticsData, ErrorAnalysis } from '@/types/assess'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const viewMode = searchParams.get('view_mode') || 'class'
    const classId = searchParams.get('class_id')
    const period = searchParams.get('period') || 'month'

    // Calculate date range based on period
    const endDate = new Date()
    const startDate = new Date()
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Fetch analytics data
    const analytics = await fetchAnalyticsData(supabase, session.user.id, {
      viewMode,
      classId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    // Fetch error analysis
    const errorAnalysis = await fetchErrorAnalysis(supabase, session.user.id, {
      classId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    return NextResponse.json({
      analytics,
      error_analysis: errorAnalysis
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { message: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

async function fetchAnalyticsData(
  supabase: any,
  userId: string,
  params: {
    viewMode: string
    classId?: string | null
    startDate: string
    endDate: string
  }
): Promise<AnalyticsData> {
  // Base query for submissions in user's classes
  let baseQuery = supabase
    .from('submissions')
    .select(`
      *,
      assignments!inner(
        id,
        title,
        class_id,
        max_score,
        due_at,
        classes!inner(
          id,
          name,
          owner_id
        )
      ),
      students(
        id,
        alias,
        class_id
      )
    `)
    .eq('assignments.classes.owner_id', userId)
    .gte('submitted_at', params.startDate)
    .lte('submitted_at', params.endDate)

  // Apply class filter if specified
  if (params.classId && params.classId !== 'all') {
    baseQuery = baseQuery.eq('assignments.class_id', params.classId)
  }

  const { data: submissions, error } = await baseQuery

  if (error) {
    console.error('Error fetching submissions:', error)
    throw error
  }

  // Calculate overview statistics
  const totalSubmissions = submissions.length
  const averageScore = submissions.length > 0
    ? submissions.reduce((sum: number, sub: any) => sum + (sub.total_score || 0), 0) / submissions.length
    : 0

  const onTimeSubmissions = submissions.filter(sub =>
    !sub.is_late && sub.assignments.due_at && new Date(sub.submitted_at) <= new Date(sub.assignments.due_at)
  ).length

  const completionRate = totalSubmissions > 0 ? (totalSubmissions / totalSubmissions) * 100 : 0
  const onTimeRate = totalSubmissions > 0 ? (onTimeSubmissions / totalSubmissions) * 100 : 0

  // Calculate score distribution
  const scoreRanges = [
    { range: '90-100', min: 90, max: 100 },
    { range: '80-89', min: 80, max: 89 },
    { range: '70-79', min: 70, max: 79 },
    { range: '60-69', min: 60, max: 69 },
    { range: '0-59', min: 0, max: 59 }
  ]

  const scoreDistribution = scoreRanges.map(range => {
    const count = submissions.filter(sub => {
      const percentage = sub.score_json?.percentage || 0
      return percentage >= range.min && percentage <= range.max
    }).length

    return {
      range: range.range,
      count,
      percentage: totalSubmissions > 0 ? (count / totalSubmissions) * 100 : 0
    }
  })

  // Calculate difficulty analysis (mock data - would need item-level analysis)
  const difficultyAnalysis = [
    { difficulty: '容易', average_score: averageScore + 10, item_count: Math.floor(totalSubmissions * 0.3) },
    { difficulty: '中等', average_score: averageScore, item_count: Math.floor(totalSubmissions * 0.5) },
    { difficulty: '困难', average_score: averageScore - 15, item_count: Math.floor(totalSubmissions * 0.2) }
  ]

  // Calculate topic performance (mock data - would need detailed item analysis)
  const topicPerformance = [
    {
      topic: 'Grammar',
      average_score: averageScore + 5,
      submissions: totalSubmissions,
      common_errors: ['Tense confusion', 'Subject-verb agreement']
    },
    {
      topic: 'Vocabulary',
      average_score: averageScore - 3,
      submissions: totalSubmissions,
      common_errors: ['Word choice', 'Collocation']
    },
    {
      topic: 'Reading',
      average_score: averageScore - 8,
      submissions: totalSubmissions,
      common_errors: ['Main idea', 'Detail questions']
    }
  ]

  // Time analysis (mock data)
  const timeAnalysis = {
    average_completion_time: 20,
    time_distribution: [
      { range: '0-10分钟', count: Math.floor(totalSubmissions * 0.1) },
      { range: '10-20分钟', count: Math.floor(totalSubmissions * 0.6) },
      { range: '20-30分钟', count: Math.floor(totalSubmissions * 0.2) },
      { range: '30分钟以上', count: Math.floor(totalSubmissions * 0.1) }
    ]
  }

  // Student performance
  const studentPerformance = params.viewMode === 'student'
    ? submissions.map(sub => ({
        student_id: sub.student_id || '',
        student_name: sub.student_name || sub.students?.alias || 'Unknown',
        score: sub.total_score || 0,
        completion_time: 20, // Mock data
        strengths: ['Grammar'],
        weaknesses: ['Vocabulary']
      }))
    : []

  // Class performance
  const classPerformance = params.viewMode === 'class'
    ? Object.values(
        submissions.reduce((acc, sub) => {
          const classId = sub.assignments.class_id
          const className = sub.assignments.classes.name

          if (!acc[classId]) {
            acc[classId] = {
              class_id: classId,
              class_name: className,
              scores: [],
              submission_count: 0,
              completion_rate: 0
            }
          }

          acc[classId].scores.push(sub.total_score || 0)
          acc[classId].submission_count++

          return acc
        }, {} as any)
      ).map((classData: any) => ({
        class_id: classData.class_id,
        class_name: classData.class_name,
        average_score: classData.scores.reduce((sum: number, score: number) => sum + score, 0) / classData.scores.length,
        submission_count: classData.submission_count,
        completion_rate: 95 // Mock data
      }))
    : []

  return {
    overview: {
      total_submissions: totalSubmissions,
      average_score: Number(averageScore.toFixed(1)),
      completion_rate: Number(completionRate.toFixed(1)),
      on_time_rate: Number(onTimeRate.toFixed(1))
    },
    score_distribution: scoreDistribution,
    difficulty_analysis: difficultyAnalysis,
    topic_performance: topicPerformance,
    time_analysis: timeAnalysis,
    student_performance: studentPerformance,
    class_performance: classPerformance
  }
}

async function fetchErrorAnalysis(
  supabase: any,
  userId: string,
  params: {
    classId?: string | null
    startDate: string
    endDate: string
  }
): Promise<ErrorAnalysis> {
  // This would normally analyze actual submission data and item responses
  // For now, returning mock data that demonstrates the structure

  return {
    by_grammar_point: [
      {
        grammar_point: '现在完成时',
        error_count: 45,
        total_attempts: 120,
        error_rate: 37.5,
        common_mistakes: ['have/has 混用', '过去分词错误', '时间状语搭配']
      },
      {
        grammar_point: '被动语态',
        error_count: 38,
        total_attempts: 115,
        error_rate: 33.0,
        common_mistakes: ['be动词时态错误', '过去分词形式', '主谓一致']
      },
      {
        grammar_point: '条件句',
        error_count: 32,
        total_attempts: 98,
        error_rate: 32.7,
        common_mistakes: ['if从句时态', '主句结构', '虚拟语气']
      }
    ],
    by_topic: [
      {
        topic: '时态语法',
        error_count: 89,
        total_attempts: 312,
        error_rate: 28.5
      },
      {
        topic: '词汇运用',
        error_count: 67,
        total_attempts: 245,
        error_rate: 27.3
      },
      {
        topic: '句型结构',
        error_count: 54,
        total_attempts: 189,
        error_rate: 28.6
      }
    ],
    by_item_type: [
      {
        item_type: '选择题',
        error_count: 123,
        total_attempts: 623,
        error_rate: 19.7
      },
      {
        item_type: '填空题',
        error_count: 78,
        total_attempts: 234,
        error_rate: 33.3
      },
      {
        item_type: '改错题',
        error_count: 45,
        total_attempts: 89,
        error_rate: 50.6
      }
    ],
    by_difficulty: [
      {
        difficulty_level: '容易',
        error_count: 34,
        total_attempts: 445,
        error_rate: 7.6
      },
      {
        difficulty_level: '中等',
        error_count: 145,
        total_attempts: 456,
        error_rate: 31.8
      },
      {
        difficulty_level: '困难',
        error_count: 67,
        total_attempts: 145,
        error_rate: 46.2
      }
    ]
  }
}