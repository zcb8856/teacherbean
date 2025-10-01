import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sampleItems } from '@/data/sample-items'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if items already exist for this user
    const { data: existingItems, error: checkError } = await supabase
      .from('items')
      .select('id')
      .eq('owner_id', session.user.id)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing items:', checkError)
      return NextResponse.json(
        { message: 'Failed to check existing data' },
        { status: 500 }
      )
    }

    if (existingItems && existingItems.length > 0) {
      return NextResponse.json({
        message: 'Sample data already exists',
        count: existingItems.length
      })
    }

    // Insert sample items
    const itemsToInsert = sampleItems.map(item => ({
      ...item,
      owner_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { data: insertedItems, error: insertError } = await supabase
      .from('items')
      .insert(itemsToInsert)
      .select('id, type, level')

    if (insertError) {
      console.error('Error inserting sample items:', insertError)
      return NextResponse.json(
        { message: 'Failed to insert sample data', error: insertError.message },
        { status: 500 }
      )
    }

    // Generate some sample submissions for analytics
    await generateSampleSubmissions(supabase, session.user.id)

    return NextResponse.json({
      message: 'Sample data inserted successfully',
      items_count: insertedItems?.length || 0,
      items_by_type: insertedItems?.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      items_by_level: insertedItems?.reduce((acc, item) => {
        acc[item.level] = (acc[item.level] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    })

  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { message: 'Failed to seed data' },
      { status: 500 }
    )
  }
}

async function generateSampleSubmissions(supabase: any, userId: string) {
  try {
    // First, get user's classes
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('id, name')
      .eq('owner_id', userId)
      .limit(2)

    if (classError || !classes || classes.length === 0) {
      console.log('No classes found, skipping sample submissions')
      return
    }

    // Create a sample assignment for each class
    const assignments = []
    for (const cls of classes) {
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          class_id: cls.id,
          title: `示例测验 - ${cls.name}`,
          description: '系统生成的示例测验数据',
          type: 'quiz',
          payload_json: {
            items: [],
            settings: {
              time_limit: 30,
              shuffle_questions: true
            }
          },
          max_score: 100,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (!assignmentError && assignment) {
        assignments.push({ id: assignment.id, class_id: cls.id, class_name: cls.name })
      }
    }

    // Get some students for sample submissions
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, alias, class_id')
      .in('class_id', classes.map((c: any) => c.id))
      .limit(10)

    if (studentError || !students || students.length === 0) {
      console.log('No students found, skipping sample submissions')
      return
    }

    // Generate sample submissions
    const submissions = []
    for (const assignment of assignments) {
      const classStudents = students.filter((s: any) => s.class_id === assignment.class_id)

      for (const student of classStudents.slice(0, 5)) { // Limit to 5 students per class
        const score = Math.floor(Math.random() * 40) + 60 // Random score between 60-100
        const percentage = score
        const isCorrect = Math.random() > 0.3 // 70% chance of being correct

        submissions.push({
          assignment_id: assignment.id,
          student_id: student.id,
          student_name: student.alias,
          answers_json: {
            'q1': Math.floor(Math.random() * 4),
            'q2': Math.floor(Math.random() * 4),
            'q3': Math.floor(Math.random() * 4)
          },
          score_json: {
            total_score: score,
            max_score: 100,
            percentage: percentage,
            item_scores: [
              { item_id: 'q1', points_earned: isCorrect ? 2 : 0, max_points: 2, is_correct: isCorrect },
              { item_id: 'q2', points_earned: isCorrect ? 2 : 0, max_points: 2, is_correct: isCorrect },
              { item_id: 'q3', points_earned: isCorrect ? 2 : 0, max_points: 2, is_correct: isCorrect }
            ]
          },
          total_score: score,
          feedback_json: {
            overall_feedback: score >= 80 ? '表现优秀！' : score >= 70 ? '表现良好！' : '需要继续努力！',
            item_feedback: [],
            strengths: ['语法理解'],
            areas_for_improvement: score < 80 ? ['词汇积累', '时态运用'] : []
          },
          submitted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 7 days
          graded_at: new Date().toISOString(),
          is_late: false
        })
      }
    }

    if (submissions.length > 0) {
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert(submissions)

      if (submissionError) {
        console.error('Error inserting sample submissions:', submissionError)
      } else {
        console.log(`Inserted ${submissions.length} sample submissions`)
      }
    }

  } catch (error) {
    console.error('Error generating sample submissions:', error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Delete all user's items
    const { error: itemsError } = await supabase
      .from('items')
      .delete()
      .eq('owner_id', session.user.id)

    if (itemsError) {
      console.error('Error deleting items:', itemsError)
      return NextResponse.json(
        { message: 'Failed to delete items' },
        { status: 500 }
      )
    }

    // Delete sample assignments and submissions
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id')
      .eq('title', '示例测验')

    if (assignments && assignments.length > 0) {
      await supabase
        .from('submissions')
        .delete()
        .in('assignment_id', assignments.map((a: any) => a.id))

      await supabase
        .from('assignments')
        .delete()
        .in('id', assignments.map((a: any) => a.id))
    }

    return NextResponse.json({
      message: 'Sample data cleared successfully'
    })

  } catch (error) {
    console.error('Error clearing sample data:', error)
    return NextResponse.json(
      { message: 'Failed to clear sample data' },
      { status: 500 }
    )
  }
}