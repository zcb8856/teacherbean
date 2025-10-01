import { Logger } from './error-handler'

// 缓存配置接口
export interface CacheConfig {
  ttl: number // 生存时间（毫秒）
  maxSize?: number // 最大缓存项数
  namespace?: string // 命名空间
  persistent?: boolean // 是否持久化到 localStorage
}

// 缓存项
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  accessed: number
}

// 内存缓存实现
export class MemoryCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private accessQueue = new Map<string, number>() // LRU追踪
  private config: Required<CacheConfig>

  constructor(config: CacheConfig) {
    this.config = {
      maxSize: 1000,
      namespace: 'default',
      persistent: false,
      ...config
    }

    // 定期清理过期项
    setInterval(() => this.cleanup(), 5 * 60 * 1000) // 每5分钟清理一次
  }

  // 设置缓存
  set(key: string, data: T, customTtl?: number): void {
    const fullKey = this.getKey(key)
    const ttl = customTtl || this.config.ttl
    const timestamp = Date.now()

    const item: CacheItem<T> = {
      data,
      timestamp,
      ttl,
      accessed: timestamp
    }

    this.cache.set(fullKey, item)
    this.accessQueue.set(fullKey, timestamp)

    // 检查大小限制
    if (this.cache.size > this.config.maxSize) {
      this.evictLRU()
    }

    // 持久化
    if (this.config.persistent) {
      this.persistToStorage(fullKey, item)
    }

    Logger.debug('缓存设置', { key: fullKey, ttl })
  }

  // 获取缓存
  get(key: string): T | null {
    const fullKey = this.getKey(key)
    const item = this.cache.get(fullKey)

    if (!item) {
      Logger.debug('缓存未命中', { key: fullKey })
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key)
      Logger.debug('缓存过期', { key: fullKey })
      return null
    }

    // 更新访问时间
    const now = Date.now()
    item.accessed = now
    this.accessQueue.set(fullKey, now)

    Logger.debug('缓存命中', { key: fullKey })
    return item.data
  }

  // 删除缓存
  delete(key: string): boolean {
    const fullKey = this.getKey(key)
    const deleted = this.cache.delete(fullKey)
    this.accessQueue.delete(fullKey)

    if (this.config.persistent) {
      localStorage.removeItem(fullKey)
    }

    if (deleted) {
      Logger.debug('缓存删除', { key: fullKey })
    }

    return deleted
  }

  // 检查是否存在
  has(key: string): boolean {
    const fullKey = this.getKey(key)
    const item = this.cache.get(fullKey)

    if (!item) return false

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key)
      return false
    }

    return true
  }

  // 清空缓存
  clear(): void {
    if (this.config.persistent) {
      // 清理 localStorage 中的相关项
      for (const key of this.cache.keys()) {
        localStorage.removeItem(key)
      }
    }

    this.cache.clear()
    this.accessQueue.clear()
    Logger.debug('缓存清空', { namespace: this.config.namespace })
  }

  // 获取统计信息
  stats(): {
    size: number
    maxSize: number
    hitRate: number
    oldestItem: string | null
    memoryUsage: number
  } {
    const oldestEntry = Array.from(this.accessQueue.entries())
      .sort(([, a], [, b]) => a - b)[0]

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // 需要额外追踪才能计算
      oldestItem: oldestEntry?.[0] || null,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  // 私有方法
  private getKey(key: string): string {
    return `${this.config.namespace}:${key}`
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        this.accessQueue.delete(key)

        if (this.config.persistent) {
          localStorage.removeItem(key)
        }

        cleaned++
      }
    }

    if (cleaned > 0) {
      Logger.debug('缓存清理完成', { cleaned, remaining: this.cache.size })
    }
  }

  private evictLRU(): void {
    // 找到最少使用的项
    const lruEntry = Array.from(this.accessQueue.entries())
      .sort(([, a], [, b]) => a - b)[0]

    if (lruEntry) {
      const [key] = lruEntry
      this.cache.delete(key)
      this.accessQueue.delete(key)

      if (this.config.persistent) {
        localStorage.removeItem(key)
      }

      Logger.debug('LRU缓存淘汰', { key })
    }
  }

  private persistToStorage(key: string, item: CacheItem<T>): void {
    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      Logger.warn('缓存持久化失败', error as Error)
    }
  }

  private estimateMemoryUsage(): number {
    let size = 0
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2 // 字符串大小估算
      size += JSON.stringify(item).length * 2
    }
    return size
  }
}

