import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { z } from 'zod'

const generateItemsSchema = z.object({
  type: z.enum(['spelling', 'matching', 'qa']),
  topic: z.string().min(1, '主题不能为空'),
  grammarPoints: z.array(z.string()),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  count: z.number().min(1).max(50).default(10)
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = generateItemsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        error: '数据验证失败',
        details: validationResult.error.errors
      }, { status: 400 })
    }

    const { type, topic, grammarPoints, level, count } = validationResult.data

    // 生成题目（在实际应用中，这里会调用 OpenAI API）
    const items = generateMockItems(type, topic, grammarPoints, level, count)

    return NextResponse.json({
      items,
      message: `成功生成 ${items.length} 道${getTypeName(type)}题目`
    })

  } catch (error) {
    console.error('Generate items error:', error)
    return NextResponse.json(
      { error: '生成题目失败' },
      { status: 500 }
    )
  }
}

function getTypeName(type: string): string {
  const names = {
    spelling: '拼写',
    matching: '匹配',
    qa: '选择'
  }
  return names[type as keyof typeof names] || type
}

function generateMockItems(
  type: string,
  topic: string,
  grammarPoints: string[],
  level: string,
  count: number
): any[] {
  const items = []

  for (let i = 0; i < count; i++) {
    const id = `${type}_${Date.now()}_${i}`

    if (type === 'spelling') {
      items.push(generateSpellingItem(id, topic, level, i))
    } else if (type === 'matching') {
      items.push(generateMatchingItem(id, topic, grammarPoints, level, i))
    } else if (type === 'qa') {
      items.push(generateQAItem(id, topic, level, i))
    }
  }

  return items
}

function generateSpellingItem(id: string, topic: string, level: string, index: number): any {
  const vocabularyData = {
    '日常生活': [
      { meaning: '房子，家', answer: 'house' },
      { meaning: '学校', answer: 'school' },
      { meaning: '书本', answer: 'book' },
      { meaning: '汽车', answer: 'car' },
      { meaning: '朋友', answer: 'friend' },
      { meaning: '家庭', answer: 'family' },
      { meaning: '工作', answer: 'work' },
      { meaning: '食物', answer: 'food' },
      { meaning: '水', answer: 'water' },
      { meaning: '时间', answer: 'time' }
    ],
    '学校生活': [
      { meaning: '老师', answer: 'teacher' },
      { meaning: '学生', answer: 'student' },
      { meaning: '教室', answer: 'classroom' },
      { meaning: '作业', answer: 'homework' },
      { meaning: '考试', answer: 'exam' },
      { meaning: '图书馆', answer: 'library' },
      { meaning: '科学', answer: 'science' },
      { meaning: '数学', answer: 'math' },
      { meaning: '历史', answer: 'history' },
      { meaning: '英语', answer: 'english' }
    ]
  }

  const words = vocabularyData[topic as keyof typeof vocabularyData] || vocabularyData['日常生活']
  const word = words[index % words.length]

  return {
    id,
    type: 'spelling',
    question: word.meaning,
    answer: word.answer,
    difficulty: level === 'A1' ? 0.3 : level === 'A2' ? 0.5 : 0.7
  }
}

function generateMatchingItem(id: string, topic: string, grammarPoints: string[], level: string, index: number): any {
  const matchingData = {
    sentences: [
      'I go to school every day.',
      'She is reading a book now.',
      'They played football yesterday.',
      'We will visit the museum tomorrow.',
      'He has finished his homework.',
      'Open the window, please.',
      'What a beautiful day!',
      'Are you coming to the party?'
    ],
    categories: [
      '一般现在时',
      '现在进行时',
      '一般过去时',
      '一般将来时',
      '现在完成时',
      '祈使句',
      '感叹句',
      '疑问句'
    ],
    correctMatches: [0, 1, 2, 3, 4, 5, 6, 7]
  }

  return {
    id,
    type: 'matching',
    question: JSON.stringify(matchingData),
    answer: matchingData.correctMatches.map(String),
    difficulty: level === 'A1' ? 0.4 : level === 'A2' ? 0.6 : 0.8
  }
}

function generateQAItem(id: string, topic: string, level: string, index: number): any {
  const questions = [
    {
      question: 'What color is the sun?',
      options: ['Blue', 'Yellow', 'Red', 'Green'],
      answer: 'Yellow',
      explanation: 'The sun appears yellow from Earth.'
    },
    {
      question: 'How many days are there in a week?',
      options: ['5', '6', '7', '8'],
      answer: '7',
      explanation: 'A week has seven days: Monday through Sunday.'
    },
    {
      question: 'What do you use to write?',
      options: ['Fork', 'Pen', 'Spoon', 'Knife'],
      answer: 'Pen',
      explanation: 'A pen is used for writing.'
    },
    {
      question: 'Where do you sleep?',
      options: ['Kitchen', 'Bathroom', 'Bedroom', 'Living room'],
      answer: 'Bedroom',
      explanation: 'People typically sleep in the bedroom.'
    },
    {
      question: 'What season comes after winter?',
      options: ['Summer', 'Fall', 'Spring', 'Autumn'],
      answer: 'Spring',
      explanation: 'Spring follows winter in the seasonal cycle.'
    },
    {
      question: 'Which animal says "moo"?',
      options: ['Dog', 'Cat', 'Cow', 'Bird'],
      answer: 'Cow',
      explanation: 'Cows make the "moo" sound.'
    },
    {
      question: 'What do you wear on your feet?',
      options: ['Hat', 'Gloves', 'Shoes', 'Scarf'],
      answer: 'Shoes',
      explanation: 'Shoes are worn on feet for protection and comfort.'
    },
    {
      question: 'When do you eat breakfast?',
      options: ['Evening', 'Night', 'Afternoon', 'Morning'],
      answer: 'Morning',
      explanation: 'Breakfast is typically eaten in the morning.'
    }
  ]

  const question = questions[index % questions.length]

  return {
    id,
    type: 'qa',
    question: question.question,
    options: question.options,
    answer: question.answer,
    explanation: question.explanation,
    difficulty: level === 'A1' ? 0.3 : level === 'A2' ? 0.5 : 0.7
  }
}