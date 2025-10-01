// @ts-nocheck
/**
 * TeacherBean Analytics 日志收集 API
 *
 * 功能：
 * - 接收客户端发送的分析事件
 * - 批量处理事件数据
 * - 存储到 Supabase 数据库
 * - 性能和错误监控
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { z } from 'zod'

// ================================
// 数据验证 Schema
// ================================

const AnalyticsEventSchema = z.object({
  id: z.string(),
  event: z.string(),
  payload: z.record(z.any()),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.number(),
  environment: z.enum(['development', 'production']),
  userAgent: z.string(),
  url: z.string(),
  success: z.boolean(),
  duration: z.number().optional(),
  error: z.object({
    message: z.string(),
    stack: z.string().optional(),
    code: z.string().optional()
  }).optional()
})

const LogRequestSchema = z.object({
  events: z.array(AnalyticsEventSchema).min(1).max(100) // 限制批量大小
})

// ================================
// 事件处理器
// ================================

class AnalyticsProcessor {
  private supabase = createServerClient()

  /**
   * 处理单个事件
   */
  private async processEvent(event: z.infer<typeof AnalyticsEventSchema>) {
    try {
      // 提取关键信息用于数据库存储
      const dbEvent = {
        id: event.id,
        event_name: event.event,
        user_id: event.userId,
        session_id: event.sessionId,
        timestamp: new Date(event.timestamp).toISOString(),
        environment: event.environment,
        url: event.url,
        success: event.success,
        duration_ms: event.duration,

        // 有效载荷（JSONB 格式）
        payload: event.payload,

        // 错误信息
        error_message: event.error?.message,
        error_code: event.error?.code,

        // 用户代理解析
        user_agent: event.userAgent,

        // 自动提取的元数据
        module: event.payload.module,
        feature: event.payload.feature,
        action: event.payload.action,

        created_at: new Date().toISOString()
      }

      // 插入到 analytics_events 表
      const { error } = await this.supabase
        .from('analytics_events')
        .insert(dbEvent)

      if (error) {
        throw error
      }

      return { success: true, eventId: event.id }
    } catch (error) {
      console.error(`处理事件失败 ${event.id}:`, error)
      return {
        success: false,
        eventId: event.id,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 批量处理事件
   */
  async processEvents(events: z.infer<typeof AnalyticsEventSchema>[]): Promise<{
    successful: number
    failed: number
    errors: Array<{ eventId: string, error: string }>
  }> {
    const results = await Promise.allSettled(
      events.map(event => this.processEvent(event))
    )

    let successful = 0
    let failed = 0
    const errors: Array<{ eventId: string, error: string }> = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successful++
      } else {
        failed++
        const event = events[index]
        const errorMessage = result.status === 'fulfilled'
          ? result.value.error || '处理失败'
          : result.reason?.message || '未知错误'

        errors.push({
          eventId: event.id,
          error: errorMessage
        })
      }
    })

    return { successful, failed, errors }
  }

  /**
   * 验证用户权限
   */
  private async validateUser(userId?: string): Promise<boolean> {
    if (!userId) return true // 允许匿名事件

    try {
      const { data: user } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      return !!user
    } catch {
      return false
    }
  }

  /**
   * 检查速率限制
   */
  private async checkRateLimit(sessionId: string): Promise<boolean> {
    try {
      // 检查过去5分钟内的事件数量
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

      const { count } = await this.supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .gte('timestamp', fiveMinutesAgo)

      // 限制每5分钟最多1000个事件
      return (count || 0) < 1000
    } catch {
      return true // 检查失败时允许通过
    }
  }
}

// ================================
// API 路由处理器
// ================================

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json()

    // 验证请求数据
    const validationResult = LogRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '请求数据格式错误',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { events } = validationResult.data
    const processor = new AnalyticsProcessor()

    // 检查速率限制
    const sessionId = events[0]?.sessionId
    if (sessionId) {
      const withinLimit = await processor.checkRateLimit(sessionId)
      if (!withinLimit) {
        return NextResponse.json(
          { error: '请求频率过高，请稍后重试' },
          { status: 429 }
        )
      }
    }

    // 验证用户权限（如果有用户ID）
    const userId = events[0]?.userId
    if (userId) {
      const isValidUser = await processor.validateUser(userId)
      if (!isValidUser) {
        return NextResponse.json(
          { error: '用户验证失败' },
          { status: 403 }
        )
      }
    }

    // 处理事件
    const result = await processor.processEvents(events)

    // 返回处理结果
    return NextResponse.json({
      message: '事件处理完成',
      summary: {
        total: events.length,
        successful: result.successful,
        failed: result.failed
      },
      errors: result.errors.length > 0 ? result.errors : undefined
    })

  } catch (error) {
    console.error('Analytics API 错误:', error)

    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' ?
          (error instanceof Error ? error.message : '未知错误') :
          undefined
      },
      { status: 500 }
    )
  }
}

// ================================
// 健康检查端点
// ================================

export async function GET() {
  try {
    const supabase = createServerClient()

    // 简单的数据库连接测试
    const { data, error } = await supabase
      .from('analytics_events')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      totalEvents: data?.length || 0
    })

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// ================================
// 仅允许 POST 和 GET 方法
// ================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}