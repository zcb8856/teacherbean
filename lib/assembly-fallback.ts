// Paper assembly fallback strategies for handling insufficient items

import type { Item } from '@/types/assess'

export interface AssemblyConfig {
  total_items: number
  item_distribution: Record<string, number>
  difficulty_distribution: { easy: number, medium: number, hard: number }
  level: string
  topics?: string[]
  tags?: string[]
}

export interface FallbackResult {
  success: boolean
  adjustedConfig?: AssemblyConfig
  selectedItems: Item[]
  fallbacksApplied: string[]
  warnings: string[]
}

// Main fallback orchestrator
export function assembleWithFallback(
  availableItems: Item[],
  originalConfig: AssemblyConfig
): FallbackResult {
  const fallbacksApplied: string[] = []
  const warnings: string[] = []
  let currentConfig = { ...originalConfig }

  // Strategy 1: Try exact requirements first
  let result = attemptAssembly(availableItems, currentConfig)
  if (result.selectedItems.length >= currentConfig.total_items) {
    return {
      success: true,
      selectedItems: result.selectedItems.slice(0, currentConfig.total_items),
      fallbacksApplied,
      warnings
    }
  }

  // Strategy 2: Relax difficulty requirements
  const difficultyRelaxed = relaxDifficultyDistribution(availableItems, currentConfig)
  if (difficultyRelaxed.adjusted) {
    currentConfig = difficultyRelaxed.config
    fallbacksApplied.push('difficulty_distribution_relaxed')
    warnings.push('Difficulty distribution was adjusted due to insufficient items')

    result = attemptAssembly(availableItems, currentConfig)
    if (result.selectedItems.length >= currentConfig.total_items) {
      return {
        success: true,
        adjustedConfig: currentConfig,
        selectedItems: result.selectedItems.slice(0, currentConfig.total_items),
        fallbacksApplied,
        warnings
      }
    }
  }

  // Strategy 3: Substitute similar item types
  const typeSubstituted = substituteItemTypes(availableItems, currentConfig)
  if (typeSubstituted.adjusted) {
    currentConfig = typeSubstituted.config
    fallbacksApplied.push('item_types_substituted')
    warnings.push('Some item types were substituted with similar types')

    result = attemptAssembly(availableItems, currentConfig)
    if (result.selectedItems.length >= currentConfig.total_items) {
      return {
        success: true,
        adjustedConfig: currentConfig,
        selectedItems: result.selectedItems.slice(0, currentConfig.total_items),
        fallbacksApplied,
        warnings
      }
    }
  }

  // Strategy 4: Reduce total items if still insufficient
  const reducedTotal = reduceTotal(availableItems, currentConfig)
  if (reducedTotal.adjusted) {
    currentConfig = reducedTotal.config
    fallbacksApplied.push('total_items_reduced')
    warnings.push(`Total items reduced from ${originalConfig.total_items} to ${currentConfig.total_items}`)

    result = attemptAssembly(availableItems, currentConfig)
    if (result.selectedItems.length >= currentConfig.total_items && currentConfig.total_items > 0) {
      return {
        success: true,
        adjustedConfig: currentConfig,
        selectedItems: result.selectedItems.slice(0, currentConfig.total_items),
        fallbacksApplied,
        warnings
      }
    }
  }

  // Strategy 5: Emergency fallback - use whatever is available
  const emergency = emergencyFallback(availableItems, currentConfig)
  fallbacksApplied.push('emergency_fallback')
  warnings.push('Used emergency fallback - paper may not meet original specifications')

  return {
    success: emergency.selectedItems.length > 0,
    adjustedConfig: emergency.config,
    selectedItems: emergency.selectedItems,
    fallbacksApplied,
    warnings
  }
}

// Basic assembly attempt without fallbacks
function attemptAssembly(items: Item[], config: AssemblyConfig): { selectedItems: Item[] } {
  const selectedItems: Item[] = []
  const availableByType = groupItemsByType(items)

  for (const [itemType, count] of Object.entries(config.item_distribution)) {
    if (count === 0) continue

    const typeItems = availableByType[itemType] || []
    const difficultyGroups = groupItemsByDifficulty(typeItems)

    const easyCount = Math.round(count * config.difficulty_distribution.easy)
    const mediumCount = Math.round(count * config.difficulty_distribution.medium)
    const hardCount = count - easyCount - mediumCount

    selectedItems.push(...selectFromGroup(difficultyGroups.easy, easyCount))
    selectedItems.push(...selectFromGroup(difficultyGroups.medium, mediumCount))
    selectedItems.push(...selectFromGroup(difficultyGroups.hard, hardCount))
  }

  return { selectedItems }
}

