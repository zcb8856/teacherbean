// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { z } from 'zod'
import {
  withErrorHandler,
  AuthenticationError,
  ConflictError,
  handleZodError,
  handleSupabaseError,
  Logger
} from '@/lib/error-handler'
import { lenientRateLimit, moderateRateLimit } from '@/lib/rate-limiter'

// 验证模式
const createClassSchema = z.object({
  name: z.string().min(1, '班级名称不能为空').max(100, '班级名称不能超过100字符'),
  grade: z.string().optional(),
  description: z.string().max(500, '描述不能超过500字符').optional(),
})

const updateClassSchema = z.object({
  name: z.string().min(1, '班级名称不能为空').max(100, '班级名称不能超过100字符').optional(),
  grade: z.string().optional(),
  description: z.string().max(500, '描述不能超过500字符').optional(),
})

// GET /api/classes - 获取班级列表
export const GET = withErrorHandler(async (request: NextRequest) => {
  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    throw handleSupabaseError(authError)
  }

  if (!user) {
    throw new AuthenticationError()
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const search = searchParams.get('search') || ''
  const offset = (page - 1) * limit

  Logger.info('获取班级列表', {
    userId: user.id,
    page,
    limit,
    search: search || undefined
  })

  // 构建查询
  let query = supabase
    .from('classes')
    .select(`
      *,
      students(count),
      assignments(count)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // 搜索功能
  if (search) {
    query = query.or(`name.ilike.%${search}%,grade.ilike.%${search}%`)
  }

  // 分页
  const { data: classes, error, count } = await query
    .range(offset, offset + limit - 1)

  if (error) {
    throw handleSupabaseError(error)
  }

  // 处理计数数据
  const processedClasses = classes?.map((cls: any) => ({
    ...cls,
    student_count: cls.students?.[0]?.count || 0,
    assignment_count: cls.assignments?.[0]?.count || 0,
  })) || []

  return NextResponse.json({
    classes: processedClasses,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
})

// POST /api/classes - 创建新班级
export const POST = withErrorHandler(async (request: NextRequest) => {
  const supabase = createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    throw handleSupabaseError(authError)
  }

  if (!user) {
    throw new AuthenticationError()
  }

  const body = await request.json()

  // 验证请求数据
  const validationResult = createClassSchema.safeParse(body)
  if (!validationResult.success) {
    throw handleZodError(validationResult.error)
  }

  const { name, grade, description } = validationResult.data

  Logger.info('创建班级', {
    userId: user.id,
    className: name,
    grade: grade || undefined
  })

  // 检查班级名称是否重复
  const { data: existingClass, error: checkError } = await supabase
    .from('classes')
    .select('id')
    .eq('owner_id', user.id)
    .eq('name', name)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    throw handleSupabaseError(checkError)
  }

  if (existingClass) {
    throw new ConflictError('班级名称已存在')
  }

  // 创建班级
  const { data: newClass, error } = await supabase
    .from('classes')
    .insert({
      name,
      grade,
      description,
      owner_id: user.id
    })
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  Logger.info('班级创建成功', {
    userId: user.id,
    classId: newClass.id,
    className: name
  })

  return NextResponse.json({
    message: '班级创建成功',
    class: newClass
  }, { status: 201 })
})