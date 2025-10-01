// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { z } from 'zod'

const updateClassSchema = z.object({
  name: z.string().min(1, '班级名称不能为空').max(100, '班级名称不能超过100字符').optional(),
  grade: z.string().optional(),
  description: z.string().max(500, '描述不能超过500字符').optional(),
})

// GET /api/classes/[id] - 获取单个班级详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { data: classData, error } = await supabase
      .from('classes')
      .select(`
        *,
        students(
          id,
          alias,
          student_number,
          created_at
        ),
        assignments(
          id,
          title,
          type,
          due_at,
          is_published,
          created_at
        )
      `)
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '班级未找到' }, { status: 404 })
      }
      console.error('获取班级详情失败:', error)
      return NextResponse.json({ error: '获取班级详情失败' }, { status: 500 })
    }

    return NextResponse.json({ class: classData })

  } catch (error) {
    console.error('获取班级详情API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// PUT /api/classes/[id] - 更新班级信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()

    // 验证请求数据
    const validationResult = updateClassSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        error: '数据验证失败',
        details: validationResult.error.errors
      }, { status: 400 })
    }

    const updateData = validationResult.data

    // 如果更新名称，检查是否重复
    if (updateData.name) {
      const { data: existingClass } = await supabase
        .from('classes')
        .select('id')
        .eq('owner_id', user.id)
        .eq('name', updateData.name)
        .neq('id', params.id)
        .single()

      if (existingClass) {
        return NextResponse.json({ error: '班级名称已存在' }, { status: 409 })
      }
    }

    // Construct update object with only defined values
    const finalUpdateData: Record<string, string> = {}
    if (updateData.name) finalUpdateData.name = updateData.name
    if (updateData.grade) finalUpdateData.grade = updateData.grade
    if (updateData.description) finalUpdateData.description = updateData.description

    // 更新班级
    const { data: updatedClass, error } = await supabase
      .from('classes')
      .update(finalUpdateData)
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '班级未找到' }, { status: 404 })
      }
      console.error('更新班级失败:', error)
      return NextResponse.json({ error: '更新班级失败' }, { status: 500 })
    }

    return NextResponse.json({
      message: '班级更新成功',
      class: updatedClass
    })

  } catch (error) {
    console.error('更新班级API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// DELETE /api/classes/[id] - 删除班级
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查班级是否存在学生或作业
    const { data: classData } = await supabase
      .from('classes')
      .select(`
        students(count),
        assignments(count)
      `)
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single()

    if (!classData) {
      return NextResponse.json({ error: '班级未找到' }, { status: 404 })
    }

    const hasStudents = classData.students?.[0]?.count > 0
    const hasAssignments = classData.assignments?.[0]?.count > 0

    if (hasStudents || hasAssignments) {
      return NextResponse.json({
        error: '无法删除包含学生或作业的班级',
        details: {
          students: hasStudents ? classData.students[0].count : 0,
          assignments: hasAssignments ? classData.assignments[0].count : 0
        }
      }, { status: 400 })
    }

    // 删除班级
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', params.id)
      .eq('owner_id', user.id)

    if (error) {
      console.error('删除班级失败:', error)
      return NextResponse.json({ error: '删除班级失败' }, { status: 500 })
    }

    return NextResponse.json({ message: '班级删除成功' })

  } catch (error) {
    console.error('删除班级API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}