// Strategy 2: Relax difficulty distribution
function relaxDifficultyDistribution(
  items: Item[],
  config: AssemblyConfig
): { adjusted: boolean, config: AssemblyConfig } {
  const availableByDifficulty = groupItemsByDifficulty(items)
  const totalAvailable = items.length

  if (totalAvailable < config.total_items) {
    return { adjusted: false, config }
  }

  // Calculate actual available difficulty distribution
  const actualEasy = availableByDifficulty.easy.length / totalAvailable
  const actualMedium = availableByDifficulty.medium.length / totalAvailable
  const actualHard = availableByDifficulty.hard.length / totalAvailable

  // Check if we need to adjust
  const requiredEasy = config.total_items * config.difficulty_distribution.easy
  const requiredMedium = config.total_items * config.difficulty_distribution.medium
  const requiredHard = config.total_items * config.difficulty_distribution.hard

  if (availableByDifficulty.easy.length >= requiredEasy &&
      availableByDifficulty.medium.length >= requiredMedium &&
      availableByDifficulty.hard.length >= requiredHard) {
    return { adjusted: false, config }
  }

  // Adjust to actual distribution
  return {
    adjusted: true,
    config: {
      ...config,
      difficulty_distribution: {
        easy: Math.round(actualEasy * 100) / 100,
        medium: Math.round(actualMedium * 100) / 100,
        hard: Math.round(actualHard * 100) / 100
      }
    }
  }
}

// Strategy 3: Substitute item types
function substituteItemTypes(
  items: Item[],
  config: AssemblyConfig
): { adjusted: boolean, config: AssemblyConfig } {
  const substitutions = {
    'mcq': ['cloze', 'matching'],
    'cloze': ['mcq', 'error_correction'],
    'error_correction': ['cloze', 'mcq'],
    'matching': ['mcq', 'cloze'],
    'reading_q': ['writing_task'],
    'writing_task': ['reading_q']
  }

  const availableByType = groupItemsByType(items)
  const newDistribution = { ...config.item_distribution }
  let adjusted = false

  for (const [itemType, requiredCount] of Object.entries(config.item_distribution)) {
    if (requiredCount === 0) continue

    const available = availableByType[itemType]?.length || 0
    if (available < requiredCount) {
      const deficit = requiredCount - available
      const possibleSubs = substitutions[itemType] || []

      for (const subType of possibleSubs) {
        const subAvailable = availableByType[subType]?.length || 0
        const currentSubRequired = newDistribution[subType] || 0
        const canSubstitute = Math.min(deficit, subAvailable - currentSubRequired)

        if (canSubstitute > 0) {
          newDistribution[itemType] = available
          newDistribution[subType] = currentSubRequired + canSubstitute
          adjusted = true
          break
        }
      }
    }
  }

  return {
    adjusted,
    config: { ...config, item_distribution: newDistribution }
  }
}

// Strategy 4: Reduce total items
function reduceTotal(
  items: Item[],
  config: AssemblyConfig
): { adjusted: boolean, config: AssemblyConfig } {
  const maxPossible = Math.min(items.length, config.total_items)

  if (maxPossible >= config.total_items) {
    return { adjusted: false, config }
  }

  // Proportionally reduce item distribution
  const scaleFactor = maxPossible / config.total_items
  const newDistribution: Record<string, number> = {}

  for (const [itemType, count] of Object.entries(config.item_distribution)) {
    newDistribution[itemType] = Math.floor(count * scaleFactor)
  }

  // Ensure total adds up by adjusting the largest category
  const currentTotal = Object.values(newDistribution).reduce((sum, count) => sum + count, 0)
  if (currentTotal < maxPossible) {
    const largest = Object.entries(newDistribution)
      .sort(([,a], [,b]) => b - a)[0]
    if (largest) {
      newDistribution[largest[0]] += maxPossible - currentTotal
    }
  }

  return {
    adjusted: true,
    config: {
      ...config,
      total_items: maxPossible,
      item_distribution: newDistribution
    }
  }
}

// Strategy 5: Emergency fallback
function emergencyFallback(
  items: Item[],
  config: AssemblyConfig
): { config: AssemblyConfig, selectedItems: Item[] } {
  if (items.length === 0) {
    return {
      config: {
        ...config,
        total_items: 0,
        item_distribution: {},
        difficulty_distribution: { easy: 0, medium: 0, hard: 0 }
      },
      selectedItems: []
    }
  }

  const maxItems = Math.min(items.length, 10) // Take at most 10 items in emergency
  const selectedItems = items.slice(0, maxItems)

  const typeDistribution: Record<string, number> = {}
  selectedItems.forEach(item => {
    typeDistribution[item.type] = (typeDistribution[item.type] || 0) + 1
  })

  return {
    config: {
      ...config,
      total_items: selectedItems.length,
      item_distribution: typeDistribution,
      difficulty_distribution: { easy: 0.33, medium: 0.34, hard: 0.33 }
    },
    selectedItems
  }
}

// Helper functions
function groupItemsByType(items: Item[]): Record<string, Item[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {} as Record<string, Item[]>)
}

function groupItemsByDifficulty(items: Item[]): { easy: Item[], medium: Item[], hard: Item[] } {
  return items.reduce((acc, item) => {
    if (item.difficulty_score <= 0.3) acc.easy.push(item)
    else if (item.difficulty_score <= 0.6) acc.medium.push(item)
    else acc.hard.push(item)
    return acc
  }, { easy: [] as Item[], medium: [] as Item[], hard: [] as Item[] })
}

function selectFromGroup(items: Item[], count: number): Item[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}