// Library system types

export interface Material {
  id: string
  owner_id: string
  type: 'lesson_plan' | 'ppt_outline' | 'reading' | 'dialog' | 'game' | 'template'
  title: string
  description?: string
  content_json: any
  tags: string[]
  shared: 'private' | 'school' | 'public'
  cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  estimated_duration?: number // in minutes
  created_at: string
  updated_at: string
  // Additional fields
  download_count?: number
  favorite_count?: number
  view_count?: number
  is_favorited?: boolean // for current user
  owner_name?: string
  school_name?: string
}

export interface MaterialFavorite {
  id: string
  user_id: string
  material_id: string
  created_at: string
}

export interface MaterialStats {
  total_materials: number
  my_materials: number
  favorited_materials: number
  shared_materials: number
  download_count: number
  materials_by_type: Record<string, number>
}

export interface MaterialSearchFilters {
  search: string
  type: string
  shared: string
  cefr_level: string
  tags: string
  owner: string
  school: string
}

export interface MaterialSearchParams {
  page: number
  limit: number
  filters: MaterialSearchFilters
  sort_by: 'created_at' | 'updated_at' | 'title' | 'download_count' | 'favorite_count'
  sort_order: 'asc' | 'desc'
}

export interface MaterialSearchResult {
  data: Material[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: MaterialStats
}

// Specific content types for different material types
export interface LessonPlanContent {
  objectives: string[]
  materials_needed: string[]
  warm_up: {
    duration: number
    activities: string[]
  }
  main_activities: Array<{
    title: string
    duration: number
    description: string
    instructions: string[]
    materials?: string[]
  }>
  wrap_up: {
    duration: number
    activities: string[]
  }
  homework?: string
  notes?: string
}

export interface PPTOutlineContent {
  slides: Array<{
    slide_number: number
    title: string
    content: string[]
    image_suggestions?: string[]
    notes?: string
  }>
  presentation_duration: number
  key_points: string[]
  interactive_elements?: string[]
}

export interface ReadingContent {
  text: string
  word_count: number
  reading_level: string
  key_vocabulary: Array<{
    word: string
    definition: string
    example?: string
  }>
  comprehension_questions: Array<{
    question: string
    answer: string
    type: 'multiple_choice' | 'short_answer' | 'true_false'
    options?: string[]
  }>
  discussion_topics?: string[]
}

export interface DialogContent {
  participants: string[]
  scenario: string
  turns: Array<{
    speaker: string
    text: string
    notes?: string
    target_phrases?: string[]
  }>
  vocabulary: Array<{
    word: string
    meaning: string
    pronunciation?: string
  }>
  cultural_notes?: string[]
  practice_activities?: string[]
}

export interface GameContent {
  game_type: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'mixed'
  instructions: string[]
  materials_needed: string[]
  setup: string
  rules: string[]
  variations?: string[]
  items?: Array<{
    prompt: string
    answer: string
    hints?: string[]
  }>
  time_limit?: number
  player_count: {
    min: number
    max: number
  }
}

export interface TemplateContent {
  template_type: string
  structure: any
  placeholders: Record<string, string>
  instructions: string[]
  customizable_fields: string[]
  examples?: any[]
}

// Apply to class functionality
export interface ApplyToClassRequest {
  material_id: string
  class_id: string
  assignment_title?: string
  due_date?: string
  instructions?: string
  customizations?: Record<string, any>
}

export interface ApplyToClassResult {
  assignment_id: string
  material_id: string
  class_id: string
  success: boolean
  message: string
}

// Export functionality
export interface ExportRequest {
  material_ids: string[]
  format: 'json' | 'zip'
  include_metadata: boolean
}

export interface ExportResult {
  file_url: string
  file_name: string
  file_size: number
  expires_at: string
}