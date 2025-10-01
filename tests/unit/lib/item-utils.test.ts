import { describe, it, expect } from 'vitest'
import {
  isValidItem,
  isValidMCQItem,
  isValidClozeItem,
  isValidMatchingItem,
  convertToUnifiedStructure,
  convertItemsBatch,
  validateItemDistribution
} from '@/lib/item-utils'
import type { Item } from '@/types/assess'

describe('Item Type Guards', () => {
  const validBaseItem = {
    id: 'item_123',
    owner_id: 'user_456',
    type: 'mcq',
    level: 'A2',
    stem: 'What is the capital of France?',
    answer_json: 'A',
    tags: ['geography', 'capitals'],
    difficulty_score: 0.4,
    usage_count: 5,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  describe('isValidItem', () => {
    it('should validate a correct item structure', () => {
      expect(isValidItem(validBaseItem)).toBe(true)
    })

    it('should reject items with missing required fields', () => {
      const invalidItems = [
        { ...validBaseItem, id: undefined },
        { ...validBaseItem, owner_id: undefined },
        { ...validBaseItem, type: undefined },
        { ...validBaseItem, level: undefined },
        { ...validBaseItem, stem: undefined },
        { ...validBaseItem, answer_json: undefined },
        { ...validBaseItem, tags: undefined },
        { ...validBaseItem, difficulty_score: undefined },
        { ...validBaseItem, usage_count: undefined },
        { ...validBaseItem, created_at: undefined },
        { ...validBaseItem, updated_at: undefined }
      ]

      invalidItems.forEach(item => {
        expect(isValidItem(item)).toBe(false)
      })
    })

    it('should reject items with invalid field types', () => {
      const invalidItems = [
        { ...validBaseItem, id: 123 },
        { ...validBaseItem, owner_id: 123 },
        { ...validBaseItem, stem: 123 },
        { ...validBaseItem, tags: 'not-array' },
        { ...validBaseItem, difficulty_score: 'not-number' },
        { ...validBaseItem, usage_count: 'not-number' },
        { ...validBaseItem, created_at: 123 },
        { ...validBaseItem, updated_at: 123 }
      ]

      invalidItems.forEach(item => {
        expect(isValidItem(item)).toBe(false)
      })
    })

    it('should reject items with invalid enum values', () => {
      const invalidItems = [
        { ...validBaseItem, type: 'invalid_type' },
        { ...validBaseItem, level: 'X1' }
      ]

      invalidItems.forEach(item => {
        expect(isValidItem(item)).toBe(false)
      })
    })

    it('should reject items with difficulty_score out of range', () => {
      const invalidItems = [
        { ...validBaseItem, difficulty_score: -0.1 },
        { ...validBaseItem, difficulty_score: 1.1 }
      ]

      invalidItems.forEach(item => {
        expect(isValidItem(item)).toBe(false)
      })
    })

    it('should accept items with boundary difficulty scores', () => {
      const boundaryItems = [
        { ...validBaseItem, difficulty_score: 0 },
        { ...validBaseItem, difficulty_score: 1 }
      ]

      boundaryItems.forEach(item => {
        expect(isValidItem(item)).toBe(true)
      })
    })

    it('should handle null and undefined inputs', () => {
      expect(isValidItem(null)).toBe(false)
      expect(isValidItem(undefined)).toBe(false)
      expect(isValidItem({})).toBe(false)
      expect(isValidItem('string')).toBe(false)
      expect(isValidItem(123)).toBe(false)
    })
  })

  describe('isValidMCQItem', () => {
    const validMCQItem = {
      ...validBaseItem,
      type: 'mcq',
      options_json: ['Paris', 'London', 'Berlin', 'Madrid'],
      answer_json: 'A'
    }

    it('should validate a correct MCQ item', () => {
      expect(isValidMCQItem(validMCQItem)).toBe(true)
    })

    it('should reject non-MCQ items', () => {
      const nonMCQItem = { ...validMCQItem, type: 'cloze' }
      expect(isValidMCQItem(nonMCQItem)).toBe(false)
    })

    it('should reject MCQ items without options', () => {
      const withoutOptions = { ...validMCQItem, options_json: undefined }
      expect(isValidMCQItem(withoutOptions)).toBe(false)
    })

    it('should reject MCQ items with invalid options format', () => {
      const invalidOptions = [
        { ...validMCQItem, options_json: 'not-array' },
        { ...validMCQItem, options_json: ['only-one'] },
        { ...validMCQItem, options_json: [123, 456] },
        { ...validMCQItem, options_json: [] }
      ]

      invalidOptions.forEach(item => {
        expect(isValidMCQItem(item)).toBe(false)
      })
    })

    it('should reject MCQ items with invalid answer format', () => {
      const invalidAnswers = [
        { ...validMCQItem, answer_json: 'E' },
        { ...validMCQItem, answer_json: 'a' },
        { ...validMCQItem, answer_json: 123 },
        { ...validMCQItem, answer_json: null }
      ]

      invalidAnswers.forEach(item => {
        expect(isValidMCQItem(item)).toBe(false)
      })
    })

    it('should accept all valid answer options', () => {
      const validAnswers = ['A', 'B', 'C', 'D']

      validAnswers.forEach(answer => {
        const item = { ...validMCQItem, answer_json: answer }
        expect(isValidMCQItem(item)).toBe(true)
      })
    })
  })

  describe('isValidClozeItem', () => {
    const validClozeItem = {
      ...validBaseItem,
      type: 'cloze',
      stem: 'The capital of France is ___.',
      answer_json: 'Paris'
    }

    it('should validate a correct cloze item', () => {
      expect(isValidClozeItem(validClozeItem)).toBe(true)
    })

    it('should reject non-cloze items', () => {
      const nonClozeItem = { ...validClozeItem, type: 'mcq' }
      expect(isValidClozeItem(nonClozeItem)).toBe(false)
    })

    it('should reject cloze items without blanks in stem', () => {
      const withoutBlanks = { ...validClozeItem, stem: 'No blanks here.' }
      expect(isValidClozeItem(withoutBlanks)).toBe(false)
    })

    it('should accept cloze items with array answers', () => {
      const arrayAnswerItem = {
        ...validClozeItem,
        stem: 'The ___ and ___ are important.',
        answer_json: ['sun', 'moon']
      }
      expect(isValidClozeItem(arrayAnswerItem)).toBe(true)
    })

    it('should accept cloze items with string answers', () => {
      expect(isValidClozeItem(validClozeItem)).toBe(true)
    })
  })

  describe('isValidMatchingItem', () => {
    const validMatchingItem = {
      ...validBaseItem,
      type: 'matching',
      options_json: {
        left: ['Apple', 'Dog', 'Car'],
        right: ['Fruit', 'Animal', 'Vehicle']
      },
      answer_json: { 'Apple': 'Fruit', 'Dog': 'Animal', 'Car': 'Vehicle' }
    }

    it('should validate a correct matching item', () => {
      expect(isValidMatchingItem(validMatchingItem)).toBe(true)
    })

    it('should reject non-matching items', () => {
      const nonMatchingItem = { ...validMatchingItem, type: 'mcq' }
      expect(isValidMatchingItem(nonMatchingItem)).toBe(false)
    })

    it('should reject matching items without proper options structure', () => {
      const invalidOptions = [
        { ...validMatchingItem, options_json: undefined },
        { ...validMatchingItem, options_json: 'string' },
        { ...validMatchingItem, options_json: { left: [] } },
        { ...validMatchingItem, options_json: { right: [] } },
        { ...validMatchingItem, options_json: { left: 'not-array', right: [] } },
        { ...validMatchingItem, options_json: { left: [], right: 'not-array' } }
      ]

      invalidOptions.forEach(item => {
        expect(isValidMatchingItem(item)).toBe(false)
      })
    })

    it('should reject matching items without proper answer structure', () => {
      const invalidAnswers = [
        { ...validMatchingItem, answer_json: undefined },
        { ...validMatchingItem, answer_json: 'string' },
        { ...validMatchingItem, answer_json: [] }
      ]

      invalidAnswers.forEach(item => {
        expect(isValidMatchingItem(item)).toBe(false)
      })
    })
  })
})

describe('Item Conversion Functions', () => {
  describe('convertToUnifiedStructure', () => {
    it('should convert a valid item correctly', () => {
      const inputItem = {
        id: 'test_item',
        owner_id: 'test_user',
        type: 'mcq',
        level: 'B1',
        stem: 'Test question?',
        options_json: ['A', 'B', 'C', 'D'],
        answer_json: 'A',
        tags: ['test'],
        difficulty_score: 0.6,
        usage_count: 3,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      const result = convertToUnifiedStructure(inputItem)
      expect(result).toEqual(inputItem)
    })

    it('should handle missing optional fields with defaults', () => {
      const minimalItem = {
        id: 'test_item',
        owner_id: 'test_user',
        type: 'mcq',
        level: 'A2',
        stem: 'Test question?',
        answer_json: 'A',
        tags: ['test'],
        difficulty_score: 0.5,
        usage_count: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      const result = convertToUnifiedStructure(minimalItem)
      expect(result).toBeTruthy()
      expect(result?.explanation).toBeUndefined()
      expect(result?.source).toBeUndefined()
      expect(result?.correct_rate).toBeUndefined()
    })

    it('should generate default values for missing required fields', () => {
      const incompleteItem = {
        type: 'mcq',
        stem: 'Test question?'
      }

      const result = convertToUnifiedStructure(incompleteItem)
      expect(result).toBeTruthy()
      expect(result?.id).toMatch(/^item_/)
      expect(result?.owner_id).toBe('')
      expect(result?.level).toBe('A2')
      expect(result?.tags).toEqual([])
      expect(result?.difficulty_score).toBe(0.5)
      expect(result?.usage_count).toBe(0)
    })

    it('should normalize difficulty score to valid range', () => {
      const invalidScores = [
        { difficulty_score: -0.5, expected: 0 },
        { difficulty_score: 1.5, expected: 1 },
        { difficulty_score: 0.3, expected: 0.3 }
      ]

      invalidScores.forEach(({ difficulty_score, expected }) => {
        const item = { difficulty_score }
        const result = convertToUnifiedStructure(item)
        expect(result?.difficulty_score).toBe(expected)
      })
    })

    it('should fix MCQ items with invalid options/answers', () => {
      const invalidMCQItem = {
        type: 'mcq',
        stem: 'Test question?',
        answer_json: 'invalid',
        options_json: 'not-array'
      }

      const result = convertToUnifiedStructure(invalidMCQItem)
      expect(result).toBeTruthy()
      expect(Array.isArray(result?.options_json)).toBe(true)
      expect(['A', 'B', 'C', 'D']).toContain(result?.answer_json)
    })

    it('should handle null and invalid inputs', () => {
      const invalidInputs = [null, undefined, 'string', 123, []]

      invalidInputs.forEach(input => {
        expect(convertToUnifiedStructure(input)).toBeNull()
      })
    })

    it('should handle conversion errors gracefully', () => {
      const problematicItem = {
        get id() { throw new Error('Access error') }
      }

      expect(convertToUnifiedStructure(problematicItem)).toBeNull()
    })
  })

  describe('convertItemsBatch', () => {
    it('should convert multiple valid items successfully', () => {
      const items = [
        {
          id: 'item1',
          type: 'mcq',
          stem: 'Question 1?',
          answer_json: 'A',
          options_json: ['A', 'B', 'C', 'D']
        },
        {
          id: 'item2',
          type: 'cloze',
          stem: 'Fill the ___.',
          answer_json: 'blank'
        }
      ]

      const result = convertItemsBatch(items)
      expect(result.successful).toHaveLength(2)
      expect(result.failed).toHaveLength(0)
      expect(result.successful[0].id).toBe('item1')
      expect(result.successful[1].id).toBe('item2')
    })

    it('should handle mixed valid and invalid items', () => {
      const items = [
        { id: 'valid_item', type: 'mcq', stem: 'Valid question?' },
        null,
        { id: 'another_valid', type: 'cloze', stem: 'Valid ___' },
        'invalid_string'
      ]

      const result = convertItemsBatch(items)
      expect(result.successful).toHaveLength(2)
      expect(result.failed).toHaveLength(2)
      expect(result.failed[0].original).toBeNull()
      expect(result.failed[1].original).toBe('invalid_string')
    })

    it('should handle empty array', () => {
      const result = convertItemsBatch([])
      expect(result.successful).toHaveLength(0)
      expect(result.failed).toHaveLength(0)
    })

    it('should capture conversion errors', () => {
      const problematicItem = {
        get id() { throw new Error('Access error') }
      }

      const result = convertItemsBatch([problematicItem])
      expect(result.successful).toHaveLength(0)
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].error).toContain('Failed to convert')
    })
  })
})

describe('Item Distribution Validation', () => {
  const sampleItems: Item[] = [
    {
      id: 'mcq1', owner_id: 'user1', type: 'mcq', level: 'A2', stem: 'MCQ Easy',
      answer_json: 'A', tags: [], difficulty_score: 0.2, usage_count: 0,
      created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 'mcq2', owner_id: 'user1', type: 'mcq', level: 'A2', stem: 'MCQ Medium',
      answer_json: 'B', tags: [], difficulty_score: 0.5, usage_count: 0,
      created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 'mcq3', owner_id: 'user1', type: 'mcq', level: 'A2', stem: 'MCQ Hard',
      answer_json: 'C', tags: [], difficulty_score: 0.8, usage_count: 0,
      created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 'cloze1', owner_id: 'user1', type: 'cloze', level: 'A2', stem: 'Cloze ___',
      answer_json: 'answer', tags: [], difficulty_score: 0.4, usage_count: 0,
      created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z'
    }
  ]

  describe('validateItemDistribution', () => {
    it('should validate sufficient items for simple config', () => {
      const config = {
        total_items: 3,
        item_distribution: { mcq: 2, cloze: 1 },
        difficulty_distribution: { easy: 0.33, medium: 0.33, hard: 0.34 }
      }

      const result = validateItemDistribution(sampleItems, config)
      expect(result.isValid).toBe(true)
      expect(result.issues).toHaveLength(0)
      expect(result.suggestions).toHaveLength(0)
    })

    it('should detect insufficient items by type', () => {
      const config = {
        total_items: 10,
        item_distribution: { mcq: 5, cloze: 3, writing_task: 2 },
        difficulty_distribution: { easy: 0.3, medium: 0.4, hard: 0.3 }
      }

      const result = validateItemDistribution(sampleItems, config)
      expect(result.isValid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues.some(issue => issue.includes('Insufficient mcq items'))).toBe(true)
      expect(result.issues.some(issue => issue.includes('Insufficient writing_task items'))).toBe(true)

      const mcqSuggestion = result.suggestions.find(s => s.type === 'mcq')
      expect(mcqSuggestion).toBeTruthy()
      expect(mcqSuggestion?.available).toBe(3)
      expect(mcqSuggestion?.required).toBe(5)
    })

    it('should detect insufficient items by difficulty', () => {
      const config = {
        total_items: 4,
        item_distribution: { mcq: 3, cloze: 1 },
        difficulty_distribution: { easy: 0.75, medium: 0.25, hard: 0 } // Need 3 easy, 1 medium
      }

      const result = validateItemDistribution(sampleItems, config)
      expect(result.isValid).toBe(false)
      expect(result.issues.some(issue => issue.includes('Insufficient easy items'))).toBe(true)
    })

    it('should handle edge case with no items', () => {
      const config = {
        total_items: 1,
        item_distribution: { mcq: 1 },
        difficulty_distribution: { easy: 1, medium: 0, hard: 0 }
      }

      const result = validateItemDistribution([], config)
      expect(result.isValid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should handle config with zero requirements', () => {
      const config = {
        total_items: 0,
        item_distribution: {},
        difficulty_distribution: { easy: 0, medium: 0, hard: 0 }
      }

      const result = validateItemDistribution(sampleItems, config)
      expect(result.isValid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should correctly count items by difficulty boundaries', () => {
      const boundaryItems: Item[] = [
        {
          id: 'boundary1', owner_id: 'user1', type: 'mcq', level: 'A2', stem: 'Boundary 0.3',
          answer_json: 'A', tags: [], difficulty_score: 0.3, usage_count: 0,
          created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z'
        },
        {
          id: 'boundary2', owner_id: 'user1', type: 'mcq', level: 'A2', stem: 'Boundary 0.6',
          answer_json: 'A', tags: [], difficulty_score: 0.6, usage_count: 0,
          created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z'
        }
      ]

      const config = {
        total_items: 2,
        item_distribution: { mcq: 2 },
        difficulty_distribution: { easy: 0.5, medium: 0.5, hard: 0 }
      }

      const result = validateItemDistribution(boundaryItems, config)
      expect(result.isValid).toBe(true)
    })
  })
})