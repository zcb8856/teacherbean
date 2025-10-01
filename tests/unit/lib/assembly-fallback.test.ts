import { describe, it, expect } from 'vitest'
import {
  assembleWithFallback,
  type AssemblyConfig,
  type FallbackResult
} from '@/lib/assembly-fallback'
import type { Item } from '@/types/assess'

describe('Paper Assembly Fallback Strategies', () => {
  // Helper function to create test items
  function createTestItem(
    id: string,
    type: string,
    difficulty: number,
    level: string = 'A2'
  ): Item {
    return {
      id,
      owner_id: 'test_user',
      type: type as any,
      level: level as any,
      stem: `Test question ${id}`,
      answer_json: 'A',
      tags: [],
      difficulty_score: difficulty,
      usage_count: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  }

  // Create sample item set
  const sampleItems: Item[] = [
    // MCQ items (6 total)
    createTestItem('mcq1', 'mcq', 0.2), // easy
    createTestItem('mcq2', 'mcq', 0.2), // easy
    createTestItem('mcq3', 'mcq', 0.5), // medium
    createTestItem('mcq4', 'mcq', 0.5), // medium
    createTestItem('mcq5', 'mcq', 0.8), // hard
    createTestItem('mcq6', 'mcq', 0.8), // hard

    // Cloze items (3 total)
    createTestItem('cloze1', 'cloze', 0.3), // easy
    createTestItem('cloze2', 'cloze', 0.4), // medium
    createTestItem('cloze3', 'cloze', 0.7), // hard

    // Reading items (2 total)
    createTestItem('reading1', 'reading_q', 0.4), // medium
    createTestItem('reading2', 'reading_q', 0.6) // hard
  ]

  describe('Successful Assembly (No Fallback Needed)', () => {
    it('should assemble paper when sufficient items are available', () => {
      const config: AssemblyConfig = {
        total_items: 6,
        item_distribution: { mcq: 4, cloze: 2 },
        difficulty_distribution: { easy: 0.33, medium: 0.34, hard: 0.33 },
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(6)
      expect(result.fallbacksApplied).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
      expect(result.adjustedConfig).toBeUndefined()

      // Verify item type distribution
      const typeCount = result.selectedItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      expect(typeCount.mcq).toBe(4)
      expect(typeCount.cloze).toBe(2)
    })

    it('should handle edge case with minimal requirements', () => {
      const config: AssemblyConfig = {
        total_items: 1,
        item_distribution: { mcq: 1 },
        difficulty_distribution: { easy: 1, medium: 0, hard: 0 },
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(1)
      expect(result.selectedItems[0].type).toBe('mcq')
      expect(result.selectedItems[0].difficulty_score).toBeLessThanOrEqual(0.3)
    })
  })

  describe('Difficulty Distribution Fallback', () => {
    it('should relax difficulty distribution when specific difficulties are insufficient', () => {
      const config: AssemblyConfig = {
        total_items: 8,
        item_distribution: { mcq: 6, cloze: 2 },
        difficulty_distribution: { easy: 0.75, medium: 0.125, hard: 0.125 }, // Need 6 easy items but only have 3
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems.length).toBeGreaterThanOrEqual(8)
      expect(result.fallbacksApplied).toContain('difficulty_distribution_relaxed')
      expect(result.warnings.some(w => w.includes('Difficulty distribution'))).toBe(true)
      expect(result.adjustedConfig).toBeDefined()
      expect(result.adjustedConfig?.difficulty_distribution).not.toEqual(config.difficulty_distribution)
    })

    it('should not apply difficulty fallback when distribution is achievable', () => {
      const config: AssemblyConfig = {
        total_items: 6,
        item_distribution: { mcq: 6 },
        difficulty_distribution: { easy: 0.33, medium: 0.33, hard: 0.34 }, // 2 easy, 2 medium, 2 hard
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, config)

      expect(result.success).toBe(true)
      expect(result.fallbacksApplied).not.toContain('difficulty_distribution_relaxed')
    })
  })

  describe('Item Type Substitution Fallback', () => {
    it('should substitute item types when specific types are insufficient', () => {
      const config: AssemblyConfig = {
        total_items: 8,
        item_distribution: { mcq: 4, cloze: 2, writing_task: 2 }, // Need writing_task but have none
        difficulty_distribution: { easy: 0.25, medium: 0.5, hard: 0.25 },
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems.length).toBeGreaterThanOrEqual(8)
      expect(result.fallbacksApplied).toContain('item_types_substituted')
      expect(result.warnings.some(w => w.includes('substituted'))).toBe(true)
      expect(result.adjustedConfig).toBeDefined()

      // Should not have writing_task items since they were substituted
      const hasWritingTask = result.selectedItems.some(item => item.type === 'writing_task')
      expect(hasWritingTask).toBe(false)
    })

    it('should prefer MCQ->cloze substitution', () => {
      const limitedItems = [
        createTestItem('mcq1', 'mcq', 0.5),
        createTestItem('mcq2', 'mcq', 0.5),
        createTestItem('cloze1', 'cloze', 0.5),
        createTestItem('cloze2', 'cloze', 0.5),
        createTestItem('cloze3', 'cloze', 0.5)
      ]

      const config: AssemblyConfig = {
        total_items: 5,
        item_distribution: { mcq: 4, cloze: 1 }, // Need 4 MCQ but only have 2
        difficulty_distribution: { easy: 0, medium: 1, hard: 0 },
        level: 'A2'
      }

      const result = assembleWithFallback(limitedItems, config)

      expect(result.success).toBe(true)
      expect(result.fallbacksApplied).toContain('item_types_substituted')

      const typeCount = result.selectedItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      expect(typeCount.mcq + typeCount.cloze).toBe(5)
      expect(typeCount.mcq).toBeLessThan(4) // Should have been reduced
      expect(typeCount.cloze).toBeGreaterThan(1) // Should have been increased
    })
  })

  describe('Total Items Reduction Fallback', () => {
    it('should reduce total items when insufficient items available', () => {
      const limitedItems = sampleItems.slice(0, 5) // Only 5 items available

      const config: AssemblyConfig = {
        total_items: 10, // Want 10 but only have 5
        item_distribution: { mcq: 6, cloze: 2, reading_q: 2 },
        difficulty_distribution: { easy: 0.3, medium: 0.4, hard: 0.3 },
        level: 'A2'
      }

      const result = assembleWithFallback(limitedItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(5)
      expect(result.fallbacksApplied).toContain('total_items_reduced')
      expect(result.warnings.some(w => w.includes('reduced from 10 to 5'))).toBe(true)
      expect(result.adjustedConfig?.total_items).toBe(5)
    })

    it('should proportionally reduce item distribution', () => {
      const limitedItems = [
        createTestItem('mcq1', 'mcq', 0.5),
        createTestItem('mcq2', 'mcq', 0.5),
        createTestItem('cloze1', 'cloze', 0.5)
      ]

      const config: AssemblyConfig = {
        total_items: 6, // Want 6 but only have 3
        item_distribution: { mcq: 4, cloze: 2 }, // 4:2 ratio
        difficulty_distribution: { easy: 0, medium: 1, hard: 0 },
        level: 'A2'
      }

      const result = assembleWithFallback(limitedItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(3)
      expect(result.adjustedConfig?.total_items).toBe(3)

      // Should maintain proportional distribution
      const distribution = result.adjustedConfig?.item_distribution
      expect(distribution?.mcq).toBeGreaterThan(distribution?.cloze || 0)
    })
  })

  describe('Emergency Fallback', () => {
    it('should apply emergency fallback when all other strategies fail', () => {
      const veryLimitedItems = [
        createTestItem('item1', 'mcq', 0.5)
      ]

      const config: AssemblyConfig = {
        total_items: 20,
        item_distribution: { writing_task: 10, reading_q: 10 }, // Types not available
        difficulty_distribution: { easy: 0, medium: 0, hard: 1 }, // Hard items not available
        level: 'A2'
      }

      const result = assembleWithFallback(veryLimitedItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(1)
      expect(result.fallbacksApplied).toContain('emergency_fallback')
      expect(result.warnings.some(w => w.includes('emergency fallback'))).toBe(true)
      expect(result.adjustedConfig?.total_items).toBe(1)
    })

    it('should handle empty item list gracefully', () => {
      const config: AssemblyConfig = {
        total_items: 5,
        item_distribution: { mcq: 5 },
        difficulty_distribution: { easy: 1, medium: 0, hard: 0 },
        level: 'A2'
      }

      const result = assembleWithFallback([], config)

      expect(result.success).toBe(false)
      expect(result.selectedItems).toHaveLength(0)
      expect(result.fallbacksApplied).toContain('emergency_fallback')
    })

    it('should limit emergency fallback to maximum 10 items', () => {
      const manyItems = Array.from({ length: 20 }, (_, i) =>
        createTestItem(`item${i}`, 'mcq', 0.5)
      )

      const config: AssemblyConfig = {
        total_items: 50,
        item_distribution: { writing_task: 50 }, // Type not available
        difficulty_distribution: { easy: 1, medium: 0, hard: 0 },
        level: 'A2'
      }

      const result = assembleWithFallback(manyItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(10) // Limited to 10
      expect(result.fallbacksApplied).toContain('emergency_fallback')
    })
  })

  describe('Multiple Fallback Strategies', () => {
    it('should apply multiple fallback strategies in sequence', () => {
      const challengingItems = [
        createTestItem('mcq1', 'mcq', 0.8), // Only hard MCQ
        createTestItem('cloze1', 'cloze', 0.2), // Only easy cloze
        createTestItem('cloze2', 'cloze', 0.2)
      ]

      const config: AssemblyConfig = {
        total_items: 10,
        item_distribution: { mcq: 5, cloze: 3, writing_task: 2 },
        difficulty_distribution: { easy: 0.8, medium: 0.1, hard: 0.1 }, // Need mostly easy but MCQ is hard
        level: 'A2'
      }

      const result = assembleWithFallback(challengingItems, config)

      expect(result.success).toBe(true)
      expect(result.fallbacksApplied.length).toBeGreaterThan(1)
      expect(result.fallbacksApplied).toContain('total_items_reduced')
      expect(result.selectedItems).toHaveLength(3) // Reduced to available items
    })

    it('should stop applying fallbacks once assembly succeeds', () => {
      const config: AssemblyConfig = {
        total_items: 6,
        item_distribution: { mcq: 4, cloze: 2 },
        difficulty_distribution: { easy: 0.9, medium: 0.05, hard: 0.05 }, // Need mostly easy
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(6)

      // Should only apply difficulty relaxation, not further fallbacks
      expect(result.fallbacksApplied).toHaveLength(1)
      expect(result.fallbacksApplied).toContain('difficulty_distribution_relaxed')
      expect(result.fallbacksApplied).not.toContain('total_items_reduced')
    })
  })

  describe('Fallback Result Structure', () => {
    it('should return proper result structure for successful assembly', () => {
      const config: AssemblyConfig = {
        total_items: 5,
        item_distribution: { mcq: 5 },
        difficulty_distribution: { easy: 0.2, medium: 0.6, hard: 0.2 },
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, config)

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('selectedItems')
      expect(result).toHaveProperty('fallbacksApplied')
      expect(result).toHaveProperty('warnings')
      expect(Array.isArray(result.selectedItems)).toBe(true)
      expect(Array.isArray(result.fallbacksApplied)).toBe(true)
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('should include adjusted config only when modifications were made', () => {
      const perfectConfig: AssemblyConfig = {
        total_items: 3,
        item_distribution: { mcq: 3 },
        difficulty_distribution: { easy: 0.33, medium: 0.34, hard: 0.33 },
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, perfectConfig)
      expect(result.adjustedConfig).toBeUndefined()

      const problematicConfig: AssemblyConfig = {
        total_items: 15, // More than available
        item_distribution: { mcq: 15 },
        difficulty_distribution: { easy: 1, medium: 0, hard: 0 },
        level: 'A2'
      }

      const fallbackResult = assembleWithFallback(sampleItems, problematicConfig)
      expect(fallbackResult.adjustedConfig).toBeDefined()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle config with zero total items', () => {
      const config: AssemblyConfig = {
        total_items: 0,
        item_distribution: {},
        difficulty_distribution: { easy: 0, medium: 0, hard: 0 },
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(0)
    })

    it('should handle items with extreme difficulty scores', () => {
      const extremeItems = [
        createTestItem('extreme1', 'mcq', 0), // Minimum difficulty
        createTestItem('extreme2', 'mcq', 1), // Maximum difficulty
        createTestItem('extreme3', 'mcq', 0.5) // Normal difficulty
      ]

      const config: AssemblyConfig = {
        total_items: 3,
        item_distribution: { mcq: 3 },
        difficulty_distribution: { easy: 0.33, medium: 0.34, hard: 0.33 },
        level: 'A2'
      }

      const result = assembleWithFallback(extremeItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(3)
    })

    it('should handle malformed difficulty distribution', () => {
      const config: AssemblyConfig = {
        total_items: 3,
        item_distribution: { mcq: 3 },
        difficulty_distribution: { easy: 0.5, medium: 0.3, hard: 0.3 }, // Sums to 1.1
        level: 'A2'
      }

      const result = assembleWithFallback(sampleItems, config)

      expect(result.success).toBe(true)
      expect(result.selectedItems).toHaveLength(3)
    })
  })
})