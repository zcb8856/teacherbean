// Test data for lesson planning
export const lessonPlanData = {
  grade: '七年级',
  subject: 'Food & Health',
  duration: 45,
  objectives: [
    '学生能够掌握健康饮食相关词汇',
    '学生能够用英语描述自己的饮食习惯',
    '学生能够理解均衡饮食的重要性'
  ],
  vocabulary: [
    'nutrition', 'balanced diet', 'vitamins', 'minerals',
    'protein', 'carbohydrates', 'healthy', 'unhealthy'
  ],
  activities: [
    {
      name: '词汇热身',
      duration: 10,
      description: '通过图片展示学习食物和健康相关词汇'
    },
    {
      name: '对话练习',
      duration: 20,
      description: '学生两人一组讨论自己的饮食习惯'
    },
    {
      name: '小组活动',
      duration: 15,
      description: '设计一份健康的一日三餐菜单'
    }
  ]
}

// Test data for grammar questions
export const grammarTopics = [
  'Present Simple vs Present Continuous',
  'Past Simple vs Past Continuous',
  'Future Tense (will vs going to)',
  'Modal Verbs (can, could, may, might)',
  'Comparative and Superlative Adjectives'
]

// Test data for writing assessment
export const sampleEssay = `
My Favorite Season

I love autumn the most because it's a beautiful season. The leaves change color and become yellow, orange, and red. The weather is cool and comfortable, not too hot like summer and not too cold like winter.

In autumn, I can wear my favorite sweater and boots. I also enjoy walking in the park and seeing all the colorful leaves on the ground. My family likes to go hiking in the mountains during this season.

Another reason I love autumn is because of the food. We can eat fresh apples, pears, and pumpkins. My mother makes delicious pumpkin pie and apple cake. The smell of these foods makes me feel happy and warm.

Finally, autumn means the beginning of a new school year. I'm excited to see my friends again and learn new things. Although summer vacation is fun, I miss my classmates and teachers.

In conclusion, autumn is my favorite season because of the beautiful colors, comfortable weather, delicious food, and the excitement of starting school again.
`

// Test rubric criteria
export const rubricCriteria = {
  content: {
    weight: 30,
    levels: ['优秀', '良好', '合格', '需改进']
  },
  organization: {
    weight: 25,
    levels: ['优秀', '良好', '合格', '需改进']
  },
  language: {
    weight: 25,
    levels: ['优秀', '良好', '合格', '需改进']
  },
  mechanics: {
    weight: 20,
    levels: ['优秀', '良好', '合格', '需改进']
  }
}

// Mock AI responses for testing
export const mockAIResponses = {
  lessonPlan: {
    title: 'Food & Health - 七年级英语教案',
    objectives: lessonPlanData.objectives,
    materials: ['PPT课件', '食物图片卡片', '健康饮食金字塔图'],
    warmUp: {
      duration: 5,
      activity: '播放关于健康饮食的短视频，引导学生思考'
    },
    mainActivities: lessonPlanData.activities,
    assessment: '观察学生参与度、口语表达准确性、小组合作效果',
    homework: '制作一份自己的健康饮食计划，下节课分享'
  },
  grammarQuestions: [
    {
      id: 1,
      type: 'mcq',
      question: 'She _______ to school every day.',
      options: ['go', 'goes', 'going', 'went'],
      correct: 'goes',
      explanation: 'Present Simple用于描述习惯性动作，第三人称单数动词要加s。'
    },
    {
      id: 2,
      type: 'mcq',
      question: 'I _______ my homework when my mother called.',
      options: ['do', 'did', 'was doing', 'have done'],
      correct: 'was doing',
      explanation: 'Past Continuous用于描述过去某个时间点正在进行的动作。'
    }
    // ... more questions would be generated
  ],
  writingFeedback: {
    score: 82,
    rubricScores: {
      content: 85,
      organization: 80,
      language: 78,
      mechanics: 85
    },
    strengths: [
      '文章结构清晰，有明确的引言、主体和结论',
      '使用了丰富的形容词描述季节特点',
      '个人经历的描述生动具体'
    ],
    improvements: [
      '可以使用更多高级词汇替换简单词汇',
      '句型可以更加多样化',
      '部分句子可以合并以提高流畅度'
    ],
    improvedVersion: `
My Favorite Season

Among the four seasons, autumn holds a special place in my heart due to its breathtaking beauty and comfortable atmosphere. As the season transitions, leaves transform into a spectacular palette of golden yellow, vibrant orange, and deep crimson, creating a natural masterpiece that never fails to captivate me.

The mild autumn weather provides the perfect balance - neither the sweltering heat of summer nor the bitter cold of winter. This pleasant climate allows me to enjoy outdoor activities while wearing my favorite cozy sweaters and stylish boots. Family hiking trips in the mountains become particularly enjoyable during this season, as we can appreciate nature's artistry while breathing the crisp, fresh air.

Autumn also brings an abundance of seasonal delicacies that delight both the palate and the senses. Fresh apples, juicy pears, and orange pumpkins grace our table, while my mother's homemade pumpkin pie and apple cake fill our home with irresistible aromas that evoke feelings of warmth and contentment.

Furthermore, the beginning of the new academic year in autumn fills me with anticipation and excitement. While summer vacation offers relaxation and fun, I genuinely miss the intellectual stimulation of learning and the joy of reuniting with classmates and teachers.

In conclusion, autumn's combination of natural beauty, comfortable weather, delicious seasonal foods, and educational opportunities makes it my most cherished season of the year.
`
  }
}