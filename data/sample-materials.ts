import type { Material } from '@/types/library'

export const sampleMaterials = [
  {
    type: 'lesson_plan',
    title: '英语时态综合复习',
    description: '针对中学生设计的时态复习课程，包含现在时、过去时、将来时的综合练习',
    content_json: {
      objectives: [
        '掌握英语基本时态的构成和用法',
        '能够在实际语境中正确使用不同时态',
        '提高时态判断和转换能力'
      ],
      materials_needed: [
        '时态表格',
        '练习题卡片',
        'PPT课件',
        '音频材料'
      ],
      warm_up: {
        duration: 10,
        activities: [
          '时态快速问答游戏',
          '观看英语短视频，识别时态'
        ]
      },
      main_activities: [
        {
          title: '时态规则梳理',
          duration: 20,
          description: '系统梳理各时态的构成规则和使用场景',
          instructions: [
            '展示时态对比表格',
            '举例说明各时态用法',
            '学生总结规律'
          ],
          materials: ['时态表格', 'PPT课件']
        },
        {
          title: '语境练习',
          duration: 25,
          description: '在真实语境中练习时态运用',
          instructions: [
            '分组讨论生活场景',
            '编写小对话使用不同时态',
            '角色扮演展示'
          ],
          materials: ['对话卡片', '情景图片']
        }
      ],
      wrap_up: {
        duration: 5,
        activities: [
          '总结本课重点',
          '布置课后练习'
        ]
      },
      homework: '完成时态练习册第三章',
      notes: '注意观察学生对过去完成时的理解程度'
    },
    tags: ['语法', '时态', '综合复习', '中学'],
    shared: 'school' as const,
    cefr_level: 'B1' as const,
    estimated_duration: 60
  },
  {
    type: 'ppt_outline',
    title: '旅游英语词汇PPT',
    description: '涵盖旅游场景常用词汇的PPT大纲，包含机场、酒店、餐厅等场景',
    content_json: {
      slides: [
        {
          slide_number: 1,
          title: '旅游英语词汇',
          content: [
            '课程目标',
            '主要场景介绍',
            '学习方法指导'
          ],
          notes: '介绍课程整体结构，激发学习兴趣'
        },
        {
          slide_number: 2,
          title: '机场场景词汇',
          content: [
            'check-in 办理登机',
            'boarding gate 登机口',
            'departure 出发',
            'arrival 到达',
            'baggage claim 行李提取'
          ],
          image_suggestions: ['机场场景图片', '登机牌示例'],
          notes: '结合图片讲解，增强记忆效果'
        },
        {
          slide_number: 3,
          title: '酒店场景词汇',
          content: [
            'reservation 预订',
            'front desk 前台',
            'room service 客房服务',
            'checkout 退房'
          ],
          image_suggestions: ['酒店大堂图片'],
          notes: '可以结合角色扮演练习'
        }
      ],
      presentation_duration: 45,
      key_points: [
        '场景化词汇学习',
        '实用性强',
        '便于记忆'
      ],
      interactive_elements: [
        '词汇配对游戏',
        '场景对话练习'
      ]
    },
    tags: ['词汇', '旅游', 'PPT', '实用英语'],
    shared: 'school' as const,
    cefr_level: 'A2' as const,
    estimated_duration: 45
  },
  {
    type: 'reading',
    title: '环保主题阅读材料',
    description: '关于环境保护的英语阅读材料，适合高中生使用',
    content_json: {
      text: `Climate change is one of the most pressing issues of our time. Scientists around the world have been studying the effects of greenhouse gases on our planet's atmosphere. The evidence shows that human activities, particularly the burning of fossil fuels, are the primary cause of global warming.

Many countries have begun to take action to reduce their carbon emissions. Renewable energy sources such as solar and wind power are becoming more popular and affordable. However, individual actions also play a crucial role in addressing this challenge.

Simple changes in our daily lives can make a significant difference. For example, using public transportation instead of private cars, reducing energy consumption at home, and recycling materials can all contribute to environmental protection.`,
      word_count: 128,
      reading_level: 'Intermediate',
      key_vocabulary: [
        {
          word: 'pressing',
          definition: '紧迫的，迫切的',
          example: 'Climate change is a pressing issue.'
        },
        {
          word: 'greenhouse gases',
          definition: '温室气体',
          example: 'CO2 is a common greenhouse gas.'
        },
        {
          word: 'renewable',
          definition: '可再生的',
          example: 'Solar energy is renewable.'
        }
      ],
      comprehension_questions: [
        {
          question: 'What is the primary cause of global warming according to the text?',
          answer: 'Human activities, particularly the burning of fossil fuels',
          type: 'short_answer'
        },
        {
          question: 'Which renewable energy sources are mentioned?',
          answer: 'Solar and wind power',
          type: 'short_answer'
        },
        {
          question: 'Climate change is not a serious problem.',
          answer: 'False',
          type: 'true_false'
        }
      ],
      discussion_topics: [
        '你认为个人行为对环保有多重要？',
        '在你的国家，哪些环保措施最有效？',
        '年轻人应该如何参与环保行动？'
      ]
    },
    tags: ['阅读', '环保', '议论文', '高中'],
    shared: 'school' as const,
    cefr_level: 'B2' as const,
    estimated_duration: 40
  },
  {
    type: 'dialog',
    title: '餐厅点餐对话',
    description: '在餐厅点餐的实用英语对话，包含常用表达和礼貌用语',
    content_json: {
      participants: ['顾客 (Customer)', '服务员 (Waiter)'],
      scenario: '顾客在西餐厅点餐的场景',
      turns: [
        {
          speaker: '服务员',
          text: 'Good evening! Welcome to our restaurant. How many people in your party?',
          target_phrases: ['Good evening', 'Welcome to', 'How many people']
        },
        {
          speaker: '顾客',
          text: 'Good evening. Table for two, please.',
          target_phrases: ['Table for two']
        },
        {
          speaker: '服务员',
          text: 'Right this way, please. Here are your menus. Can I start you off with something to drink?',
          target_phrases: ['Right this way', 'start you off with']
        },
        {
          speaker: '顾客',
          text: 'I would like a glass of water, and my friend will have orange juice.',
          target_phrases: ['I would like', 'will have']
        },
        {
          speaker: '服务员',
          text: 'Perfect. Are you ready to order, or do you need a few more minutes?',
          target_phrases: ['Are you ready to order', 'a few more minutes']
        }
      ],
      vocabulary: [
        {
          word: 'party',
          meaning: '（用餐的）一行人',
          pronunciation: '/ˈpɑːrti/'
        },
        {
          word: 'menu',
          meaning: '菜单',
          pronunciation: '/ˈmenjuː/'
        }
      ],
      cultural_notes: [
        '在西方餐厅，通常需要等待服务员带位',
        '点餐前先点饮料是常见做法'
      ],
      practice_activities: [
        '角色扮演练习',
        '替换词汇练习',
        '情景拓展练习'
      ]
    },
    tags: ['对话', '餐厅', '实用英语', '服务行业'],
    shared: 'school' as const,
    cefr_level: 'A2' as const,
    estimated_duration: 30
  },
  {
    type: 'game',
    title: '英语词汇抢答游戏',
    description: '团队词汇竞赛游戏，通过抢答形式复习和巩固词汇',
    content_json: {
      game_type: 'vocabulary',
      instructions: [
        '将学生分为3-4个小组',
        '教师展示词汇定义或图片',
        '学生抢答对应的英语单词',
        '答对得分，答错扣分'
      ],
      materials_needed: [
        '词汇卡片',
        '计分板',
        '抢答器（或举手）',
        '奖品'
      ],
      setup: '教室桌椅重新排列，形成小组围坐形式',
      rules: [
        '每题限时10秒',
        '答对得2分，答错扣1分',
        '不得提前抢答',
        '最终得分最高的小组获胜'
      ],
      variations: [
        '图片猜词汇',
        '反义词抢答',
        '词汇接龙',
        '同义词配对'
      ],
      items: [
        {
          prompt: '一种红色的水果，通常在秋天收获',
          answer: 'apple',
          hints: ['grows on trees', 'keeps doctor away']
        },
        {
          prompt: '用来写字的工具，需要墨水',
          answer: 'pen',
          hints: ['writing tool', 'uses ink']
        },
        {
          prompt: '天空中的白色物体，会带来雨水',
          answer: 'cloud',
          hints: ['in the sky', 'brings rain']
        }
      ],
      time_limit: 10,
      player_count: {
        min: 12,
        max: 40
      }
    },
    tags: ['游戏', '词汇', '团队合作', '竞赛'],
    shared: 'school' as const,
    cefr_level: 'A1' as const,
    estimated_duration: 30
  },
  {
    type: 'template',
    title: '英语作文模板',
    description: '议论文写作模板，包含引言、主体段落和结论的标准结构',
    content_json: {
      template_type: 'essay_writing',
      structure: {
        introduction: {
          hook: '[吸引读者注意的开头句]',
          background: '[背景信息介绍]',
          thesis: '[论点陈述]'
        },
        body_paragraphs: [
          {
            topic_sentence: '[段落主题句]',
            supporting_details: '[支持细节1]',
            examples: '[具体例子]',
            concluding_sentence: '[段落总结句]'
          }
        ],
        conclusion: {
          restate_thesis: '[重申论点]',
          summary: '[总结要点]',
          final_thought: '[最终思考]'
        }
      },
      placeholders: {
        '[吸引读者注意的开头句]': '可以使用问句、名言或统计数据',
        '[背景信息介绍]': '简要介绍话题背景',
        '[论点陈述]': '明确表达自己的观点',
        '[段落主题句]': '每段的中心思想',
        '[支持细节1]': '支持论点的具体理由',
        '[具体例子]': '真实的例子或数据',
        '[段落总结句]': '总结本段内容',
        '[重申论点]': '用不同表达重申观点',
        '[总结要点]': '概括主要论据',
        '[最终思考]': '给读者留下深刻印象'
      },
      instructions: [
        '根据题目要求选择合适的论点',
        '每个主体段落只讨论一个要点',
        '使用连接词增强文章连贯性',
        '注意语法和拼写正确性'
      ],
      customizable_fields: [
        'topic',
        'stance',
        'number_of_body_paragraphs',
        'word_count_target'
      ],
      examples: [
        {
          topic: '网络教育的优缺点',
          sample_thesis: 'While online education offers flexibility and accessibility, it also presents challenges in terms of interaction and self-discipline.'
        }
      ]
    },
    tags: ['模板', '写作', '议论文', '结构'],
    shared: 'school' as const,
    cefr_level: 'B1' as const,
    estimated_duration: 90
  }
] as const