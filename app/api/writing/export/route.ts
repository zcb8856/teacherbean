import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { WritingTask, GradingResult } from '@/types/writing'

const ExportRequestSchema = z.object({
  task: z.object({
    id: z.string(),
    title: z.string(),
    genre: z.enum(['记叙文', '应用文', '议论文']),
    level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
    prompt: z.string(),
    key_points: z.array(z.string()),
    target_vocabulary: z.array(z.string()),
    target_structures: z.array(z.string()),
    word_count: z.object({
      min: z.number(),
      max: z.number()
    }),
    created_at: z.string()
  }),
  grading_result: z.object({
    rubric: z.object({
      task_response: z.number(),
      accuracy: z.number(),
      lexical_range: z.number(),
      cohesion: z.number(),
      organization: z.number(),
      overall: z.number(),
      summary: z.string()
    }),
    sentence_suggestions: z.array(z.object({
      idx: z.number(),
      before: z.string(),
      after: z.string(),
      reason: z.string()
    })),
    improved_version: z.string(),
    teacher_brief: z.string()
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, grading_result } = ExportRequestSchema.parse(body)

    // Generate Word document content (simplified HTML format)
    const docContent = generateDocxContent(task, grading_result)

    // For now, we'll return a simple text file with .docx extension
    // In a real implementation, you would use a library like docx or officegen
    const buffer = Buffer.from(docContent, 'utf-8')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(task.title)}_讲评稿.docx"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error exporting document:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to export document' },
      { status: 500 }
    )
  }
}

function generateDocxContent(task: WritingTask, result: GradingResult): string {
  const { rubric, sentence_suggestions, improved_version, teacher_brief } = result

  // Generate formatted document content
  const content = `
写作任务讲评稿
================

任务信息
--------
写作主题：${task.title}
文体类型：${task.genre}
难度级别：${task.level}
字数要求：${task.word_count.min}-${task.word_count.max} 词
生成时间：${new Date(task.created_at).toLocaleString('zh-CN')}

写作要求：
${task.prompt}

评分标准
--------
总分：${rubric.overall}/100

详细评分：
- 任务完成度：${rubric.task_response}/5
- 语言准确性：${rubric.accuracy}/5
- 词汇丰富度：${rubric.lexical_range}/5
- 语言连贯性：${rubric.cohesion}/5
- 文章结构：${rubric.organization}/5

评分摘要：
${rubric.summary}

修改建议
--------
${sentence_suggestions.map((suggestion, index) => `
${index + 1}. 第 ${suggestion.idx} 句修改建议
   原句：${suggestion.before}
   建议：${suggestion.after}
   原因：${suggestion.reason}
`).join('\n')}

改进版本参考
----------
${improved_version}

注：此为AI生成的改进版本，仅供参考。鼓励学生保持自己的写作风格。

教师简评
--------
${teacher_brief}

学习建议
--------
1. 根据以上修改建议，重点关注薄弱环节
2. 多阅读优秀范文，学习表达方式
3. 注意语法准确性和词汇多样性
4. 加强逻辑连接，提高文章整体连贯性
5. 持续练习，循序渐进提高写作水平

生成说明
--------
本讲评稿由 TeacherBean AI 智能批改系统生成
生成时间：${new Date().toLocaleString('zh-CN')}
系统版本：v1.0.0

© TeacherBean 智能教学平台
`

  return content.trim()
}

// Alternative implementation using a proper Word document library
// This would require installing: npm install docx
/*
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

async function generateProperDocx(task: WritingTask, result: GradingResult): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "写作任务讲评稿",
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          text: "任务信息",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "写作主题：", bold: true }),
            new TextRun(task.title),
          ],
        }),
        // ... more content
      ],
    }],
  })

  return await Packer.toBuffer(doc)
}
*/