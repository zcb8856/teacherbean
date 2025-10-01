export interface WritingTask {
  id: string
  title: string
  genre: '记叙文' | '应用文' | '议论文'
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  prompt: string
  key_points: string[]
  target_vocabulary: string[]
  target_structures: string[]
  word_count: {
    min: number
    max: number
  }
  time_limit?: number
  created_at: string
}

export interface WritingTaskForm {
  genre: '记叙文' | '应用文' | '议论文'
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  topic: string
  requirements: string
  word_count_min: number
  word_count_max: number
  target_vocabulary: string
  target_structures: string
}

export interface WritingRubric {
  task_response: number // 0-5: 任务完成度
  accuracy: number     // 0-5: 语言准确性
  lexical_range: number // 0-5: 词汇丰富度
  cohesion: number     // 0-5: 语言连贯性
  organization: number // 0-5: 文章结构
  overall: number      // 0-100: 总分
  summary: string      // 讲评重点（中文）
}

export interface SentenceSuggestion {
  idx: number      // 句子序号
  before: string   // 原句
  after: string    // 建议修改
  reason: string   // 修改原因
}

export interface GradingResult {
  rubric: WritingRubric
  sentence_suggestions: SentenceSuggestion[]
  improved_version: string
  teacher_brief: string
}

export interface WritingSubmission {
  id: string
  task_id: string
  student_id?: string
  student_name?: string
  text: string
  word_count: number
  rubric_json: WritingRubric
  ai_feedback: {
    sentence_suggestions: SentenceSuggestion[]
    improved_version: string
    teacher_brief: string
  }
  teacher_feedback?: string
  revised_text?: string
  final_score: number
  created_at: string
  updated_at: string
}

export interface WritingAnalytics {
  total_submissions: number
  average_score: number
  score_distribution: { range: string; count: number }[]
  common_issues: { issue: string; frequency: number }[]
  improvement_trends: { date: string; average_score: number }[]
}