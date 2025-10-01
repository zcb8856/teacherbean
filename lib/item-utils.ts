// Type guards and utility functions for item structure validation and conversion

import type { Item } from '@/types/assess'

// Type guards for validating item structures
export function isValidItem(obj: any): obj is Item {
  if (!obj || typeof obj !== 'object') return false

  return (
    typeof obj.id === 'string' &&
    typeof obj.owner_id === 'string' &&
    ['mcq', 'cloze', 'error_correction', 'matching', 'reading_q', 'writing_task'].includes(obj.type) &&
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(obj.level) &&
    typeof obj.stem === 'string' &&
    obj.answer_json !== undefined &&
    Array.isArray(obj.tags) &&
    typeof obj.difficulty_score === 'number' &&
    obj.difficulty_score >= 0 &&
    obj.difficulty_score <= 1 &&
    typeof obj.usage_count === 'number' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  )
}

export function isValidMCQItem(obj: any): boolean {
  if (!isValidItem(obj) || obj.type !== 'mcq') return false

  return !!(
    obj.options_json &&
    Array.isArray(obj.options_json) &&
    obj.options_json.length >= 2 &&
    obj.options_json.every((option: any) => typeof option === 'string') &&
    typeof obj.answer_json === 'string' &&
    ['A', 'B', 'C', 'D'].includes(obj.answer_json)
  )
}

export function isValidClozeItem(obj: any): boolean {
  return (
    isValidItem(obj) &&
    obj.type === 'cloze' &&
    typeof obj.stem === 'string' &&
    obj.stem.includes('___') &&
    (Array.isArray(obj.answer_json) || typeof obj.answer_json === 'string')
  )
}

export function isValidMatchingItem(obj: any): boolean {
  if (!isValidItem(obj) || obj.type !== 'matching') return false

  return !!(
    obj.options_json &&
    typeof obj.options_json === 'object' &&
    obj.options_json !== null &&
    !Array.isArray(obj.options_json) &&
    obj.options_json.left &&
    obj.options_json.right &&
    Array.isArray(obj.options_json.left) &&
    Array.isArray(obj.options_json.right) &&
    obj.answer_json &&
    typeof obj.answer_json === 'object' &&
    obj.answer_json !== null &&
    !Array.isArray(obj.answer_json)
  )
}

// Conversion functions to normalize item structures
export function convertToUnifiedStructure(item: any): Item | null {
  try {
    // Basic validation
    if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item === 'string' || typeof item === 'number') {
      return null
    }

    // Ensure required fields exist with defaults
    const unifiedItem: Item = {
      id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      owner_id: item.owner_id || '',
      type: item.type || 'mcq',
      level: item.level || 'A2',
      stem: item.stem || '',
      options_json: item.options_json || undefined,
      answer_json: item.answer_json || '',
      explanation: item.explanation || undefined,
      tags: Array.isArray(item.tags) ? item.tags : [],
      source: item.source || undefined,
      difficulty_score: typeof item.difficulty_score === 'number' ?
        Math.max(0, Math.min(1, item.difficulty_score)) : 0.5,
      usage_count: typeof item.usage_count === 'number' ? item.usage_count : 0,
      correct_rate: typeof item.correct_rate === 'number' ? item.correct_rate : undefined,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString()
    }

    // Type-specific validation and conversion
    if (unifiedItem.type === 'mcq') {
      if (!isValidMCQItem(unifiedItem)) {
        // Try to fix common MCQ issues
        if (!Array.isArray(unifiedItem.options_json)) {
          unifiedItem.options_json = ['Option A', 'Option B', 'Option C', 'Option D']
        }
        if (!['A', 'B', 'C', 'D'].includes(unifiedItem.answer_json)) {
          unifiedItem.answer_json = 'A'
        }
      }
    }

    // Final validation
    if (!isValidItem(unifiedItem)) {
      return null
    }

    return unifiedItem

  } catch (error) {
    console.error('Error converting item to unified structure:', error)
    return null
  }
}

// Batch conversion with error handling
export function convertItemsBatch(items: any[]): {
  successful: Item[],
  failed: Array<{ original: any, error: string }>
} {
  const successful: Item[] = []
  const failed: Array<{ original: any, error: string }> = []

  for (const item of items) {
    try {
      const converted = convertToUnifiedStructure(item)
      if (converted) {
        successful.push(converted)
      } else {
        failed.push({ original: item, error: 'Failed to convert to unified structure' })
      }
    } catch (error) {
      failed.push({
        original: item,
        error: error instanceof Error ? error.message : 'Unknown conversion error'
      })
    }
  }

  return { successful, failed }
}

// Utility function to validate item distribution for paper assembly
export function validateItemDistribution(items: Item[], config: {
  total_items: number
  item_distribution: Record<string, number>
  difficulty_distribution: { easy: number, medium: number, hard: number }
}): {
  isValid: boolean
  issues: string[]
  suggestions: { type: string, available: number, required: number }[]
} {
  const issues: string[] = []
  const suggestions: { type: string, available: number, required: number }[] = []

  // Count available items by type and difficulty
  const availableByType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const availableByDifficulty = items.reduce((acc, item) => {
    if (item.difficulty_score <= 0.3) acc.easy++
    else if (item.difficulty_score <= 0.6) acc.medium++
    else acc.hard++
    return acc
  }, { easy: 0, medium: 0, hard: 0 })

  // Check item type distribution
  for (const [type, required] of Object.entries(config.item_distribution)) {
    const available = availableByType[type] || 0
    if (available < required) {
      issues.push(`Insufficient ${type} items: need ${required}, have ${available}`)
      suggestions.push({ type, available, required })
    }
  }

  // Check difficulty distribution
  const totalRequired = config.total_items
  const easyRequired = Math.round(totalRequired * config.difficulty_distribution.easy)
  const mediumRequired = Math.round(totalRequired * config.difficulty_distribution.medium)
  const hardRequired = Math.round(totalRequired * config.difficulty_distribution.hard)

  if (availableByDifficulty.easy < easyRequired) {
    issues.push(`Insufficient easy items: need ${easyRequired}, have ${availableByDifficulty.easy}`)
  }
  if (availableByDifficulty.medium < mediumRequired) {
    issues.push(`Insufficient medium items: need ${mediumRequired}, have ${availableByDifficulty.medium}`)
  }
  if (availableByDifficulty.hard < hardRequired) {
    issues.push(`Insufficient hard items: need ${hardRequired}, have ${availableByDifficulty.hard}`)
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  }
}