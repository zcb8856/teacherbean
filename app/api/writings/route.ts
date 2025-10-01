import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { WritingRubric, SentenceSuggestion } from '@/types/writing'

const CreateWritingSchema = z.object({
  task_id: z.string(),
  student_text: z.string().min(10),
  student_name: z.string().optional(),
  rubric_json: z.object({
    task_response: z.number().min(0).max(5),
    accuracy: z.number().min(0).max(5),
    lexical_range: z.number().min(0).max(5),
    cohesion: z.number().min(0).max(5),
    organization: z.number().min(0).max(5),
    overall: z.number().min(0).max(100),
    summary: z.string()
  }),
  ai_feedback: z.object({
    sentence_suggestions: z.array(z.object({
      idx: z.number(),
      before: z.string(),
      after: z.string(),
      reason: z.string()
    })),
    improved_version: z.string(),
    teacher_brief: z.string()
  }),
  final_score: z.number().min(0).max(100)
})

const UpdateWritingSchema = z.object({
  teacher_feedback: z.string().optional(),
  revised_text: z.string().optional(),
  final_score: z.number().min(0).max(100).optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = CreateWritingSchema.parse(body)

    // Calculate word count
    const word_count = data.student_text.trim().split(/\s+/).filter(word => word.length > 0).length

    // Create writing submission
    const { data: writing, error } = await supabase
      .from('writings')
      .insert({
        task_id: data.task_id,
        user_id: session.user.id,
        student_name: data.student_name,
        text: data.student_text,
        word_count,
        rubric_json: data.rubric_json,
        ai_feedback: data.ai_feedback,
        final_score: data.final_score,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to save writing submission' },
        { status: 500 }
      )
    }

    return NextResponse.json(writing, { status: 201 })

  } catch (error) {
    console.error('Error saving writing:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to save writing submission' },
      { status: 500 }
    )
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('writings')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`student_name.ilike.%${search}%,task_id.ilike.%${search}%`)
    }

    // Add pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: writings, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch writings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: writings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching writings:', error)
    return NextResponse.json(
      { message: 'Failed to fetch writings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    const data = UpdateWritingSchema.parse(updateData)

    if (!id) {
      return NextResponse.json({ message: 'Writing ID is required' }, { status: 400 })
    }

    // Update writing submission
    const { data: writing, error } = await supabase
      .from('writings')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to update writing submission' },
        { status: 500 }
      )
    }

    if (!writing) {
      return NextResponse.json(
        { message: 'Writing not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(writing)

  } catch (error) {
    console.error('Error updating writing:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to update writing submission' },
      { status: 500 }
    )
  }
}