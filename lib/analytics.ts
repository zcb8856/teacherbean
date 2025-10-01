/**
 * TeacherBean Analytics 统一埋点系统
 *
 * 功能特性：
 * - 统一的事件追踪接口
 * - 本地开发使用 IndexedDB 存储
 * - 生产环境发送到 /api/log 端点
 * - 自动错误重试和批量上传
 * - 用户行为分析和性能监控
 */

import { createClient } from './supabase'

// ================================
// 事件类型定义
// ================================

export interface AnalyticsEvent {
  id: string
  event: string
  payload: Record<string, any>
  userId?: string
  sessionId: string
  timestamp: number
  environment: 'development' | 'production'
  userAgent: string
  url: string
  success: boolean
  duration?: number
  error?: {
    message: string
    stack?: string
    code?: string
  }
}

export interface EventPayload {
  // 通用字段
  module?: string
  feature?: string
  action?: string

  // 生成模块
  generationType?: 'lesson_plan' | 'reading' | 'questions' | 'dialog' | 'writing_task'
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  topic?: string
  itemCount?: number

  // 保存模块
  resourceType?: 'material' | 'assignment' | 'template'
  resourceId?: string
  sharing?: 'private' | 'school' | 'public'

  // 组卷模块
  questionTypes?: string[]
  totalQuestions?: number
  difficulty?: number[]
  assemblyStrategy?: 'exact' | 'fallback'

  // 批改模块
  submissionId?: string
  scoreType?: 'auto' | 'manual' | 'ai'
  rubricId?: string
  feedbackLength?: number

  // 导出模块
  exportFormat?: 'pdf' | 'docx' | 'json' | 'excel'
  exportType?: 'lesson_plan' | 'assignment' | 'report' | 'analytics'
  fileSize?: number

  // 性能数据
  loadTime?: number
  renderTime?: number
  apiResponseTime?: number

  // 额外元数据
  [key: string]: any
}

// ================================
// IndexedDB 存储管理
// ================================

class AnalyticsDB {
  private dbName = 'teacherbean_analytics'
  private version = 1
  private storeName = 'events'
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (typeof window === 'undefined') return // SSR 环境检查

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建事件存储
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('event', 'event', { unique: false })
          store.createIndex('userId', 'userId', { unique: false })
          store.createIndex('success', 'success', { unique: false })
        }
      }
    })
  }

  async saveEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) throw new Error('数据库初始化失败')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(event)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getEvents(filter?: {
    startTime?: number
    endTime?: number
    event?: string
    userId?: string
    success?: boolean
    limit?: number
  }): Promise<AnalyticsEvent[]> {
    if (!this.db) await this.init()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        let events = request.result as AnalyticsEvent[]

        // 应用筛选条件
        if (filter) {
          events = events.filter(event => {
            if (filter.startTime && event.timestamp < filter.startTime) return false
            if (filter.endTime && event.timestamp > filter.endTime) return false
            if (filter.event && event.event !== filter.event) return false
            if (filter.userId && event.userId !== filter.userId) return false
            if (filter.success !== undefined && event.success !== filter.success) return false
            return true
          })

          // 按时间倒序排列
          events.sort((a, b) => b.timestamp - a.timestamp)

          // 限制数量
          if (filter.limit) {
            events = events.slice(0, filter.limit)
          }
        }

        resolve(events)
      }
    })
  }

  async deleteOldEvents(olderThan: number): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('timestamp')
      const range = IDBKeyRange.upperBound(olderThan)
      const request = index.openCursor(range)

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }

  async getEventCount(): Promise<number> {
    if (!this.db) return 0

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}

// ================================
// 核心分析类
// ================================

class Analytics {
  private db: AnalyticsDB
  private sessionId: string
  private uploadQueue: AnalyticsEvent[] = []
  private isUploading = false
  private uploadTimer: NodeJS.Timeout | null = null
  private environment: 'development' | 'production'
  private userId?: string

