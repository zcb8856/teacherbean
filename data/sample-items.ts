import type { Item } from '@/types/assess'

// Sample items for demonstration and testing
export const sampleItems: Omit<Item, 'id' | 'owner_id' | 'created_at' | 'updated_at'>[] = [
  // Multiple Choice Questions (MCQ)
  {
    type: 'mcq',
    level: 'A1',
    stem: 'I _____ to school every day.',
    options_json: ['go', 'goes', 'went', 'going'],
    answer_json: 0,
    explanation: '主语是第一人称单数I，动词用原形go。',
    tags: ['grammar', 'present_simple', 'daily_routine'],
    source: 'Basic Grammar Textbook Unit 1',
    difficulty_score: 0.2,
    usage_count: 45
  },
  {
    type: 'mcq',
    level: 'A1',
    stem: 'She _____ English very well.',
    options_json: ['speak', 'speaks', 'spoke', 'speaking'],
    answer_json: 1,
    explanation: '主语she是第三人称单数，现在时态动词要加s。',
    tags: ['grammar', 'present_simple', 'third_person'],
    source: 'Grammar Practice Book',
    difficulty_score: 0.3,
    usage_count: 38
  },
  {
    type: 'mcq',
    level: 'A2',
    stem: 'Yesterday I _____ to the cinema with my friends.',
    options_json: ['go', 'went', 'will go', 'have gone'],
    answer_json: 1,
    explanation: 'Yesterday表示过去时间，应使用一般过去时went。',
    tags: ['grammar', 'past_simple', 'time_expressions'],
    source: 'Elementary English Course',
    difficulty_score: 0.4,
    usage_count: 52
  },
  {
    type: 'mcq',
    level: 'A2',
    stem: 'What _____ you doing when I called?',
    options_json: ['are', 'were', 'was', 'will be'],
    answer_json: 1,
    explanation: '过去进行时的疑问句，主语you用were。',
    tags: ['grammar', 'past_continuous', 'question_form'],
    source: 'Interactive Grammar',
    difficulty_score: 0.5,
    usage_count: 41
  },
  {
    type: 'mcq',
    level: 'B1',
    stem: 'If I _____ more time, I would learn a new language.',
    options_json: ['have', 'had', 'will have', 'would have'],
    answer_json: 1,
    explanation: '虚拟条件句，if从句用过去时表示与现在事实相反的假设。',
    tags: ['grammar', 'conditional', 'subjunctive'],
    source: 'Intermediate Grammar Guide',
    difficulty_score: 0.7,
    usage_count: 29
  },
  {
    type: 'mcq',
    level: 'B1',
    stem: 'The book _____ by millions of people around the world.',
    options_json: ['reads', 'is read', 'has read', 'was reading'],
    answer_json: 1,
    explanation: '被动语态，书被人们阅读，用is read。',
    tags: ['grammar', 'passive_voice', 'present_simple'],
    source: 'Advanced Grammar Concepts',
    difficulty_score: 0.6,
    usage_count: 33
  },
  {
    type: 'mcq',
    level: 'B2',
    stem: 'By the time you arrive, I _____ for two hours.',
    options_json: ['will wait', 'will be waiting', 'will have waited', 'will have been waiting'],
    answer_json: 3,
    explanation: '将来完成进行时，强调动作从过去某点开始一直持续到将来某点。',
    tags: ['grammar', 'future_perfect_continuous', 'time_clauses'],
    source: 'Upper-Intermediate Grammar',
    difficulty_score: 0.8,
    usage_count: 15
  },

  // Cloze Questions (Fill in the blanks)
  {
    type: 'cloze',
    level: 'A1',
    stem: 'My name _____ John. I _____ 15 years old.',
    options_json: null,
    answer_json: ['is', 'am'],
    explanation: '第一空主语是name用is，第二空主语是I用am。',
    tags: ['grammar', 'be_verb', 'personal_information'],
    source: 'Beginner English Workbook',
    difficulty_score: 0.1,
    usage_count: 67
  },
  {
    type: 'cloze',
    level: 'A2',
    stem: 'Last summer, we _____ (visit) my grandparents. They _____ (live) in a small village.',
    options_json: null,
    answer_json: ['visited', 'lived'],
    explanation: '两个动作都发生在过去，用一般过去时。',
    tags: ['grammar', 'past_simple', 'regular_verbs'],
    source: 'Past Tense Practice',
    difficulty_score: 0.3,
    usage_count: 44
  },
  {
    type: 'cloze',
    level: 'B1',
    stem: 'If you _____ (study) harder, you _____ (pass) the exam.',
    options_json: null,
    answer_json: ['study', 'will pass'],
    explanation: '真实条件句，if从句用现在时，主句用将来时。',
    tags: ['grammar', 'first_conditional', 'real_conditions'],
    source: 'Conditional Sentences Unit',
    difficulty_score: 0.6,
    usage_count: 28
  },

  // Error Correction
  {
    type: 'error_correction',
    level: 'A2',
    stem: 'I am go to school by bus every day.',
    options_json: null,
    answer_json: 'I go to school by bus every day.',
    explanation: '现在时态不能用am + 动词原形，应该直接用动词原形go。',
    tags: ['grammar', 'present_simple', 'common_errors'],
    source: 'Error Analysis Collection',
    difficulty_score: 0.4,
    usage_count: 36
  },
  {
    type: 'error_correction',
    level: 'B1',
    stem: 'She has been lived in London for five years.',
    options_json: null,
    answer_json: 'She has lived in London for five years.',
    explanation: 'live是状态动词，在现在完成时中不能使用进行形式。',
    tags: ['grammar', 'present_perfect', 'state_verbs'],
    source: 'Grammar Error Correction',
    difficulty_score: 0.7,
    usage_count: 22
  },

  // Matching Questions
  {
    type: 'matching',
    level: 'A1',
    stem: 'Match the words with their meanings:',
    options_json: {
      left: ['happy', 'sad', 'angry', 'tired'],
      right: ['疲倦的', '高兴的', '生气的', '悲伤的']
    },
    answer_json: { 'happy': '高兴的', 'sad': '悲伤的', 'angry': '生气的', 'tired': '疲倦的' },
    explanation: '基础情感词汇的中英文对应。',
    tags: ['vocabulary', 'emotions', 'basic_adjectives'],
    source: 'Vocabulary Builder Level 1',
    difficulty_score: 0.2,
    usage_count: 55
  },
  {
    type: 'matching',
    level: 'A2',
    stem: 'Match the verb forms:',
    options_json: {
      left: ['go', 'eat', 'write', 'see'],
      right: ['saw', 'went', 'wrote', 'ate']
    },
    answer_json: { 'go': 'went', 'eat': 'ate', 'write': 'wrote', 'see': 'saw' },
    explanation: '不规则动词的过去式形式。',
    tags: ['grammar', 'irregular_verbs', 'past_forms'],
    source: 'Irregular Verbs Practice',
    difficulty_score: 0.5,
    usage_count: 40
  },

  // Reading Comprehension
  {
    type: 'reading_q',
    level: 'B1',
    stem: `Read the passage and answer the question:

"Climate change is one of the most pressing issues of our time. Scientists have observed that global temperatures have risen significantly over the past century. This warming trend is primarily caused by human activities, particularly the burning of fossil fuels. The consequences include melting ice caps, rising sea levels, and more frequent extreme weather events."

What is the main cause of climate change according to the passage?`,
    options_json: ['Natural temperature cycles', 'Human activities', 'Solar radiation changes', 'Volcanic activity'],
    answer_json: 1,
    explanation: '文章明确指出气候变化主要由人类活动引起，特别是燃烧化石燃料。',
    tags: ['reading', 'main_idea', 'environmental_issues'],
    source: 'Reading Comprehension B1',
    difficulty_score: 0.6,
    usage_count: 31
  },
  {
    type: 'reading_q',
    level: 'B2',
    stem: `Read the passage and answer the question:

"The concept of artificial intelligence has evolved dramatically since its inception in the 1950s. Initially, researchers were optimistic about creating machines that could think like humans within a few decades. However, the reality proved more complex. While AI has achieved remarkable success in specific domains like chess and image recognition, general artificial intelligence remains elusive."

What can be inferred about early AI researchers?`,
    options_json: [
      'They were pessimistic about AI development',
      'They underestimated the complexity of creating AI',
      'They focused only on specific applications',
      'They opposed the development of AI'
    ],
    answer_json: 1,
    explanation: '从"Initially, researchers were optimistic about creating machines that could think like humans within a few decades. However, the reality proved more complex"可以推断出早期研究者低估了AI的复杂性。',
    tags: ['reading', 'inference', 'technology'],
    source: 'Advanced Reading Skills',
    difficulty_score: 0.7,
    usage_count: 18
  },

  // Writing Tasks
  {
    type: 'writing_task',
    level: 'A2',
    stem: 'Write a short paragraph (50-80 words) describing your daily routine. Include at least 3 activities and use present simple tense.',
    options_json: null,
    answer_json: {
      sample_response: 'I wake up at 7 AM every morning. After breakfast, I go to school by bus. I have six classes during the day. In the afternoon, I usually do my homework and play with my friends. I have dinner with my family at 6 PM. Before going to bed, I like to read books or watch TV.',
      evaluation_criteria: ['Uses present simple correctly', 'Describes at least 3 activities', 'Meets word count requirement', 'Uses appropriate vocabulary']
    },
    explanation: '评分标准：时态使用正确、内容完整、词汇运用恰当、语法准确。',
    tags: ['writing', 'daily_routine', 'present_simple'],
    source: 'Writing Practice A2',
    difficulty_score: 0.4,
    usage_count: 25
  },
  {
    type: 'writing_task',
    level: 'B1',
    stem: 'Write an opinion essay (100-150 words) about whether students should wear school uniforms. Give at least two reasons to support your opinion.',
    options_json: null,
    answer_json: {
      sample_response: 'I believe students should wear school uniforms for several important reasons. First, uniforms promote equality among students by reducing visible differences in economic background. When everyone dresses the same way, students focus more on learning rather than comparing clothing brands. Second, uniforms help create a sense of school identity and belonging. Students feel like they are part of a community when they wear the same clothes. Additionally, uniforms save time in the morning because students don\'t need to decide what to wear. Some people argue that uniforms limit self-expression, but I think there are many other ways for students to show their personality through activities and academic achievements.',
      evaluation_criteria: ['Clear opinion statement', 'At least two supporting reasons', 'Appropriate word count', 'Good paragraph structure', 'Uses linking words']
    },
    explanation: '评分标准：观点明确、论据充分、结构清晰、语言流畅、词汇丰富。',
    tags: ['writing', 'opinion_essay', 'school_life'],
    source: 'Essay Writing B1',
    difficulty_score: 0.6,
    usage_count: 19
  }
]

