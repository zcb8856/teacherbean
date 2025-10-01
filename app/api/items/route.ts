import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { Item } from '@/types/assess'

const CreateItemSchema = z.object({
  type: z.enum(['mcq', 'cloze', 'error_correction', 'matching', 'reading_q', 'writing_task']),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  stem: z.string().min(10, 'Question stem too short'),
  options_json: z.any().optional(),
  answer_json: z.any(),
  explanation: z.string().optional(),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
  difficulty_score: z.number().min(0).max(1).default(0.5)
})

const UpdateItemSchema = CreateItemSchema.partial()

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
    const type = searchParams.get('type')
    const level = searchParams.get('level')
    const difficulty = searchParams.get('difficulty')
    const tags = searchParams.get('tags')

    let query = supabase
      .from('items')
      .select('*', { count: 'exact' })
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`stem.ilike.%${search}%,tags.cs.{${search}},explanation.ilike.%${search}%`)
    }

    // Apply type filter
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    // Apply level filter
    if (level && level !== 'all') {
      query = query.eq('level', level)
    }

    // Apply difficulty filter
    if (difficulty && difficulty !== 'all') {
      let difficultyRange: [number, number]
      switch (difficulty) {
        case 'easy':
          difficultyRange = [0, 0.3]
          break
        case 'medium':
          difficultyRange = [0.3, 0.6]
          break
        case 'hard':
          difficultyRange = [0.6, 1.0]
          break
        default:
          difficultyRange = [0, 1.0]
      }
      query = query.gte('difficulty_score', difficultyRange[0]).lte('difficulty_score', difficultyRange[1])
    }

    // Apply tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean)
      if (tagArray.length > 0) {
        query = query.overlaps('tags', tagArray)
      }
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: items, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch items' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { message: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = CreateItemSchema.parse(body)

    // Create new item
    const { data: item, error } = await supabase
      .from('items')
      .insert({
        ...data,
        owner_id: session.user.id,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to create item' },
        { status: 500 }
      )
    }

    return NextResponse.json(item, { status: 201 })

  } catch (error) {
    console.error('Error creating item:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create item' },
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
    const data = UpdateItemSchema.parse(updateData)

    if (!id) {
      return NextResponse.json({ message: 'Item ID is required' }, { status: 400 })
    }

    // Update item
    const { data: item, error } = await supabase
      .from('items')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('owner_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to update item' },
        { status: 500 }
      )
    }

    if (!item) {
      return NextResponse.json(
        { message: 'Item not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)

  } catch (error) {
    console.error('Error updating item:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to update item' },
      { status: 500 }
    )
  }
}