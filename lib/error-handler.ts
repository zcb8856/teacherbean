import { NextResponse } from 'next/server'
import { z } from 'zod'

// 错误类型定义
export class APIError extends Error {
  public statusCode: number
  public code: string
  public context?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.code = code
    this.context = context
  }
}

// 常见错误类型
export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', { details })
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = '未授权访问') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = '权限不足') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string = '资源') {
    super(`${resource}不存在`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = '请求过于频繁，请稍后再试') {
    super(message, 429, 'RATE_LIMIT_ERROR')
  }
}

// 日志记录
interface LogContext {
  userId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  method?: string
  url?: string
  duration?: number
  [key: string]: any
}

export class Logger {
  private static formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? JSON.stringify(context) : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${contextStr}`
  }

  static info(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(this.formatMessage('info', message, context))
    }
  }

  static warn(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  static error(message: string, error?: Error, context?: LogContext) {
    if (process.env.NODE_ENV !== 'test') {
      const errorContext = {
        ...context,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined
      }
      console.error(this.formatMessage('error', message, errorContext))
    }
  }

  static debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context))
    }
  }
}

// 错误处理中间件
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options?: {
    rateLimit?: (request: Request) => Promise<void>
    skipAuth?: boolean
  }
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as Request
    const startTime = Date.now()

    // 生成请求ID
    const requestId = crypto.randomUUID()

    // 提取请求信息
    const context: LogContext = {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown'
    }

    try {
      // 应用速率限制
      if (options?.rateLimit) {
        await options.rateLimit(request)
      }

      Logger.info(`API请求开始`, context)

      const response = await handler(...args)

      const duration = Date.now() - startTime
      Logger.info(`API请求完成`, {
        ...context,
        duration,
        status: response.status
      })

      // 添加请求ID到响应头
      response.headers.set('X-Request-ID', requestId)

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      if (error instanceof APIError) {
        Logger.warn(`API错误: ${error.message}`, {
          ...context,
          duration,
          errorCode: error.code,
          statusCode: error.statusCode,
          errorContext: error.context
        })

        return NextResponse.json({
          error: error.message,
          code: error.code,
          requestId,
          ...(process.env.NODE_ENV === 'development' && error.context ? { details: error.context } : {})
        }, {
          status: error.statusCode,
          headers: { 'X-Request-ID': requestId }
        })
      }

      // 未知错误
      Logger.error(`未知API错误`, error as Error, { ...context, duration })

      return NextResponse.json({
        error: process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : '服务器内部错误',
        code: 'INTERNAL_ERROR',
        requestId
      }, {
        status: 500,
        headers: { 'X-Request-ID': requestId }
      })
    }
  }
}

// Zod 验证错误处理
export function handleZodError(error: z.ZodError): ValidationError {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }))

  return new ValidationError('数据验证失败', details)
}

// 数据库错误处理
export function handleDatabaseError(error: any): APIError {
  // PostgreSQL 错误码
  const errorCode = error.code
  const errorMessage = error.message || '数据库操作失败'

  switch (errorCode) {
    case '23505': // unique_violation
      return new ConflictError('数据已存在，违反唯一性约束')
    case '23503': // foreign_key_violation
      return new ValidationError('外键约束违反，相关数据不存在')
    case '23514': // check_violation
      return new ValidationError('数据检查约束违反')
    case '42P01': // undefined_table
      return new APIError('数据表不存在', 500, 'TABLE_NOT_FOUND')
    case '42703': // undefined_column
      return new APIError('数据列不存在', 500, 'COLUMN_NOT_FOUND')
    default:
      Logger.error('未知数据库错误', error)
      return new APIError(
        process.env.NODE_ENV === 'development' ? errorMessage : '数据库操作失败',
        500,
        'DATABASE_ERROR'
      )
  }
}

// Supabase 错误处理
export function handleSupabaseError(error: any): APIError {
  if (error?.code === 'PGRST116') {
    return new NotFoundError()
  }

  if (error?.code === 'PGRST301') {
    return new AuthorizationError('无权访问此资源')
  }

  if (error?.message?.includes('JWT')) {
    return new AuthenticationError('身份验证失败')
  }

  Logger.error('Supabase错误', error)
  return new APIError(
    process.env.NODE_ENV === 'development' ? error.message : '服务错误',
    500,
    'SUPABASE_ERROR'
  )
}

// 使用示例的类型安全装饰器
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const request = args[0] as Request

      try {
        const body = await request.json()
        const validatedData = schema.parse(body)

        // 将验证后的数据添加到请求中
        ;(request as any).validatedData = validatedData

        return method.apply(this, args)
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw handleZodError(error)
        }
        throw error
      }
    }
  }
}