// Function to insert sample items into database
export async function insertSampleItems(supabase: any, userId: string) {
  const itemsToInsert = sampleItems.map(item => ({
    ...item,
    owner_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('items')
    .insert(itemsToInsert)
    .select()

  if (error) {
    console.error('Error inserting sample items:', error)
    throw error
  }

  return data
}

// Grammar points and topics for filtering
export const grammarPoints = [
  'present_simple',
  'past_simple',
  'present_continuous',
  'past_continuous',
  'present_perfect',
  'past_perfect',
  'future_simple',
  'future_continuous',
  'conditional',
  'passive_voice',
  'modal_verbs',
  'reported_speech',
  'relative_clauses',
  'phrasal_verbs',
  'articles',
  'prepositions',
  'comparatives_superlatives'
]

export const topicCategories = [
  'daily_routine',
  'family_friends',
  'school_education',
  'hobbies_interests',
  'travel_transport',
  'food_drink',
  'health_fitness',
  'weather_seasons',
  'shopping_money',
  'technology',
  'environment',
  'work_careers',
  'entertainment',
  'culture_traditions',
  'social_issues'
]

export const difficultyLevels = {
  'A1': { range: [0, 0.3], description: '初级：基础词汇和语法' },
  'A2': { range: [0.2, 0.5], description: '初中级：日常话题和简单时态' },
  'B1': { range: [0.4, 0.7], description: '中级：复杂语法和抽象概念' },
  'B2': { range: [0.6, 0.8], description: '中高级：高级语法和学术话题' },
  'C1': { range: [0.7, 0.9], description: '高级：精确表达和复杂文本' },
  'C2': { range: [0.8, 1.0], description: '精通级：母语水平理解和表达' }
}