import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { z } from 'zod'

const generateDialogSchema = z.object({
  scenario: z.string().min(1, '场景不能为空'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  turnCount: z.number().min(4).max(20).default(8),
  participants: z.array(z.string()).min(2, '至少需要两个参与者')
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = generateDialogSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        error: '数据验证失败',
        details: validationResult.error.errors
      }, { status: 400 })
    }

    const { scenario, level, turnCount, participants } = validationResult.data

    // 生成对话（在实际应用中，这里会调用 OpenAI API）
    const dialog = generateMockDialog(scenario, level, turnCount, participants)

    return NextResponse.json({
      dialog,
      message: `成功生成${scenario}对话`
    })

  } catch (error) {
    console.error('Generate dialog error:', error)
    return NextResponse.json(
      { error: '生成对话失败' },
      { status: 500 }
    )
  }
}

function generateMockDialog(
  scenario: string,
  level: string,
  turnCount: number,
  participants: string[]
): any {

  const dialogTemplates = {
    '在餐厅点餐': {
      title: '餐厅点餐对话',
      turns: [
        {
          speaker: 'waiter',
          en: 'Good evening! Welcome to our restaurant. How many people?',
          zh: '晚上好！欢迎来到我们餐厅。几位？',
          note: '服务员的标准问候语',
          target_phrases: ['Good evening', 'Welcome to', 'How many people']
        },
        {
          speaker: 'customer',
          en: 'Good evening. Table for two, please.',
          zh: '晚上好。请给我们安排两人桌。',
          note: '礼貌地回应并说明人数',
          target_phrases: ['Table for two', 'please']
        },
        {
          speaker: 'waiter',
          en: 'Right this way. Here are your menus. Would you like something to drink?',
          zh: '请这边走。这是您的菜单。您想要点些饮料吗？',
          note: '引导客人入座并询问饮料',
          target_phrases: ['Right this way', 'Here are', 'Would you like']
        },
        {
          speaker: 'customer',
          en: 'Yes, could we have two glasses of water, please?',
          zh: '好的，我们可以要两杯水吗？',
          note: '使用could表示礼貌请求',
          target_phrases: ['could we have', 'glasses of water']
        },
        {
          speaker: 'waiter',
          en: 'Of course. Are you ready to order, or do you need a few more minutes?',
          zh: '当然可以。您准备好点餐了吗，还是需要再看几分钟？',
          note: '询问是否准备点餐',
          target_phrases: ['Of course', 'ready to order', 'a few more minutes']
        },
        {
          speaker: 'customer',
          en: 'We need a few more minutes to decide. Could you recommend something?',
          zh: '我们需要再想几分钟。您能推荐一些菜吗？',
          note: '请求推荐',
          target_phrases: ['need a few more minutes', 'Could you recommend']
        },
        {
          speaker: 'waiter',
          en: 'Our grilled salmon is very popular, and the pasta is excellent too.',
          zh: '我们的烤三文鱼很受欢迎，意大利面也很棒。',
          note: '推荐招牌菜',
          target_phrases: ['very popular', 'excellent too']
        },
        {
          speaker: 'customer',
          en: 'That sounds great! We\'ll have the grilled salmon and the pasta, please.',
          zh: '听起来很棒！我们要烤三文鱼和意大利面。',
          note: '确认点餐',
          target_phrases: ['That sounds great', 'We\'ll have']
        }
      ],
      vocabulary: [
        { word: 'restaurant', meaning: '餐厅', pronunciation: '/ˈrestrɒnt/' },
        { word: 'menu', meaning: '菜单', pronunciation: '/ˈmenjuː/' },
        { word: 'order', meaning: '点餐', pronunciation: '/ˈɔːdə/' },
        { word: 'recommend', meaning: '推荐', pronunciation: '/ˌrekəˈmend/' },
        { word: 'salmon', meaning: '三文鱼', pronunciation: '/ˈsæmən/' },
        { word: 'pasta', meaning: '意大利面', pronunciation: '/ˈpæstə/' },
        { word: 'grilled', meaning: '烤制的', pronunciation: '/ɡrɪld/' },
        { word: 'popular', meaning: '受欢迎的', pronunciation: '/ˈpɒpjələ/' }
      ],
      cultural_notes: [
        '在西方餐厅，服务员通常会主动询问饮料需求',
        '使用"Could you"比"Can you"更礼貌',
        '餐厅服务员经常会推荐招牌菜或受欢迎的菜品',
        '点餐时说"We\'ll have..."是常用表达'
      ]
    },
    '购物买衣服': {
      title: '服装店购物对话',
      turns: [
        {
          speaker: 'salesperson',
          en: 'Good afternoon! Can I help you find anything today?',
          zh: '下午好！我可以帮您找什么吗？',
          note: '销售员的标准问候',
          target_phrases: ['Good afternoon', 'Can I help you', 'find anything']
        },
        {
          speaker: 'customer',
          en: 'Hi! I\'m looking for a dress for a party.',
          zh: '您好！我在找一件聚会穿的裙子。',
          note: '明确购物目的',
          target_phrases: ['I\'m looking for', 'for a party']
        },
        {
          speaker: 'salesperson',
          en: 'What size are you, and what color would you prefer?',
          zh: '您穿什么尺码，喜欢什么颜色？',
          note: '询问具体需求',
          target_phrases: ['What size', 'what color', 'would you prefer']
        },
        {
          speaker: 'customer',
          en: 'I\'m a medium, and I\'d like something in blue or black.',
          zh: '我穿中号，我想要蓝色或黑色的。',
          note: '提供具体信息',
          target_phrases: ['I\'m a medium', 'I\'d like something', 'in blue or black']
        },
        {
          speaker: 'salesperson',
          en: 'Perfect! Let me show you some options. How about this navy blue one?',
          zh: '太好了！让我给您看一些选择。这件海军蓝的怎么样？',
          note: '展示商品',
          target_phrases: ['Let me show you', 'some options', 'How about this']
        },
        {
          speaker: 'customer',
          en: 'It\'s beautiful! Can I try it on?',
          zh: '很漂亮！我可以试穿吗？',
          note: '请求试穿',
          target_phrases: ['It\'s beautiful', 'Can I try it on']
        },
        {
          speaker: 'salesperson',
          en: 'Of course! The fitting room is right over there.',
          zh: '当然可以！试衣间就在那边。',
          note: '指导试衣间位置',
          target_phrases: ['Of course', 'fitting room', 'right over there']
        },
        {
          speaker: 'customer',
          en: 'Thank you! I\'ll take it if it fits well.',
          zh: '谢谢！如果合身的话我就买了。',
          note: '表达购买意向',
          target_phrases: ['I\'ll take it', 'if it fits well']
        }
      ],
      vocabulary: [
        { word: 'dress', meaning: '裙子', pronunciation: '/dres/' },
        { word: 'party', meaning: '聚会', pronunciation: '/ˈpɑːti/' },
        { word: 'size', meaning: '尺码', pronunciation: '/saɪz/' },
        { word: 'medium', meaning: '中号', pronunciation: '/ˈmiːdiəm/' },
        { word: 'navy blue', meaning: '海军蓝', pronunciation: '/ˈneɪvi bluː/' },
        { word: 'fitting room', meaning: '试衣间', pronunciation: '/ˈfɪtɪŋ ruːm/' },
        { word: 'beautiful', meaning: '美丽的', pronunciation: '/ˈbjuːtɪfl/' },
        { word: 'fits', meaning: '合身', pronunciation: '/fɪts/' }
      ],
      cultural_notes: [
        '欧美服装店的销售员通常很主动提供帮助',
        '试穿前先询问是购物礼貌',
        '尺码表达：small/medium/large 或 S/M/L',
        '"I\'ll take it" 是确认购买的常用表达'
      ]
    }
  }

  const template = dialogTemplates[scenario as keyof typeof dialogTemplates] || dialogTemplates['在餐厅点餐']

  // 根据轮数调整对话长度
  const adjustedTurns = template.turns.slice(0, Math.min(turnCount, template.turns.length))

  // 根据参与者调整说话人
  const adjustedDialogTurns = adjustedTurns.map((turn, index) => ({
    ...turn,
    speaker: participants[index % participants.length]
  }))

  return {
    title: template.title,
    scenario,
    level,
    participants,
    turns: adjustedDialogTurns,
    vocabulary: template.vocabulary,
    cultural_notes: template.cultural_notes,
    objectives: [
      `掌握${scenario}相关的核心词汇和表达`,
      `学习${scenario}场景下的常用句型`,
      '提高英语口语交际能力',
      '了解相关文化背景知识'
    ]
  }
}