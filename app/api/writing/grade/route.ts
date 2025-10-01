// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { GradingResult, WritingRubric, SentenceSuggestion, WritingTask } from '@/types/writing'

const GradingRequestSchema = z.object({
  task_id: z.string(),
  student_text: z.string().min(10, 'Text too short'),
  student_name: z.string().optional(),
  task: z.object({
    id: z.string(),
    title: z.string(),
    genre: z.enum(['记叙文', '应用文', '议论文']),
    level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
    prompt: z.string(),
    target_vocabulary: z.array(z.string()),
    target_structures: z.array(z.string()),
    word_count: z.object({
      min: z.number(),
      max: z.number()
    })
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = GradingRequestSchema.parse(body)

    // Analyze text basic metrics
    const wordCount = data.student_text.trim().split(/\s+/).filter(word => word.length > 0).length
    const sentences = data.student_text.split(/[.!?]+/).filter(s => s.trim().length > 0)

    // Generate rubric scores based on analysis
    const rubric = generateRubric(data.student_text, data.task, wordCount)

    // Generate sentence suggestions
    const sentence_suggestions = generateSentenceSuggestions(data.student_text, data.task)

    // Generate improved version
    const improved_version = generateImprovedVersion(data.student_text, data.task)

    // Generate teacher brief
    const teacher_brief = generateTeacherBrief(rubric, data.task, wordCount)

    const result: GradingResult = {
      rubric,
      sentence_suggestions,
      improved_version,
      teacher_brief
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error grading writing:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to grade writing' },
      { status: 500 }
    )
  }
}

function generateRubric(text: string, task: WritingTask, wordCount: number): WritingRubric {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.trim().split(/\s+/).filter(word => word.length > 0)

  // Basic analysis metrics
  const avgWordsPerSentence = words.length / sentences.length
  const wordCountScore = getWordCountScore(wordCount, task.word_count)
  const vocabularyScore = getVocabularyScore(text, task.target_vocabulary)
  const structureScore = getStructureScore(text, task.target_structures)

  // Generate scores based on analysis (simplified AI simulation)
  const task_response = Math.min(5, Math.max(1,
    Math.round(wordCountScore * 2.5 + (text.length > 200 ? 1 : 0))
  ))

  const accuracy = Math.min(5, Math.max(1,
    Math.round(3 + Math.random() * 2 - (sentences.length < 5 ? 1 : 0))
  ))

  const lexical_range = Math.min(5, Math.max(1,
    Math.round(vocabularyScore * 3 + Math.random() * 2)
  ))

  const cohesion = Math.min(5, Math.max(1,
    Math.round(structureScore * 2.5 + (avgWordsPerSentence > 8 ? 1 : 0) + Math.random())
  ))

  const organization = Math.min(5, Math.max(1,
    Math.round(3 + (sentences.length >= 5 ? 1 : 0) + Math.random())
  ))

  // Calculate overall score (0-100)
  const overall = Math.round(
    (task_response * 20) + (accuracy * 20) + (lexical_range * 15) +
    (cohesion * 20) + (organization * 25)
  )

  const summary = generateRubricSummary(task_response, accuracy, lexical_range, cohesion, organization, task)

  return {
    task_response,
    accuracy,
    lexical_range,
    cohesion,
    organization,
    overall,
    summary
  }
}

function getWordCountScore(wordCount: number, requirement: { min: number; max: number }): number {
  if (wordCount >= requirement.min && wordCount <= requirement.max) return 2
  if (wordCount >= requirement.min * 0.8 && wordCount <= requirement.max * 1.2) return 1.5
  return 1
}

function getVocabularyScore(text: string, targetVocab: string[]): number {
  if (targetVocab.length === 0) return 1.5

  const textLower = text.toLowerCase()
  const usedCount = targetVocab.filter(word => textLower.includes(word.toLowerCase())).length
  return Math.min(2, usedCount / targetVocab.length * 2)
}

function getStructureScore(text: string, targetStructures: string[]): number {
  if (targetStructures.length === 0) return 1.5

  const textLower = text.toLowerCase()
  const usedCount = targetStructures.filter(structure =>
    textLower.includes(structure.toLowerCase().replace(/\.\.\./g, ''))
  ).length

  return Math.min(2, usedCount / targetStructures.length * 2)
}

function generateSentenceSuggestions(text: string, task: WritingTask): SentenceSuggestion[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const suggestions: SentenceSuggestion[] = []

  // Generate 2-4 sample suggestions
  const sampleSuggestions = [
    {
      idx: 1,
      before: sentences[0] || "I am very happy.",
      after: "I feel extremely delighted and excited.",
      reason: "使用更丰富的形容词来增强表达效果"
    },
    {
      idx: Math.min(2, sentences.length),
      before: sentences[1] || "This is good.",
      after: "This experience has been remarkably beneficial.",
      reason: "采用更正式和具体的表达方式"
    }
  ]

  // Add suggestions based on task level
  const suggestionCount = task.level >= 'B1' ? 3 : 2
  return sampleSuggestions.slice(0, suggestionCount)
}

function generateImprovedVersion(text: string, task: WritingTask): string {
  // This would normally call an AI service
  // For demo purposes, we'll generate a sample improved version

  const improvements = {
    'A1': "My name is Tom. I live in Beijing. I like reading books and playing basketball. Last weekend, I went to the park with my friends. We had a wonderful time together. The weather was very nice and sunny. We played games and ate delicious food. I hope to go there again soon.",
    'A2': "Hello everyone! I would like to tell you about my favorite hobby - reading. Reading has been an important part of my life since I was young. I enjoy reading different types of books, especially novels and science fiction. When I read, I can learn new things and explore different worlds. Reading also helps me improve my language skills and expand my vocabulary.",
    'B1': "The importance of environmental protection cannot be overstated in today's world. As our planet faces numerous challenges such as climate change, pollution, and resource depletion, it becomes crucial for individuals and governments to take immediate action. We must adopt sustainable practices in our daily lives, including reducing waste, using renewable energy, and supporting eco-friendly products. Only through collective effort can we preserve our environment for future generations."
  }

  return improvements[task.level as keyof typeof improvements] || text
}

function generateTeacherBrief(rubric: WritingRubric, task: WritingTask, wordCount: number): string {
  const strengthAreas = []
  const improvementAreas = []

  // Analyze strengths and weaknesses
  if (rubric.task_response >= 4) strengthAreas.push("任务完成度高")
  else improvementAreas.push("需要更好地完成写作任务要求")

  if (rubric.accuracy >= 4) strengthAreas.push("语言表达准确")
  else improvementAreas.push("需要提高语法准确性")

  if (rubric.lexical_range >= 4) strengthAreas.push("词汇运用丰富")
  else improvementAreas.push("可以尝试使用更多样的词汇")

  if (rubric.cohesion >= 4) strengthAreas.push("语言连贯流畅")
  else improvementAreas.push("需要加强句子间的逻辑连接")

  if (rubric.organization >= 4) strengthAreas.push("文章结构清晰")
  else improvementAreas.push("可以改善文章的整体结构")

  let brief = `这篇${task.genre}整体表现${rubric.overall >= 80 ? '优秀' : rubric.overall >= 70 ? '良好' : '需要改进'}。`

  if (strengthAreas.length > 0) {
    brief += `\n\n优点：${strengthAreas.join('，')}。`
  }

  if (improvementAreas.length > 0) {
    brief += `\n\n改进建议：${improvementAreas.join('；')}。`
  }

  brief += `\n\n具体建议：建议多阅读优秀范文，关注句型结构的多样性，逐步提高写作水平。继续保持练习，相信会有更大进步！`

  return brief
}

function generateRubricSummary(task: number, accuracy: number, lexical: number, cohesion: number, org: number, writingTask: WritingTask): string {
  const weakest = Math.min(task, accuracy, lexical, cohesion, org)

  if (weakest === task) return "重点关注任务完成度，确保回应所有写作要求"
  if (weakest === accuracy) return "加强语法练习，提高语言表达的准确性"
  if (weakest === lexical) return "丰富词汇使用，避免重复表达"
  if (weakest === cohesion) return "注意句子间的逻辑连接，使用适当的连接词"
  if (weakest === org) return "改善文章结构，使段落安排更加合理"

  return "整体表现良好，继续保持并精益求精"
}