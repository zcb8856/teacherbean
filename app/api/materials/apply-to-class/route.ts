import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { z } from 'zod'

const applyToClassSchema = z.object({
  material_id: z.string().uuid(),
  class_id: z.string().uuid(),
  assignment_title: z.string().min(1).optional(),
  due_date: z.string().datetime().optional(),
  instructions: z.string().optional(),
  customizations: z.record(z.any()).optional()
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
    const validatedData = applyToClassSchema.parse(body)

    // Check if material exists and user has access
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('id, title, type, content_json, owner_id, shared, school_id')
      .eq('id', validatedData.material_id)
      .single()

    if (materialError || !material) {
      return NextResponse.json(
        { message: 'Material not found' },
        { status: 404 }
      )
    }

    // Get user profile for permission check
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    // Check if user can access this material
    const canAccess = material.owner_id === user.id ||
      material.shared === 'public' ||
      (material.shared === 'school' && material.school_id === profile?.school_id)

    if (!canAccess) {
      return NextResponse.json(
        { message: 'Access denied to material' },
        { status: 403 }
      )
    }

    // Check if class exists and user owns it
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name, owner_id')
      .eq('id', validatedData.class_id)
      .eq('owner_id', user.id)
      .single()

    if (classError || !classData) {
      return NextResponse.json(
        { message: 'Class not found or access denied' },
        { status: 404 }
      )
    }

    // Create assignment based on material
    const assignmentTitle = validatedData.assignment_title ||
      `${material.title} - 作业`

    // Prepare assignment payload based on material type
    let assignmentPayload: any = {
      material_source: {
        id: material.id,
        title: material.title,
        type: material.type
      },
      content: material.content_json,
      ...validatedData.customizations
    }

    // Different assignment types based on material type
    let assignmentType = 'homework'
    switch (material.type) {
      case 'lesson_plan':
        assignmentType = 'lesson'
        break
      case 'reading':
        assignmentType = 'reading'
        break
      case 'dialog':
        assignmentType = 'speaking'
        break
      case 'game':
        assignmentType = 'activity'
        break
      default:
        assignmentType = 'homework'
    }

    // Create the assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        class_id: validatedData.class_id,
        title: assignmentTitle,
        description: validatedData.instructions ||
          `基于模板"${material.title}"生成的作业`,
        type: assignmentType,
        payload_json: assignmentPayload,
        max_score: 100,
        due_date: validatedData.due_date || null,
        is_published: false, // Start as draft
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, title, type')
      .single()

    if (assignmentError) {
      console.error('Error creating assignment:', assignmentError)
      return NextResponse.json(
        { message: 'Failed to create assignment', error: assignmentError.message },
        { status: 500 }
      )
    }

    // Update material download count
    await supabase.rpc('increment_material_download_count', {
      material_id: validatedData.material_id
    })

    return NextResponse.json({
      message: 'Material applied to class successfully',
      assignment_id: assignment.id,
      assignment_title: assignment.title,
      assignment_type: assignment.type,
      class_name: classData.name
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error applying material to class:', error)
    return NextResponse.json(
      { message: 'Failed to apply material to class' },
      { status: 500 }
    )
  }
}