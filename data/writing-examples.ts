import type { WritingTask, GradingResult } from '@/types/writing'

// Sample writing tasks for different genres and levels
export const sampleTasks: WritingTask[] = [
  {
    id: 'task_sample_1',
    title: '我的暑假生活',
    genre: '记叙文',
    level: 'A2',
    prompt: '请描述你去年暑假的一次难忘经历。包括时间、地点、参与的人物以及发生的事情。注意使用过去时态，表达清楚事件的经过和你的感受。',
    key_points: [
      '设置场景背景（时间、地点）',
      '介绍主要人物',
      '描述事件经过',
      '表达个人感受和收获'
    ],
    target_vocabulary: ['vacation', 'exciting', 'memorable', 'family', 'friends', 'wonderful', 'interesting'],
    target_structures: ['I went to...', 'It was...', 'I felt...', 'We had a great time'],
    word_count: { min: 80, max: 120 },
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'task_sample_2',
    title: '给朋友的邀请信',
    genre: '应用文',
    level: 'B1',
    prompt: '你计划下个周末举办一个生日聚会，请写一封邀请信给你的好朋友Tom。信中需要包括聚会的时间、地点、活动安排，并询问他是否能参加。注意使用正式的信件格式。',
    key_points: [
      '使用正确的信件格式',
      '明确说明聚会目的',
      '提供详细的时间地点信息',
      '描述活动安排',
      '礼貌地询问回复'
    ],
    target_vocabulary: ['invitation', 'party', 'celebrate', 'organize', 'venue', 'entertainment', 'appreciate'],
    target_structures: ['I would like to invite you to...', 'The party will be held at...', 'Could you please let me know...'],
    word_count: { min: 100, max: 150 },
    created_at: '2024-01-16T14:30:00Z'
  },
  {
    id: 'task_sample_3',
    title: '网络学习的利弊',
    genre: '议论文',
    level: 'B2',
    prompt: '随着科技的发展，网络学习变得越来越普及。请论述网络学习的优点和缺点，并表达你的个人观点。文章需要有清晰的论证结构和支撑论据。',
    key_points: [
      '提出明确的论点',
      '分析网络学习的优势',
      '讨论网络学习的问题',
      '提供具体例证',
      '得出平衡的结论'
    ],
    target_vocabulary: ['technology', 'convenience', 'flexibility', 'interaction', 'discipline', 'effectiveness'],
    target_structures: ['On one hand...', 'However...', 'In my opinion...', 'For example...'],
    word_count: { min: 150, max: 200 },
    created_at: '2024-01-17T09:15:00Z'
  }
]

// Sample student essays with different quality levels
export const sampleEssays = {
  // A2 Level - Good performance
  narrative_good: {
    text: `My Summer Vacation

Last summer, I went to Beijing with my family. It was the most exciting trip I have ever had. We visited many famous places like the Great Wall and the Forbidden City.

On the first day, we climbed the Great Wall. The weather was very hot, but I felt amazing when I reached the top. The view was wonderful and I took many photos with my parents and sister.

The next day, we went to the Forbidden City. It was huge and beautiful. Our guide told us many interesting stories about the emperors. I learned a lot about Chinese history.

We also tried many delicious foods like Peking duck and dumplings. Everything was so tasty. In the evening, we walked around Wangfujing Street and bought some souvenirs.

This vacation was memorable because I spent wonderful time with my family and learned about our culture. I hope to visit Beijing again soon.`,
    wordCount: 142,
    expectedGrade: {
      task_response: 4,
      accuracy: 4,
      lexical_range: 3,
      cohesion: 4,
      organization: 4,
      overall: 78
    }
  },

  // A2 Level - Needs improvement
  narrative_poor: {
    text: `My vacation

I go to park last summer. It is good. I like it very much. My friend come with me. We play games.

The weather is hot. We eat ice cream. It taste good. We take photo. I am happy.

We also go shopping. I buy some things. My friend buy things too. We have good time.

I like this vacation. It is fun. I want go again.`,
    wordCount: 65,
    expectedGrade: {
      task_response: 2,
      accuracy: 2,
      lexical_range: 2,
      cohesion: 2,
      organization: 2,
      overall: 42
    }
  },

  // B1 Level - Application letter
  application_good: {
    text: `Dear Tom,

I hope this letter finds you well. I am writing to invite you to my birthday party next Saturday, January 27th.

I am organizing a celebration at my house starting from 6:00 PM. The address is 123 Oak Street, near the central park. We will have dinner, music, and games. I have also prepared some entertainment including karaoke and board games.

Several of our mutual friends will be attending, including Sarah, Mike, and Lisa. I think it will be a wonderful opportunity for all of us to catch up and have fun together.

Could you please let me know if you can make it? I would really appreciate your response by Thursday so I can finalize the arrangements. You can call me at 555-0123 or send me a text message.

I am looking forward to celebrating with you and having a memorable evening together.

Best regards,
Alex`,
    wordCount: 147,
    expectedGrade: {
      task_response: 5,
      accuracy: 4,
      lexical_range: 4,
      cohesion: 4,
      organization: 5,
      overall: 88
    }
  }
}