  constructor() {
    this.db = new AnalyticsDB()
    this.sessionId = this.generateSessionId()
    this.environment = process.env.NODE_ENV === 'production' ? 'production' : 'development'

    // 初始化数据库
    this.init()
  }

  private async init() {
    if (typeof window === 'undefined') return

    try {
      await this.db.init()

      // 定期清理旧数据（保留30天）
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      await this.db.deleteOldEvents(thirtyDaysAgo)

      // 设置定期上传（生产环境）
      if (this.environment === 'production') {
        this.scheduleUpload()
      }

      // 获取用户信息
      await this.loadUserInfo()
    } catch (error) {
      console.warn('Analytics 初始化失败:', error)
    }
  }

  private async loadUserInfo() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        this.userId = user.id
      }
    } catch (error) {
      console.warn('获取用户信息失败:', error)
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 记录事件的核心方法
   */
  async log(event: string, payload: EventPayload = {}, startTime?: number): Promise<void> {
    try {
      const now = Date.now()
      const duration = startTime ? now - startTime : undefined

      const analyticsEvent: AnalyticsEvent = {
        id: `event_${now}_${Math.random().toString(36).substr(2, 9)}`,
        event,
        payload,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: now,
        environment: this.environment,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : '',
        success: !payload.error,
        duration,
        error: payload.error ? {
          message: payload.error.message || '未知错误',
          stack: payload.error.stack,
          code: payload.error.code
        } : undefined
      }

      // 本地存储
      await this.db.saveEvent(analyticsEvent)

      // 生产环境添加到上传队列
      if (this.environment === 'production') {
        this.uploadQueue.push(analyticsEvent)

        // 立即上传关键事件
        if (this.isCriticalEvent(event)) {
          await this.uploadEvents()
        }
      }

      // 开发环境控制台输出
      if (this.environment === 'development') {
        console.log(`📊 Analytics Event:`, {
          event,
          payload,
          duration: duration ? `${duration}ms` : undefined,
          success: analyticsEvent.success
        })
      }
    } catch (error) {
      console.error('Analytics 记录失败:', error)
    }
  }

  /**
   * 开始计时的便捷方法
   */
  startTiming(): number {
    return Date.now()
  }

  /**
   * 记录成功事件
   */
  async logSuccess(event: string, payload: EventPayload = {}, startTime?: number): Promise<void> {
    await this.log(event, { ...payload, success: true }, startTime)
  }

  /**
   * 记录错误事件
   */
  async logError(event: string, error: Error, payload: EventPayload = {}, startTime?: number): Promise<void> {
    await this.log(event, {
      ...payload,
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      }
    }, startTime)
  }

  /**
   * 判断是否为关键事件（需要立即上传）
   */
  private isCriticalEvent(event: string): boolean {
    const criticalEvents = [
      'generate_error',
      'save_error',
      'export_error',
      'auth_error',
      'payment_error'
    ]
    return criticalEvents.includes(event)
  }

  /**
   * 上传事件到服务器
   */
  private async uploadEvents(): Promise<void> {
    if (this.isUploading || this.uploadQueue.length === 0) return

    this.isUploading = true

    try {
      const eventsToUpload = [...this.uploadQueue]
      this.uploadQueue = []

      const response = await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToUpload })
      })

      if (!response.ok) {
        throw new Error(`上传失败: ${response.status}`)
      }

      console.log(`📤 已上传 ${eventsToUpload.length} 个事件`)
    } catch (error) {
      console.error('事件上传失败:', error)
      // 上传失败的事件重新加入队列
      this.uploadQueue.unshift(...this.uploadQueue)
    } finally {
      this.isUploading = false
    }
  }

  /**
   * 定期上传计划
   */
  private scheduleUpload(): void {
    // 每分钟尝试上传一次
    this.uploadTimer = setInterval(() => {
      if (this.uploadQueue.length > 0) {
        this.uploadEvents()
      }
    }, 60 * 1000)

    // 页面卸载时上传
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.uploadQueue.length > 0) {
          // 使用 sendBeacon 确保数据能够发送
          navigator.sendBeacon('/api/log', JSON.stringify({
            events: this.uploadQueue
          }))
        }
      })
    }
  }

  /**
   * 获取本地分析数据
   */
  async getAnalytics(filter?: {
    startTime?: number
    endTime?: number
    event?: string
    limit?: number
  }): Promise<AnalyticsEvent[]> {
    return this.db.getEvents(filter)
  }

  /**
   * 清理方法
   */
  destroy(): void {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer)
      this.uploadTimer = null
    }
  }
}

