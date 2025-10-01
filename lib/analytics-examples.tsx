/**
 * TeacherBean Analytics 关键操作埋点示例
 *
 * 本文件展示如何在各个关键业务操作中集成分析事件追踪
 * 涵盖：生成、保存、组卷、批改、导出等核心功能
 */

import React, { useState } from 'react'
import { useAnalytics, ANALYTICS_EVENTS, log, logSuccess, logError, startTiming } from './analytics'

// ================================
// 1. 生成模块埋点示例
// ================================

export const LessonPlanGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { log: logEvent } = useAnalytics()

  const handleGenerate = async (formData: any) => {
    const startTime = startTiming()

    // 记录开始事件
    await logEvent(ANALYTICS_EVENTS.GENERATE_START, {
      module: 'generate',
      feature: 'lesson_plan',
      action: 'start',
      generationType: 'lesson_plan',
      level: formData.level,
      topic: formData.topic,
      duration: formData.duration
    }, startTime)

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`生成失败: ${response.status}`)
      }

      const lessonPlan = await response.json()

      // 记录成功事件
      await logSuccess(ANALYTICS_EVENTS.GENERATE_SUCCESS, {
        module: 'generate',
        feature: 'lesson_plan',
        action: 'success',
        generationType: 'lesson_plan',
        level: formData.level,
        topic: formData.topic,
        contentLength: JSON.stringify(lessonPlan).length,
        activitiesCount: lessonPlan.activities?.length || 0
      }, startTime)

      return lessonPlan

    } catch (error) {
      // 记录错误事件
      await logError(ANALYTICS_EVENTS.GENERATE_ERROR, error as Error, {
        module: 'generate',
        feature: 'lesson_plan',
        action: 'error',
        generationType: 'lesson_plan',
        level: formData.level,
        topic: formData.topic
      }, startTime)

      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      {/* UI 组件 */}
      <button onClick={() => handleGenerate({ level: 'A2', topic: '日常对话' })}>
        {isGenerating ? '生成中...' : '生成教案'}
      </button>
    </div>
  )
}

// ================================
// 2. 保存模块埋点示例
// ================================

export const MaterialSaver = () => {
  const handleSave = async (material: any, sharingLevel: 'private' | 'school' | 'public') => {
    const startTime = startTiming()

    // 记录保存开始
    await log(ANALYTICS_EVENTS.SAVE_START, {
      module: 'save',
      feature: 'material',
      action: 'start',
      resourceType: material.type,
      sharing: sharingLevel,
      contentSize: JSON.stringify(material).length
    }, startTime)

    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...material,
          shared: sharingLevel
        })
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      const savedMaterial = await response.json()

      // 记录保存成功
      await logSuccess(ANALYTICS_EVENTS.SAVE_SUCCESS, {
        module: 'save',
        feature: 'material',
        action: 'success',
        resourceType: material.type,
        resourceId: savedMaterial.id,
        sharing: sharingLevel,
        contentSize: JSON.stringify(material).length
      }, startTime)

      return savedMaterial

    } catch (error) {
      // 记录保存错误
      await logError(ANALYTICS_EVENTS.SAVE_ERROR, error as Error, {
        module: 'save',
        feature: 'material',
        action: 'error',
        resourceType: material.type,
        sharing: sharingLevel
      }, startTime)

      throw error
    }
  }

  return { handleSave }
}

// ================================
// 3. 组卷模块埋点示例
// ================================

