// Assessment system types

export interface Item {
  id: string
  owner_id: string
  type: 'mcq' | 'cloze' | 'error_correction' | 'matching' | 'reading_q' | 'writing_task'
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  stem: string
  options_json?: any
  answer_json: any
  explanation?: string
  tags: string[]
  source?: string
  difficulty_score: number // 0-1 scale
  usage_count: number
  correct_rate?: number
  created_at: string
  updated_at: string
}

export interface PaperConfig {
  title: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  total_items: number
  time_limit: number // minutes
  instructions: string
  item_distribution: {
    mcq: number
    cloze: number
    error_correction: number
    matching: number
    reading_q: number
    writing_task: number
  }
  difficulty_distribution: {
    easy: number    // 0-0.3
    medium: number  // 0.3-0.6
    hard: number    // 0.6-1.0
  }
  topics?: string[]
  tags?: string[]
}

export interface AssembledPaper {
  id: string
  config: PaperConfig
  items: Item[]
  paper_json: {
    title: string
    instructions: string
    time_limit: number
    sections: PaperSection[]
  }
  printable_html: string
  answer_key: any[]
  created_at: string
}

export interface PaperSection {
  id: string
  title: string
  instructions?: string
  items: PaperItem[]
}

export interface PaperItem {
  id: string
  question_number: number
  type: string
  stem: string
  options?: string[]
  answer_space?: boolean
  points: number
}

export interface QuizSession {
  id: string
  paper_id: string
  student_name?: string
  started_at: string
  submitted_at?: string
  time_remaining: number
  current_item: number
  answers: Record<string, any>
  is_completed: boolean
}

export interface QuizAnswer {
  item_id: string
  answer: any
  time_spent: number
  is_correct?: boolean
  points_earned?: number
}

export interface Submission {
  id: string
  assignment_id: string
  student_id?: string
  student_name?: string
  answers_json: Record<string, any>
  score_json: {
    total_score: number
    max_score: number
    percentage: number
    item_scores: Array<{
      item_id: string
      points_earned: number
      max_points: number
      is_correct: boolean
    }>
    section_scores?: Array<{
      section_id: string
      score: number
      max_score: number
    }>
  }
  total_score: number
  feedback_json?: {
    overall_feedback: string
    item_feedback: Array<{
      item_id: string
      feedback: string
      correct_answer: any
    }>
    strengths: string[]
    areas_for_improvement: string[]
  }
  submitted_at: string
  graded_at?: string
  is_late: boolean
}

export interface AnalyticsData {
  overview: {
    total_submissions: number
    average_score: number
    completion_rate: number
    on_time_rate: number
  }
  score_distribution: Array<{
    range: string
    count: number
    percentage: number
  }>
  difficulty_analysis: Array<{
    difficulty: string
    average_score: number
    item_count: number
  }>
  topic_performance: Array<{
    topic: string
    average_score: number
    submissions: number
    common_errors: string[]
  }>
  time_analysis: {
    average_completion_time: number
    time_distribution: Array<{
      range: string
      count: number
    }>
  }
  student_performance?: Array<{
    student_id: string
    student_name: string
    score: number
    completion_time: number
    strengths: string[]
    weaknesses: string[]
  }>
  class_performance?: Array<{
    class_id: string
    class_name: string
    average_score: number
    submission_count: number
    completion_rate: number
  }>
}

export interface ErrorAnalysis {
  by_grammar_point: Array<{
    grammar_point: string
    error_count: number
    total_attempts: number
    error_rate: number
    common_mistakes: string[]
  }>
  by_topic: Array<{
    topic: string
    error_count: number
    total_attempts: number
    error_rate: number
  }>
  by_item_type: Array<{
    item_type: string
    error_count: number
    total_attempts: number
    error_rate: number
  }>
  by_difficulty: Array<{
    difficulty_level: string
    error_count: number
    total_attempts: number
    error_rate: number
  }>
}

export interface ItemAnalytics {
  item_id: string
  usage_count: number
  correct_rate: number
  average_time: number
  discrimination_index: number
  common_wrong_answers: Array<{
    answer: any
    frequency: number
    analysis: string
  }>
  difficulty_assessment: {
    calculated_difficulty: number
    suggested_level: string
    confidence: number
  }
}

// Export configurations
export interface ExportConfig {
  format: 'csv' | 'pdf' | 'excel'
  include_details: boolean
  date_range?: {
    start: string
    end: string
  }
  filters?: {
    classes?: string[]
    students?: string[]
    topics?: string[]
  }
}

// Form types for UI components
export interface ItemSearchFilters {
  search: string
  type: string
  level: string
  difficulty: string
  tags: string
  topics: string
}

export interface PaperAssemblyForm {
  title: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  total_items: number
  time_limit: number
  instructions: string
  mcq_count: number
  cloze_count: number
  error_correction_count: number
  matching_count: number
  reading_q_count: number
  writing_task_count: number
  easy_percentage: number
  medium_percentage: number
  hard_percentage: number
  topics: string[]
  tags: string[]
}