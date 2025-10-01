import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const ExportRequestSchema = z.object({
  type: z.enum(['analytics', 'submissions', 'items']),
  format: z.enum(['csv', 'pdf']),
  filters: z.object({
    class_id: z.string().optional(),
    student_id: z.string().optional(),
    date_range: z.object({
      start: z.string(),
      end: z.string()
    }).optional(),
    assignment_id: z.string().optional()
  }).optional()
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
    const { type, format, filters } = ExportRequestSchema.parse(body)

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'analytics':
        data = await exportAnalytics(supabase, session.user.id, filters)
        filename = `analytics_${new Date().toISOString().split('T')[0]}`
        break
      case 'submissions':
        data = await exportSubmissions(supabase, session.user.id, filters)
        filename = `submissions_${new Date().toISOString().split('T')[0]}`
        break
      case 'items':
        data = await exportItems(supabase, session.user.id, filters)
        filename = `items_${new Date().toISOString().split('T')[0]}`
        break
    }

    if (format === 'csv') {
      const csvContent = convertToCSV(data)
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })
    } else if (format === 'pdf') {
      // For PDF generation, we would use a library like jsPDF or puppeteer
      // For now, return a simple PDF-like content
      const pdfContent = await generatePDF(data, type)
      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`
        }
      })
    }

    return NextResponse.json({ message: 'Unsupported format' }, { status: 400 })

  } catch (error) {
    console.error('Error exporting data:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to export data' },
      { status: 500 }
    )
  }
}

async function exportAnalytics(supabase: any, userId: string, filters?: any) {
  // Fetch analytics data for export
  let query = supabase
    .from('submissions')
    .select(`
      *,
      assignments!inner(
        title,
        class_id,
        classes!inner(name, owner_id)
      ),
      students(alias)
    `)
    .eq('assignments.classes.owner_id', userId)

  if (filters?.class_id) {
    query = query.eq('assignments.class_id', filters.class_id)
  }

  if (filters?.date_range) {
    query = query
      .gte('submitted_at', filters.date_range.start)
      .lte('submitted_at', filters.date_range.end)
  }

  const { data: submissions, error } = await query

  if (error) throw error

  // Transform data for export
  return submissions.map(sub => ({
    '学生姓名': sub.student_name || sub.students?.alias || 'Unknown',
    '班级': sub.assignments.classes.name,
    '测试名称': sub.assignments.title,
    '分数': sub.total_score || 0,
    '满分': sub.score_json?.max_score || 100,
    '百分比': sub.score_json?.percentage || 0,
    '提交时间': new Date(sub.submitted_at).toLocaleString('zh-CN'),
    '是否迟交': sub.is_late ? '是' : '否'
  }))
}

async function exportSubmissions(supabase: any, userId: string, filters?: any) {
  let query = supabase
    .from('submissions')
    .select(`
      *,
      assignments!inner(
        title,
        class_id,
        classes!inner(name, owner_id)
      ),
      students(alias)
    `)
    .eq('assignments.classes.owner_id', userId)

  if (filters?.assignment_id) {
    query = query.eq('assignment_id', filters.assignment_id)
  }

  if (filters?.class_id) {
    query = query.eq('assignments.class_id', filters.class_id)
  }

  if (filters?.student_id) {
    query = query.eq('student_id', filters.student_id)
  }

  const { data: submissions, error } = await query.order('submitted_at', { ascending: false })

  if (error) throw error

  return submissions.map(sub => ({
    '提交ID': sub.id,
    '学生姓名': sub.student_name || sub.students?.alias || 'Unknown',
    '班级': sub.assignments.classes.name,
    '测试名称': sub.assignments.title,
    '总分': sub.total_score || 0,
    '满分': sub.score_json?.max_score || 100,
    '正确率': `${sub.score_json?.percentage || 0}%`,
    '提交时间': new Date(sub.submitted_at).toLocaleString('zh-CN'),
    '批改时间': sub.graded_at ? new Date(sub.graded_at).toLocaleString('zh-CN') : '未批改',
    '是否迟交': sub.is_late ? '是' : '否',
    '总体反馈': sub.feedback_json?.overall_feedback || ''
  }))
}

async function exportItems(supabase: any, userId: string, filters?: any) {
  let query = supabase
    .from('items')
    .select('*')
    .eq('owner_id', userId)

  const { data: items, error } = await query.order('created_at', { ascending: false })

  if (error) throw error

  return items.map(item => ({
    '题目ID': item.id,
    '题型': getItemTypeName(item.type),
    '级别': item.level,
    '题目内容': item.stem,
    '难度分数': item.difficulty_score,
    '使用次数': item.usage_count,
    '正确率': item.correct_rate ? `${(item.correct_rate * 100).toFixed(1)}%` : '暂无数据',
    '标签': item.tags ? item.tags.join(', ') : '',
    '来源': item.source || '',
    '创建时间': new Date(item.created_at).toLocaleString('zh-CN')
  }))
}

function getItemTypeName(type: string): string {
  const typeMap = {
    mcq: '选择题',
    cloze: '填空题',
    error_correction: '改错题',
    matching: '配对题',
    reading_q: '阅读理解',
    writing_task: '写作任务'
  }
  return typeMap[type as keyof typeof typeMap] || type
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ]

  // Add BOM for Excel compatibility with Chinese characters
  return '\ufeff' + csvRows.join('\n')
}

async function generatePDF(data: any[], type: string): Promise<Buffer> {
  // This is a simplified PDF generation
  // In a real implementation, you would use libraries like:
  // - jsPDF for client-side generation
  // - Puppeteer for server-side HTML to PDF conversion
  // - PDFKit for programmatic PDF creation

  const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
72 720 Td
(${type} Export Data) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000125 00000 n
0000000221 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
290
%%EOF
`

  return Buffer.from(pdfContent)
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
    const type = searchParams.get('type')

    // Return available export options
    const exportOptions = {
      analytics: {
        name: '学情分析数据',
        description: '包含学生表现、班级统计、错题分析等数据',
        formats: ['csv', 'pdf']
      },
      submissions: {
        name: '提交记录',
        description: '包含所有学生的测试提交记录和成绩',
        formats: ['csv', 'pdf']
      },
      items: {
        name: '题库数据',
        description: '包含所有题目的详细信息和统计数据',
        formats: ['csv', 'pdf']
      }
    }

    if (type && exportOptions[type as keyof typeof exportOptions]) {
      return NextResponse.json(exportOptions[type as keyof typeof exportOptions])
    }

    return NextResponse.json(exportOptions)

  } catch (error) {
    console.error('Error getting export options:', error)
    return NextResponse.json(
      { message: 'Failed to get export options' },
      { status: 500 }
    )
  }
}