export const TestAssembler = () => {
  const handleAssemble = async (assemblyConfig: any) => {
    const startTime = startTiming()

    // 记录组卷开始
    await log(ANALYTICS_EVENTS.ASSEMBLE_START, {
      module: 'assemble',
      feature: 'test',
      action: 'start',
      questionTypes: assemblyConfig.types,
      totalQuestions: assemblyConfig.totalCount,
      difficulty: assemblyConfig.difficulties,
      level: assemblyConfig.level
    }, startTime)

    try {
      const response = await fetch('/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assemblyConfig)
      })

      if (!response.ok) {
        throw new Error(`组卷失败: ${response.status}`)
      }

      const result = await response.json()

      // 检查是否使用了降级策略
      if (result.fallbackUsed) {
        await log(ANALYTICS_EVENTS.ASSEMBLE_FALLBACK, {
          module: 'assemble',
          feature: 'test',
          action: 'fallback',
          originalConfig: assemblyConfig,
          finalConfig: result.finalConfig,
          fallbackReason: result.fallbackReason,
          assemblyStrategy: 'fallback'
        }, startTime)
      }

      // 记录组卷成功
      await logSuccess(ANALYTICS_EVENTS.ASSEMBLE_SUCCESS, {
        module: 'assemble',
        feature: 'test',
        action: 'success',
        questionTypes: result.questionTypes,
        totalQuestions: result.items.length,
        assemblyStrategy: result.fallbackUsed ? 'fallback' : 'exact',
        difficulty: result.averageDifficulty,
        itemsById: result.items.map((item: any) => item.id)
      }, startTime)

      return result

    } catch (error) {
      // 记录组卷错误
      await logError(ANALYTICS_EVENTS.ASSEMBLE_ERROR, error as Error, {
        module: 'assemble',
        feature: 'test',
        action: 'error',
        questionTypes: assemblyConfig.types,
        totalQuestions: assemblyConfig.totalCount
      }, startTime)

      throw error
    }
  }

  return { handleAssemble }
}

// ================================
// 4. 批改模块埋点示例
// ================================

export const GradingSystem = () => {
  const handleGrade = async (submissionId: string, gradingType: 'auto' | 'manual' | 'ai') => {
    const startTime = startTiming()

    // 记录批改开始
    await log(ANALYTICS_EVENTS.GRADE_START, {
      module: 'grade',
      feature: 'submission',
      action: 'start',
      submissionId,
      scoreType: gradingType
    }, startTime)

    try {
      const response = await fetch('/api/submissions/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          type: gradingType
        })
      })

      if (!response.ok) {
        throw new Error(`批改失败: ${response.status}`)
      }

      const gradingResult = await response.json()

      // 记录批改成功
      await logSuccess(ANALYTICS_EVENTS.GRADE_SUCCESS, {
        module: 'grade',
        feature: 'submission',
        action: 'success',
        submissionId,
        scoreType: gradingType,
        finalScore: gradingResult.score,
        maxScore: gradingResult.maxScore,
        feedbackLength: gradingResult.feedback?.length || 0,
        rubricId: gradingResult.rubricId
      }, startTime)

      return gradingResult

    } catch (error) {
      // 记录批改错误
      await logError(ANALYTICS_EVENTS.GRADE_ERROR, error as Error, {
        module: 'grade',
        feature: 'submission',
        action: 'error',
        submissionId,
        scoreType: gradingType
      }, startTime)

      throw error
    }
  }

  return { handleGrade }
}

// ================================
// 5. 导出模块埋点示例
// ================================