// ================================
// 预定义事件常量
// ================================

export const ANALYTICS_EVENTS = {
  // 生成模块
  GENERATE_START: 'generate_start',
  GENERATE_SUCCESS: 'generate_success',
  GENERATE_ERROR: 'generate_error',

  // 保存模块
  SAVE_START: 'save_start',
  SAVE_SUCCESS: 'save_success',
  SAVE_ERROR: 'save_error',

  // 组卷模块
  ASSEMBLE_START: 'assemble_start',
  ASSEMBLE_SUCCESS: 'assemble_success',
  ASSEMBLE_ERROR: 'assemble_error',
  ASSEMBLE_FALLBACK: 'assemble_fallback',

  // 批改模块
  GRADE_START: 'grade_start',
  GRADE_SUCCESS: 'grade_success',
  GRADE_ERROR: 'grade_error',

  // 导出模块
  EXPORT_START: 'export_start',
  EXPORT_SUCCESS: 'export_success',
  EXPORT_ERROR: 'export_error',

  // 用户行为
  PAGE_VIEW: 'page_view',
  FEATURE_CLICK: 'feature_click',
  SEARCH: 'search',
  FILTER_CHANGE: 'filter_change',

  // 性能监控
  PAGE_LOAD: 'page_load',
  API_CALL: 'api_call',
  COMPONENT_RENDER: 'component_render'
} as const

// ================================
// 全局实例和便捷方法
// ================================

let analyticsInstance: Analytics | null = null

export function getAnalytics(): Analytics {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics()
  }
  return analyticsInstance
}

/**
 * 统一的日志记录方法
 */
export async function log(event: string, payload: EventPayload = {}, startTime?: number): Promise<void> {
  const analytics = getAnalytics()
  await analytics.log(event, payload, startTime)
}

/**
 * 记录成功事件
 */
export async function logSuccess(event: string, payload: EventPayload = {}, startTime?: number): Promise<void> {
  const analytics = getAnalytics()
  await analytics.logSuccess(event, payload, startTime)
}

/**
 * 记录错误事件
 */
export async function logError(event: string, error: Error, payload: EventPayload = {}, startTime?: number): Promise<void> {
  const analytics = getAnalytics()
  await analytics.logError(event, error, payload, startTime)
}

/**
 * 开始计时
 */
export function startTiming(): number {
  return getAnalytics().startTiming()
}

/**
 * 获取分析数据
 */
export async function getAnalyticsData(filter?: {
  startTime?: number
  endTime?: number
  event?: string
  limit?: number
}): Promise<AnalyticsEvent[]> {
  const analytics = getAnalytics()
  return analytics.getAnalytics(filter)
}

// ================================
// React Hook
// ================================

import { useEffect, useCallback } from 'react'

export function useAnalytics() {
  const analytics = getAnalytics()

  useEffect(() => {
    return () => {
      analytics.destroy()
    }
  }, [analytics])

  const logEvent = useCallback((event: string, payload: EventPayload = {}, startTime?: number) => {
    return analytics.log(event, payload, startTime)
  }, [analytics])

  const logSuccess = useCallback((event: string, payload: EventPayload = {}, startTime?: number) => {
    return analytics.logSuccess(event, payload, startTime)
  }, [analytics])

  const logError = useCallback((event: string, error: Error, payload: EventPayload = {}, startTime?: number) => {
    return analytics.logError(event, error, payload, startTime)
  }, [analytics])

  return {
    log: logEvent,
    logSuccess,
    logError,
    startTiming: analytics.startTiming,
    getAnalytics: analytics.getAnalytics.bind(analytics)
  }
}

export default Analytics