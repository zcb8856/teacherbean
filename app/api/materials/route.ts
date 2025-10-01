import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { z } from 'zod'

const createMaterialSchema = z.object({
  type: z.enum(['lesson_plan', 'ppt_outline', 'reading', 'dialog', 'game', 'template']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content_json: z.any(),
  tags: z.array(z.string()),
  shared: z.enum(['private', 'school', 'public']).default('private'),
  cefr_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  estimated_duration: z.number().min(1).max(300).optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createMaterialSchema.parse(body)

    // Get user profile for school information
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    // Insert material
    const { data: material, error } = await supabase
      .from('materials')
      .insert({
        ...validatedData,
        owner_id: user.id,
        school_id: profile?.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles!materials_owner_id_fkey (
          display_name,
          school_name
        )
      `)
      .single()

    if (error) {
      console.error('Error creating material:', error)
      return NextResponse.json(
        { message: 'Failed to create material', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Material created successfully',
      data: material
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating material:', error)
    return NextResponse.json(
      { message: 'Failed to create material' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const shared = searchParams.get('shared') || 'all'
    const cefr_level = searchParams.get('cefr_level') || 'all'
    const tags = searchParams.get('tags') || ''
    const owner = searchParams.get('owner') || ''
    const school = searchParams.get('school') || ''
    const exclude_own = searchParams.get('exclude_own') === 'true'
    const favorited_only = searchParams.get('favorited_only') === 'true'
    const my_resources = searchParams.get('my_resources') === 'true'

    // Get user profile for school filtering
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    // Build query
    let query = supabase
      .from('materials')
      .select(`
        *,
        profiles!materials_owner_id_fkey (
          display_name,
          school_name
        ),
        material_favorites!left (
          id,
          user_id
        )
      `, { count: 'exact' })

    // Apply filters based on context
    if (my_resources) {
      // My resources: only user's own materials
      query = query.eq('owner_id', user.id)
    } else if (shared === 'school' || exclude_own) {
      // Template center: school materials excluding own
      query = query
        .eq('shared', 'school')
        .eq('school_id', profile?.school_id || '')

      if (exclude_own) {
        query = query.neq('owner_id', user.id)
      }
    } else if (shared !== 'all') {
      query = query.eq('shared', shared)
    }

    // Apply search filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
    }

    if (type !== 'all') {
      query = query.eq('type', type)
    }

    if (cefr_level !== 'all') {
      query = query.eq('cefr_level', cefr_level)
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim())
      query = query.overlaps('tags', tagArray)
    }

    if (owner) {
      query = query.ilike('profiles.display_name', `%${owner}%`)
    }

    // Handle favorited filter
    if (favorited_only) {
      query = query.not('material_favorites', 'is', null)
        .eq('material_favorites.user_id', user.id)
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: materials, error, count } = await query

    if (error) {
      console.error('Error fetching materials:', error)
      return NextResponse.json(
        { message: 'Failed to fetch materials', error: error.message },
        { status: 500 }
      )
    }

    // Transform materials to include computed fields
    const transformedMaterials = materials?.map(material => ({
      ...material,
      is_favorited: material.material_favorites?.some(fav => fav.user_id === user.id) || false,
      owner_name: material.profiles?.display_name || 'Anonymous',
      school_name: material.profiles?.school_name || 'Unknown School'
    })) || []

    // Calculate stats
    const totalPages = Math.ceil((count || 0) / limit)

    // Get additional stats for my resources
    let stats = null
    if (my_resources) {
      const { data: statsData } = await supabase
        .from('materials')
        .select('type, shared')
        .eq('owner_id', user.id)

      if (statsData) {
        const materialsByType = statsData.reduce((acc, m) => {
          acc[m.type] = (acc[m.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const sharedMaterials = statsData.filter(m => m.shared === 'school').length

        stats = {
          total_materials: statsData.length,
          my_materials: statsData.length,
          shared_materials: sharedMaterials,
          materials_by_type: materialsByType
        }
      }
    }

    return NextResponse.json({
      data: transformedMaterials,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      },
      stats
    })

  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { message: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}