// Sample grading results for demonstration
export const sampleGradingResults: Record<string, GradingResult> = {
  narrative_good: {
    rubric: {
      task_response: 4,
      accuracy: 4,
      lexical_range: 3,
      cohesion: 4,
      organization: 4,
      overall: 78,
      summary: '整体表现良好，任务完成度高，语言表达较为准确，建议丰富词汇使用'
    },
    sentence_suggestions: [
      {
        idx: 1,
        before: 'It was the most exciting trip I have ever had.',
        after: 'It was the most exciting and memorable trip I have ever experienced.',
        reason: '使用更丰富的形容词来增强表达效果'
      },
      {
        idx: 8,
        before: 'Everything was so tasty.',
        after: 'All the dishes were absolutely delicious and flavorful.',
        reason: '避免使用过于简单的词汇，选择更具体的描述'
      }
    ],
    improved_version: `My Unforgettable Summer Vacation

Last summer, I embarked on an incredible journey to Beijing with my family. It was the most exciting and memorable trip I have ever experienced, filled with amazing discoveries and precious family moments.

On our first day, we courageously climbed the magnificent Great Wall. Despite the scorching heat, I felt absolutely triumphant when I reached the summit. The breathtaking panoramic view stretched endlessly before us, and I captured countless precious photos with my parents and sister.

The following day, we explored the majestic Forbidden City. This enormous palace complex was architecturally stunning and historically fascinating. Our knowledgeable guide shared captivating stories about ancient emperors, and I gained valuable insights into Chinese imperial history.

We also savored various authentic cuisines, including the famous Peking duck and traditional dumplings. All the dishes were absolutely delicious and flavorful. In the evenings, we strolled through the bustling Wangfujing Street, purchasing meaningful souvenirs.

This vacation remains unforgettable because I spent quality time with my beloved family while deepening my appreciation for our rich cultural heritage. I eagerly anticipate returning to Beijing in the near future.`,
    teacher_brief: '这篇记叙文整体表现良好。优点包括：任务完成度高，成功描述了暑假经历；文章结构清晰，按时间顺序组织内容；语言表达基本准确，时态使用正确。改进建议：可以尝试使用更多样的词汇和句型结构，避免重复使用简单词汇；加强细节描写，使文章更生动具体。继续保持良好的写作习惯，多阅读优秀范文来提升表达水平。'
  },

  narrative_poor: {
    rubric: {
      task_response: 2,
      accuracy: 2,
      lexical_range: 2,
      cohesion: 2,
      organization: 2,
      overall: 42,
      summary: '需要重点改进语法准确性和词汇丰富度，加强文章结构组织'
    },
    sentence_suggestions: [
      {
        idx: 1,
        before: 'I go to park last summer.',
        after: 'I went to the park last summer.',
        reason: '过去时态应使用went，并需要加定冠词the'
      },
      {
        idx: 4,
        before: 'My friend come with me.',
        after: 'My friend came with me.',
        reason: '过去时态应使用came'
      },
      {
        idx: 7,
        before: 'It taste good.',
        after: 'It tasted good.',
        reason: '过去时态应使用tasted'
      }
    ],
    improved_version: `My Summer Vacation at the Park

Last summer, I went to the beautiful city park with my best friend. It was a wonderful and enjoyable experience that I will always remember.

The weather was quite hot, but we had a fantastic time together. We played various games like frisbee and basketball on the playground. When we got tired and thirsty, we bought delicious ice cream from a vendor. The ice cream tasted absolutely refreshing and helped us cool down.

We also took many photos together to capture our happy moments. I felt so joyful spending time with my friend in such a peaceful environment.

Later, we went shopping at the nearby mall. I bought some interesting books and souvenirs, while my friend purchased some clothes and gifts. We both had an amazing time exploring the different stores.

This vacation was truly special because I enjoyed quality time with my dear friend. It was such a fun and memorable experience that I definitely want to repeat again next summer.`,
    teacher_brief: '这篇作文需要在多个方面进行改进。主要问题包括：时态使用不准确，多处应该使用过去时；词汇量有限，表达较为简单；句子结构基础，缺乏变化；文章长度不足，未达到字数要求。建议：加强语法基础练习，特别是动词时态；扩大词汇量，学习使用更丰富的表达方式；多进行写作练习，逐步提高文章长度和质量。不要气馁，通过持续练习一定会有进步！'
  },

  application_good: {
    rubric: {
      task_response: 5,
      accuracy: 4,
      lexical_range: 4,
      cohesion: 4,
      organization: 5,
      overall: 88,
      summary: '优秀的应用文写作，格式规范，内容完整，语言得体'
    },
    sentence_suggestions: [
      {
        idx: 5,
        before: 'I have also prepared some entertainment including karaoke and board games.',
        after: 'I have also arranged various forms of entertainment, including karaoke sessions and exciting board games.',
        reason: '使用更具体和生动的表达方式'
      }
    ],
    improved_version: `Dear Tom,

I hope this letter finds you in excellent health and high spirits. I am delighted to extend a warm invitation to you for my birthday celebration next Saturday, January 27th.

I am organizing a special celebration at my residence, commencing at 6:00 PM sharp. The venue is located at 123 Oak Street, conveniently situated near the central park. The evening will feature a delicious dinner, lively music, and engaging activities. I have also arranged various forms of entertainment, including karaoke sessions and exciting board games to ensure everyone has a fantastic time.

Several of our cherished mutual friends will be joining us, including Sarah, Mike, and Lisa. I believe this will provide an excellent opportunity for our entire group to reconnect, share stories, and create new memories together.

Would you kindly confirm your attendance? I would greatly appreciate receiving your response by Thursday evening, as this will allow me to finalize all the necessary arrangements. Please feel free to contact me at 555-0123 or send me a text message at your convenience.

I am genuinely excited about the prospect of celebrating this special milestone with you and creating an unforgettable evening filled with laughter and friendship.

Warmest regards,
Alex`,
    teacher_brief: '这是一篇优秀的邀请信写作。优点包括：完全符合应用文格式要求；内容全面，包含所有必要信息；语言正式得体，符合写信规范；逻辑清晰，段落安排合理；词汇使用准确，句型多样。小的改进建议：可以在某些地方使用更加生动具体的表达；继续保持这种高水平的写作标准。这篇文章展现了很好的英语应用文写作能力！'
  }
}

