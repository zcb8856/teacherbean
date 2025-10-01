import { RateLimitError, Logger } from './error-handler'

// 内存存储的速率限制器（生产环境建议使用 Redis）
class InMemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  get(key: string): { count: number; resetTime: number } | undefined {
    const entry = this.store.get(key)
    if (entry && entry.resetTime > Date.now()) {
      return entry
    }
    if (entry) {
      this.store.delete(key)
    }
    return undefined
  }

  set(key: string, count: number, windowMs: number): void {
    this.store.set(key, {
      count,
      resetTime: Date.now() + windowMs
    })
  }

  increment(key: string, windowMs: number): number {
    const entry = this.get(key)
    if (entry) {
      entry.count++
      this.store.set(key, entry)
      return entry.count
    } else {
      this.set(key, 1, windowMs)
      return 1
    }
  }

  // 清理过期条目
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }
}

// 全局存储实例
const store = new InMemoryStore()

// 每5分钟清理一次过期条目
setInterval(() => store.cleanup(), 5 * 60 * 1000)

// 速率限制配置
export interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
  message?: string // 自定义错误消息
  keyGenerator?: (request: Request) => string // 自定义key生成器
  skip?: (request: Request) => boolean // 跳过条件
}

// 预定义的速率限制配置
export const RATE_LIMIT_CONFIGS = {
  // 严格限制（登录、注册）
  strict: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
    message: '请求过于频繁，请15分钟后再试'
  },
  // 中等限制（API调用）
  moderate: {
    windowMs: 1 * 60 * 1000, // 1分钟
    maxRequests: 20,
    message: '请求过于频繁，请1分钟后再试'
  },
  // 宽松限制（读取操作）
  lenient: {
    windowMs: 1 * 60 * 1000, // 1分钟
    maxRequests: 100,
    message: '请求过于频繁，请稍后再试'
  },
  // 文件上传限制
  upload: {
    windowMs: 10 * 60 * 1000, // 10分钟
    maxRequests: 10,
    message: '文件上传过于频繁，请10分钟后再试'
  },
  // 生成类操作限制
  generate: {
    windowMs: 1 * 60 * 1000, // 1分钟
    maxRequests: 10,
    message: '生成请求过于频繁，请1分钟后再试'
  }
} as const

// 默认key生成器
function defaultKeyGenerator(request: Request): string {
  // 尝试获取用户ID（从认证头或其他地方）
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    // 这里可以解析JWT获取用户ID
    // 简化处理，使用auth header的hash
    return `user:${btoa(authHeader).slice(0, 10)}`
  }

  // 回退到IP地址
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  return `ip:${ip}`
}

// 速率限制中间件
export function rateLimit(config: RateLimitConfig) {
  return async (request: Request): Promise<void> => {
    // 检查是否应该跳过
    if (config.skip && config.skip(request)) {
      return
    }

    const keyGenerator = config.keyGenerator || defaultKeyGenerator
    const key = `rate_limit:${keyGenerator(request)}:${request.url}`

    const count = store.increment(key, config.windowMs)

    // 记录速率限制信息
    Logger.debug('速率限制检查', {
      key: key.replace(/rate_limit:/, ''),
      count,
      limit: config.maxRequests,
      windowMs: config.windowMs
    })

    if (count > config.maxRequests) {
      const entry = store.get(key)
      const resetTime = entry ? new Date(entry.resetTime) : new Date()

      Logger.warn('速率限制触发', {
        key: key.replace(/rate_limit:/, ''),
        count,
        limit: config.maxRequests,
        resetTime: resetTime.toISOString()
      })

      throw new RateLimitError(config.message)
    }
  }
}

// 组合多个速率限制器
export function combineRateLimits(...limiters: ((request: Request) => Promise<void>)[]) {
  return async (request: Request): Promise<void> => {
    for (const limiter of limiters) {
      await limiter(request)
    }
  }
}

// 基于用户的速率限制
export function userRateLimit(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (request: Request) => {
      // 这里应该从JWT或session中获取用户ID
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        // 简化处理
        return `user:${btoa(authHeader).slice(0, 10)}`
      }
      return 'anonymous'
    }
  })
}

// 基于IP的速率限制
export function ipRateLimit(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (request: Request) => {
      const forwarded = request.headers.get('x-forwarded-for')
      const realIp = request.headers.get('x-real-ip')
      const ip = forwarded?.split(',')[0] || realIp || 'unknown'
      return `ip:${ip}`
    }
  })
}

// 基于端点的速率限制
export function endpointRateLimit(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (request: Request) => {
      const url = new URL(request.url)
      const endpoint = `${request.method}:${url.pathname}`
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                 request.headers.get('x-real-ip') ||
                 'unknown'
      return `endpoint:${ip}:${endpoint}`
    }
  })
}

// 使用示例的装饰器
export function withRateLimit(config: RateLimitConfig) {
  const limiter = rateLimit(config)

  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const request = args[0] as Request
      await limiter(request)
      return method.apply(this, args)
    }
  }
}

// 导出常用的限制器
export const strictRateLimit = () => rateLimit(RATE_LIMIT_CONFIGS.strict)
export const moderateRateLimit = () => rateLimit(RATE_LIMIT_CONFIGS.moderate)
export const lenientRateLimit = () => rateLimit(RATE_LIMIT_CONFIGS.lenient)
export const uploadRateLimit = () => rateLimit(RATE_LIMIT_CONFIGS.upload)
export const generateRateLimit = () => rateLimit(RATE_LIMIT_CONFIGS.generate)