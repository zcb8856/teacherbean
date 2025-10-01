// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { WritingTask, WritingTaskForm } from '@/types/writing'

const TaskFormSchema = z.object({
  genre: z.enum(['记叙文', '应用文', '议论文']),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  topic: z.string().min(1, 'Topic is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  word_count_min: z.number().min(20).max(500),
  word_count_max: z.number().min(30).max(1000),
  target_vocabulary: z.string().optional(),
  target_structures: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const formData = TaskFormSchema.parse(body)

    // Validate word count range
    if (formData.word_count_min >= formData.word_count_max) {
      return NextResponse.json(
        { message: '最小字数应小于最大字数' },
        { status: 400 }
      )
    }

    // Generate task ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Parse vocabulary and structures
    const target_vocabulary = formData.target_vocabulary
      ? formData.target_vocabulary.split(',').map(item => item.trim()).filter(item => item.length > 0)
      : []

    const target_structures = formData.target_structures
      ? formData.target_structures.split(',').map(item => item.trim()).filter(item => item.length > 0)
      : []

    // Generate key points based on genre and level
    const key_points = generateKeyPoints(formData.genre, formData.level, formData.topic)

    // Create enhanced prompt
    const enhanced_prompt = generateEnhancedPrompt(formData)

    const task: WritingTask = {
      id: taskId,
      title: formData.topic,
      genre: formData.genre,
      level: formData.level,
      prompt: enhanced_prompt,
      key_points,
      target_vocabulary,
      target_structures,
      word_count: {
        min: formData.word_count_min,
        max: formData.word_count_max
      },
      created_at: new Date().toISOString()
    }

    return NextResponse.json(task)

  } catch (error) {
    console.error('Error generating writing task:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to generate writing task' },
      { status: 500 }
    )
  }
}

function generateKeyPoints(genre: string, level: string, topic: string): string[] {
  const pointsMap = {
    '记叙文': {
      'A1': ['描述时间和地点', '介绍主要人物', '说明发生了什么事'],
      'A2': ['设置场景背景', '描述事件经过', '表达个人感受', '总结事件意义'],
      'B1': ['设定详细背景', '发展情节冲突', '描写人物性格', '反思个人成长'],
      'B2': ['构建复杂情节', '深入人物刻画', '运用对话描写', '升华主题思想'],
      'C1': ['多线索叙事结构', '心理活动描写', '环境烘托情感', '象征手法运用'],
      'C2': ['非线性叙事技巧', '意识流描写', '深层主题探讨', '文学手法综合运用']
    },
    '应用文': {
      'A1': ['明确写信目的', '使用基本格式', '简单表达请求'],
      'A2': ['遵循标准格式', '清晰表达目的', '使用礼貌用语', '适当的结尾'],
      'B1': ['采用正式语调', '逻辑清晰表达', '提供必要细节', '考虑读者需求'],
      'B2': ['运用说服技巧', '结构化论述', '专业术语使用', '恰当的语言风格'],
      'C1': ['高级修辞技巧', '复杂句式结构', '文化背景考量', '精准词汇选择'],
      'C2': ['语言艺术性', '深层沟通策略', '跨文化交际', '完美语言掌控']
    },
    '议论文': {
      'A1': ['提出简单观点', '给出基本理由', '简单举例说明'],
      'A2': ['明确论点表达', '提供支持理由', '使用具体例子', '得出简单结论'],
      'B1': ['清晰论证结构', '多角度分析', '对比不同观点', '逻辑性结论'],
      'B2': ['深入问题分析', '证据充分支撑', '反驳对立观点', '综合性评价'],
      'C1': ['复杂论证技巧', '批判性思维', '多元化论据', '哲学性思辨'],
      'C2': ['高度抽象思维', '原创性见解', '跨学科论证', '思想深度体现']
    }
  }

  const levelPoints = pointsMap[genre as keyof typeof pointsMap]?.[level as keyof typeof levelPoints] || []
  return levelPoints.slice(0, 4) // Return first 4 points
}

function generateEnhancedPrompt(formData: WritingTaskForm): string {
  const basePrompt = formData.requirements

  // Add genre-specific guidance
  const genreGuidance = {
    '记叙文': '请用第一人称或第三人称叙述，注意时间顺序和情节发展。',
    '应用文': '请注意格式规范，语言得体，目的明确。',
    '议论文': '请提出明确观点，提供有力论据，逻辑清晰。'
  }

  // Add level-specific requirements
  const levelRequirements = {
    'A1': '使用简单句式，词汇基础，表达清晰。',
    'A2': '适当使用复合句，词汇丰富度提升，表达较为流畅。',
    'B1': '运用多种句式，词汇使用准确，逻辑性强。',
    'B2': '语言表达地道，句式多样化，论述深入。',
    'C1': '语言精练优美，修辞手法丰富，思想深刻。',
    'C2': '语言艺术性强，表达力卓越，创新性思维。'
  }

  return `${basePrompt}\n\n写作指导：${genreGuidance[formData.genre]}\n语言要求：${levelRequirements[formData.level]}`
}