// 全局缓存实例
const caches = new Map<string, MemoryCache>()

// 获取或创建缓存实例
export function getCache<T = any>(namespace: string, config?: Partial<CacheConfig>): MemoryCache<T> {
  if (!caches.has(namespace)) {
    const defaultConfig: CacheConfig = {
      ttl: 5 * 60 * 1000, // 5分钟
      maxSize: 1000,
      namespace,
      persistent: false
    }

    caches.set(namespace, new MemoryCache({ ...defaultConfig, ...config }))
  }

  return caches.get(namespace) as MemoryCache<T>
}

// 缓存装饰器
export function cached<T extends (...args: any[]) => Promise<any>>(
  cacheKey: string | ((...args: Parameters<T>) => string),
  config?: Partial<CacheConfig>
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value as T
    const cache = getCache(propertyName, config)

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey

      // 尝试从缓存获取
      const cached = cache.get(key)
      if (cached !== null) {
        return cached
      }

      // 执行原方法
      const result = await method.apply(this, args)

      // 缓存结果
      cache.set(key, result)

      return result
    }
  }
}

// React Query 风格的缓存 Hook
export function useCachedQuery<T>(
  key: string | string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
  }
) {
  const [data, setData] = React.useState<T | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const cache = getCache('react-query', {
    ttl: options?.cacheTime || 5 * 60 * 1000
  })

  const queryKey = Array.isArray(key) ? key.join(':') : key

  React.useEffect(() => {
    if (options?.enabled === false) return

    setIsLoading(true)
    setError(null)

    // 尝试从缓存获取
    const cached = cache.get(queryKey)
    if (cached) {
      setData(cached)
      setIsLoading(false)
      return
    }

    // 执行查询
    queryFn()
      .then(result => {
        cache.set(queryKey, result)
        setData(result)
      })
      .catch(err => {
        setError(err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [queryKey, options?.enabled])

  const refetch = React.useCallback(() => {
    cache.delete(queryKey)
    setIsLoading(true)
    setError(null)

    queryFn()
      .then(result => {
        cache.set(queryKey, result)
        setData(result)
      })
      .catch(err => {
        setError(err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [queryKey])

  return {
    data,
    isLoading,
    error,
    refetch
  }
}

// 预设缓存策略
export const CACHE_STRATEGIES = {
  // 用户数据缓存
  user: {
    ttl: 10 * 60 * 1000, // 10分钟
    maxSize: 100,
    persistent: true
  },

  // API 响应缓存
  api: {
    ttl: 2 * 60 * 1000, // 2分钟
    maxSize: 500,
    persistent: false
  },

  // 静态数据缓存
  static: {
    ttl: 60 * 60 * 1000, // 1小时
    maxSize: 200,
    persistent: true
  },

  // 会话缓存
  session: {
    ttl: 30 * 60 * 1000, // 30分钟
    maxSize: 50,
    persistent: false
  }
} as const

// 缓存管理器
export class CacheManager {
  static invalidatePattern(pattern: string): void {
    for (const cache of caches.values()) {
      // 这里需要实现模式匹配删除
      // 由于 Map 不支持模式匹配，可以考虑升级为更复杂的实现
    }
  }

  static getGlobalStats(): Record<string, any> {
    const stats: Record<string, any> = {}

    for (const [namespace, cache] of caches.entries()) {
      stats[namespace] = cache.stats()
    }

    return stats
  }

  static clearAll(): void {
    for (const cache of caches.values()) {
      cache.clear()
    }
    caches.clear()
  }
}

// 导入 React（如果在 React 环境中使用）
import React from 'react'