// Rubric evaluation criteria explanations
export const rubricCriteria = {
  task_response: {
    name: '任务完成度',
    description: '评估学生是否完全理解并完成了写作任务要求',
    levels: {
      5: '完全完成任务，所有要求都得到充分回应',
      4: '基本完成任务，主要要求都有涉及',
      3: '部分完成任务，遗漏部分要求',
      2: '勉强完成任务，多数要求未充分回应',
      1: '未能有效完成任务'
    }
  },
  accuracy: {
    name: '语言准确性',
    description: '评估语法、拼写、时态等语言使用的准确程度',
    levels: {
      5: '语法准确，偶有小错误不影响理解',
      4: '语法基本准确，有少量错误',
      3: '语法错误较多但不严重影响理解',
      2: '语法错误频繁，影响理解',
      1: '语法错误严重，难以理解'
    }
  },
  lexical_range: {
    name: '词汇丰富度',
    description: '评估词汇的多样性、准确性和适用性',
    levels: {
      5: '词汇丰富多样，使用准确恰当',
      4: '词汇较为丰富，基本准确',
      3: '词汇适度，偶有不当使用',
      2: '词汇有限，重复使用明显',
      1: '词汇贫乏，表达受限'
    }
  },
  cohesion: {
    name: '语言连贯性',
    description: '评估句子间的逻辑连接和语言流畅度',
    levels: {
      5: '语言流畅，逻辑连接自然恰当',
      4: '连接较好，偶有不够流畅',
      3: '基本连贯，部分连接不够自然',
      2: '连贯性一般，逻辑跳跃较多',
      1: '缺乏连贯性，逻辑混乱'
    }
  },
  organization: {
    name: '文章结构',
    description: '评估文章的整体结构和段落安排',
    levels: {
      5: '结构清晰完整，段落安排合理',
      4: '结构较好，段落基本合理',
      3: '结构一般，段落安排可以改进',
      2: '结构不够清晰，段落安排欠佳',
      1: '结构混乱，缺乏合理安排'
    }
  }
}