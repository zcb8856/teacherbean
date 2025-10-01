// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { PaperConfig, AssembledPaper, Item, PaperSection, PaperItem } from '@/types/assess'

const AssembleRequestSchema = z.object({
  config: z.object({
    title: z.string().min(1),
    level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
    total_items: z.number().min(5).max(50),
    time_limit: z.number().min(15).max(180),
    instructions: z.string(),
    item_distribution: z.object({
      mcq: z.number().min(0),
      cloze: z.number().min(0),
      error_correction: z.number().min(0),
      matching: z.number().min(0),
      reading_q: z.number().min(0),
      writing_task: z.number().min(0)
    }),
    difficulty_distribution: z.object({
      easy: z.number().min(0).max(1),
      medium: z.number().min(0).max(1),
      hard: z.number().min(0).max(1)
    }),
    topics: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional()
  })
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
    const { config } = AssembleRequestSchema.parse(body)

    // Validate distribution totals
    const distributionSum = Object.values(config.item_distribution).reduce((sum, count) => sum + count, 0)
    if (distributionSum !== config.total_items) {
      return NextResponse.json(
        { message: '题型分布数量与总题数不匹配' },
        { status: 400 }
      )
    }

    const difficultySum = Object.values(config.difficulty_distribution).reduce((sum, val) => sum + val, 0)
    if (Math.abs(difficultySum - 1) > 0.01) {
      return NextResponse.json(
        { message: '难度分布百分比之和应为100%' },
        { status: 400 }
      )
    }

    // Assemble paper by selecting items
    const selectedItems = await assembleItems(supabase, session.user.id, config)

    if (selectedItems.length < config.total_items) {
      return NextResponse.json(
        { message: `题库中符合条件的题目不足，仅找到 ${selectedItems.length} 道，需要 ${config.total_items} 道` },
        { status: 400 }
      )
    }

    // Create paper structure
    const paper_json = createPaperStructure(config, selectedItems)

    // Generate printable HTML
    const printable_html = generatePrintableHTML(config, paper_json, selectedItems)

    // Generate answer key
    const answer_key = generateAnswerKey(selectedItems)

    // Create assembled paper object
    const assembledPaper: AssembledPaper = {
      id: `paper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      config,
      items: selectedItems,
      paper_json,
      printable_html,
      answer_key,
      created_at: new Date().toISOString()
    }

    return NextResponse.json(assembledPaper)

  } catch (error) {
    console.error('Error assembling paper:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to assemble paper' },
      { status: 500 }
    )
  }
}

async function assembleItems(supabase: any, userId: string, config: PaperConfig): Promise<Item[]> {
  const selectedItems: Item[] = []

  // For each item type, select the required number
  for (const [itemType, count] of Object.entries(config.item_distribution)) {
    if (count === 0) continue

    // Calculate difficulty distribution for this item type
    const easyCount = Math.round(count * config.difficulty_distribution.easy)
    const mediumCount = Math.round(count * config.difficulty_distribution.medium)
    const hardCount = count - easyCount - mediumCount

    // Select easy items
    if (easyCount > 0) {
      const items = await selectItemsByDifficulty(supabase, userId, itemType, config.level, 0, 0.3, easyCount, config.topics, config.tags)
      selectedItems.push(...items)
    }

    // Select medium items
    if (mediumCount > 0) {
      const items = await selectItemsByDifficulty(supabase, userId, itemType, config.level, 0.3, 0.6, mediumCount, config.topics, config.tags)
      selectedItems.push(...items)
    }

    // Select hard items
    if (hardCount > 0) {
      const items = await selectItemsByDifficulty(supabase, userId, itemType, config.level, 0.6, 1.0, hardCount, config.topics, config.tags)
      selectedItems.push(...items)
    }
  }

  return selectedItems
}

async function selectItemsByDifficulty(
  supabase: any,
  userId: string,
  itemType: string,
  level: string,
  minDifficulty: number,
  maxDifficulty: number,
  count: number,
  topics?: string[],
  tags?: string[]
): Promise<Item[]> {
  let query = supabase
    .from('items')
    .select('*')
    .eq('owner_id', userId)
    .eq('type', itemType)
    .eq('level', level)
    .gte('difficulty_score', minDifficulty)
    .lte('difficulty_score', maxDifficulty)
    .order('usage_count', { ascending: true }) // Prefer less used items
    .limit(count * 2) // Get more items to have selection options

  // Apply topic filter if specified
  if (topics && topics.length > 0) {
    query = query.overlaps('tags', topics)
  }

  // Apply tag filter if specified
  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  const { data: items, error } = await query

  if (error) {
    console.error('Error selecting items:', error)
    return []
  }

  // Randomly select from available items to avoid predictable patterns
  const shuffled = items.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function createPaperStructure(config: PaperConfig, items: Item[]): any {
  const sections: PaperSection[] = []
  let questionNumber = 1

  // Group items by type
  const itemsByType = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {} as Record<string, Item[]>)

  // Create sections for each item type
  const sectionTitles = {
    mcq: '选择题',
    cloze: '填空题',
    error_correction: '改错题',
    matching: '配对题',
    reading_q: '阅读理解',
    writing_task: '写作任务'
  }

  const sectionInstructions = {
    mcq: '从四个选项中选择一个最佳答案。',
    cloze: '根据文章内容，在空白处填入适当的词语。',
    error_correction: '找出句子中的错误并改正。',
    matching: '将左右两栏的内容进行匹配。',
    reading_q: '仔细阅读文章，然后回答问题。',
    writing_task: '根据要求完成写作任务。'
  }

  for (const [itemType, sectionItems] of Object.entries(itemsByType)) {
    if (sectionItems.length === 0) continue

    const paperItems: PaperItem[] = sectionItems.map((item) => ({
      id: item.id,
      question_number: questionNumber++,
      type: item.type,
      stem: item.stem,
      options: item.type === 'mcq' ? item.options_json as string[] : undefined,
      answer_space: item.type !== 'mcq',
      points: getItemPoints(item.type)
    }))

    sections.push({
      id: `section_${itemType}`,
      title: sectionTitles[itemType as keyof typeof sectionTitles],
      instructions: sectionInstructions[itemType as keyof typeof sectionInstructions],
      items: paperItems
    })
  }

  return {
    title: config.title,
    instructions: config.instructions,
    time_limit: config.time_limit,
    sections
  }
}

function getItemPoints(itemType: string): number {
  const pointMap = {
    mcq: 2,
    cloze: 2,
    error_correction: 3,
    matching: 2,
    reading_q: 4,
    writing_task: 15
  }
  return pointMap[itemType as keyof typeof pointMap] || 2
}

function generatePrintableHTML(config: PaperConfig, paperJson: any, items: Item[]): string {
  const totalPoints = paperJson.sections.reduce((sum: number, section: any) =>
    sum + section.items.reduce((sectionSum: number, item: any) => sectionSum + item.points, 0), 0
  )

  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        body { font-family: 'Microsoft YaHei', sans-serif; line-height: 1.6; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .info { margin: 10px 0; }
        .section { margin: 30px 0; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; background: #f5f5f5; padding: 10px; }
        .question { margin: 20px 0; }
        .question-number { font-weight: bold; margin-right: 10px; }
        .options { margin-left: 20px; margin-top: 10px; }
        .option { margin: 5px 0; }
        .answer-space { border-bottom: 1px solid #333; display: inline-block; min-width: 200px; margin: 0 5px; }
        .answer-sheet { page-break-before: always; }
        .answer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
        .answer-circle { width: 30px; height: 30px; border: 2px solid #333; border-radius: 50%; display: inline-block; text-align: center; line-height: 26px; margin: 2px; }
        @media print { .answer-sheet { page-break-before: always; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${config.title}</div>
        <div class="info">考试时间：${config.time_limit}分钟　　　总分：${totalPoints}分　　　级别：${config.level}</div>
        <div class="info">姓名：_____________　　　学号：_____________　　　班级：_____________</div>
        ${config.instructions ? `<div class="info">考试说明：${config.instructions}</div>` : ''}
    </div>
  `

  // Add sections
  paperJson.sections.forEach((section: any) => {
    html += `
    <div class="section">
        <div class="section-title">${section.title}（共${section.items.length}题，每题${section.items[0]?.points || 2}分）</div>
        ${section.instructions ? `<p style="margin-bottom: 15px; color: #666;"><strong>说明：</strong>${section.instructions}</p>` : ''}
    `

    section.items.forEach((item: any) => {
      html += `
        <div class="question">
            <span class="question-number">${item.question_number}.</span>
            ${item.stem}
      `

      if (item.options) {
        html += '<div class="options">'
        item.options.forEach((option: string, index: number) => {
          html += `<div class="option">${String.fromCharCode(65 + index)}. ${option}</div>`
        })
        html += '</div>'
      } else if (item.answer_space) {
        html += '<div style="margin-top: 15px;">答案：<span class="answer-space"></span></div>'
      }

      html += '</div>'
    })

    html += '</div>'
  })

  // Add answer sheet for MCQ questions
  const mcqSections = paperJson.sections.filter((s: any) => s.items.some((i: any) => i.options))
  if (mcqSections.length > 0) {
    html += `
    <div class="answer-sheet">
        <h2 style="text-align: center; margin-bottom: 30px;">答题卡</h2>
        <p style="text-align: center; margin-bottom: 20px;">请用2B铅笔填涂答题卡</p>
    `

    mcqSections.forEach((section: any) => {
      const mcqItems = section.items.filter((i: any) => i.options)
      if (mcqItems.length > 0) {
        html += `<h3>${section.title}</h3>`
        mcqItems.forEach((item: any) => {
          html += `
          <div style="margin: 15px 0;">
              <span style="display: inline-block; width: 40px; font-weight: bold;">${item.question_number}.</span>
              <span class="answer-circle">A</span>
              <span class="answer-circle">B</span>
              <span class="answer-circle">C</span>
              <span class="answer-circle">D</span>
          </div>
          `
        })
      }
    })

    html += '</div>'
  }

  html += '</body></html>'
  return html
}

function generateAnswerKey(items: Item[]): any[] {
  return items.map(item => ({
    item_id: item.id,
    question_type: item.type,
    correct_answer: item.answer_json,
    explanation: item.explanation
  }))
}