export const DocumentExporter = () => {
  const handleExport = async (data: any, format: 'pdf' | 'docx' | 'json' | 'excel', type: string) => {
    const startTime = startTiming()

    // 记录导出开始
    await log(ANALYTICS_EVENTS.EXPORT_START, {
      module: 'export',
      feature: 'document',
      action: 'start',
      exportFormat: format,
      exportType: type as "analytics" | "assignment" | "lesson_plan" | "report",
      dataSize: JSON.stringify(data).length
    }, startTime)

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          format,
          type
        })
      })

      if (!response.ok) {
        throw new Error(`导出失败: ${response.status}`)
      }

      const blob = await response.blob()
      const fileSize = blob.size

      // 触发下载
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export.${format}`
      a.click()
      URL.revokeObjectURL(url)

      // 记录导出成功
      await logSuccess(ANALYTICS_EVENTS.EXPORT_SUCCESS, {
        module: 'export',
        feature: 'document',
        action: 'success',
        exportFormat: format,
        exportType: type as "analytics" | "assignment" | "lesson_plan" | "report",
        fileSize,
        dataSize: JSON.stringify(data).length
      }, startTime)

      return { success: true, fileSize }

    } catch (error) {
      // 记录导出错误
      await logError(ANALYTICS_EVENTS.EXPORT_ERROR, error as Error, {
        module: 'export',
        feature: 'document',
        action: 'error',
        exportFormat: format,
        exportType: type as "analytics" | "assignment" | "lesson_plan" | "report"
      }, startTime)

      throw error
    }
  }

  return { handleExport }
}

// ================================
// 6. 页面级别埋点示例
// ================================

export const PageAnalytics: React.FC<{ pageName: string, children: React.ReactNode }> = ({
  pageName,
  children
}) => {
  const { log: logEvent } = useAnalytics()

  React.useEffect(() => {
    const startTime = Date.now()

    // 记录页面访问
    logEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
      module: 'navigation',
      feature: 'page_view',
      action: 'view',
      pageName,
      url: window.location.href,
      referrer: document.referrer
    })

    // 页面卸载时记录停留时间
    const handleUnload = () => {
      const duration = Date.now() - startTime
      logEvent(ANALYTICS_EVENTS.PAGE_LOAD, {
        module: 'performance',
        feature: 'page_load',
        action: 'unload',
        pageName,
        duration
      })
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [pageName, logEvent])

  return <>{children}</>
}

// ================================
// 7. 用户交互埋点示例
// ================================

export const AnalyticsButton: React.FC<{
  eventName?: string
  feature?: string
  children: React.ReactNode
  onClick?: () => void
}> = ({ eventName = ANALYTICS_EVENTS.FEATURE_CLICK, feature, children, onClick }) => {
  const { log: logEvent } = useAnalytics()

  const handleClick = async () => {
    await logEvent(eventName, {
      module: 'interaction',
      feature,
      action: 'click',
      buttonText: typeof children === 'string' ? children : undefined
    })

    onClick?.()
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}

// ================================
// 8. API 调用埋点装饰器
// ================================

export function withAnalytics<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  eventPrefix: string,
  feature: string
): T {
  return (async (...args: any[]) => {
    const startTime = startTiming()

    // 记录 API 调用开始
    await log(`${eventPrefix}_start`, {
      module: 'api',
      feature,
      action: 'start',
      args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg).length : arg)
    }, startTime)

    try {
      const result = await apiFunction(...args)

      // 记录 API 调用成功
      await logSuccess(`${eventPrefix}_success`, {
        module: 'api',
        feature,
        action: 'success',
        resultSize: typeof result === 'object' ? JSON.stringify(result).length : undefined
      }, startTime)

      return result

    } catch (error) {
      // 记录 API 调用错误
      await logError(`${eventPrefix}_error`, error as Error, {
        module: 'api',
        feature,
        action: 'error'
      }, startTime)

      throw error
    }
  }) as T
}

// 使用示例：
const generateLessonPlan = withAnalytics(
  async (data: any) => {
    // 原始 API 调用逻辑
    const response = await fetch('/api/generate/lesson', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return response.json()
  },
  'generate_lesson',
  'lesson_plan'
)

// ================================
// 9. 搜索和筛选埋点
// ================================

export const SearchAnalytics = () => {
  const { log: logEvent } = useAnalytics()

  const handleSearch = async (query: string, filters: any, module: string) => {
    await logEvent(ANALYTICS_EVENTS.SEARCH, {
      module,
      feature: 'search',
      action: 'search',
      searchQuery: query,
      queryLength: query.length,
      filtersUsed: Object.keys(filters),
      filterCount: Object.keys(filters).length
    })
  }

  const handleFilterChange = async (filterName: string, filterValue: any, module: string) => {
    await logEvent(ANALYTICS_EVENTS.FILTER_CHANGE, {
      module,
      feature: 'filter',
      action: 'change',
      filterName,
      filterValue: typeof filterValue === 'object' ? JSON.stringify(filterValue) : filterValue
    })
  }

  return { handleSearch, handleFilterChange }
}

export default {
  LessonPlanGenerator,
  MaterialSaver,
  TestAssembler,
  GradingSystem,
  DocumentExporter,
  PageAnalytics,
  AnalyticsButton,
  withAnalytics,
  SearchAnalytics
}