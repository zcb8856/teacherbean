import { createServerClient } from './supabase-server'
import { Logger } from './error-handler'

// 查询性能监控
export class QueryPerformanceMonitor {
  private static queries: Map<string, {
    count: number
    totalTime: number
    avgTime: number
    maxTime: number
    minTime: number
  }> = new Map()

  static track(queryName: string, duration: number) {
    const existing = this.queries.get(queryName) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      minTime: Number.MAX_SAFE_INTEGER
    }

    existing.count++
    existing.totalTime += duration
    existing.avgTime = existing.totalTime / existing.count
    existing.maxTime = Math.max(existing.maxTime, duration)
    existing.minTime = Math.min(existing.minTime, duration)

    this.queries.set(queryName, existing)

    // 如果查询时间过长，记录警告
    if (duration > 1000) {
      Logger.warn(`慢查询检测: ${queryName}`, {
        duration,
        avgTime: existing.avgTime,
        maxTime: existing.maxTime
      })
    }
  }

  static getStats() {
    return Object.fromEntries(this.queries)
  }

  static reset() {
    this.queries.clear()
  }
}

// 带性能监控的查询包装器
export function withQueryMonitoring<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now()

    try {
      const result = await queryFn()
      const duration = Date.now() - startTime
      QueryPerformanceMonitor.track(queryName, duration)
      resolve(result)
    } catch (error) {
      const duration = Date.now() - startTime
      QueryPerformanceMonitor.track(`${queryName}_error`, duration)
      reject(error)
    }
  })
}

// 优化的分页查询
export interface PaginationOptions {
  page: number
  limit: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function optimizedPagination<T>(
  tableName: string,
  options: PaginationOptions,
  selectQuery: string = '*',
  searchFields?: string[]
): Promise<PaginationResult<T>> {
  const {
    page = 1,
    limit = 10,
    orderBy = 'created_at',
    orderDirection = 'desc',
    search,
    filters = {}
  } = options

  const supabase = createServerClient()
  const offset = (page - 1) * limit

  return withQueryMonitoring(`${tableName}_paginated`, async () => {
    // 构建基础查询
    let query = supabase
      .from(tableName)
      .select(selectQuery, { count: 'exact' })

    // 应用过滤器
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })

    // 应用搜索
    if (search && searchFields && searchFields.length > 0) {
      const searchConditions = searchFields
        .map(field => `${field}.ilike.%${search}%`)
        .join(',')
      query = query.or(searchConditions)
    }

    // 应用排序和分页
    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: data as T[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  })
}

// 批量操作优化
export async function optimizedBatchInsert<T extends Record<string, any>>(
  tableName: string,
  records: T[],
  batchSize: number = 100
): Promise<T[]> {
  const supabase = createServerClient()
  const results: T[] = []

  // 分批处理
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)

    const result = await withQueryMonitoring(
      `${tableName}_batch_insert_${batch.length}`,
      async () => {
        const { data, error } = await supabase
          .from(tableName)
          .insert(batch as any)
          .select()

        if (error) {
          throw error
        }

        return data
      }
    )

    results.push(...(result as T[]))
  }

  return results
}

// 缓存查询结果
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

export function withCache<T>(
  cacheKey: string,
  ttlMs: number = 5 * 60 * 1000 // 默认5分钟
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]): Promise<T> {
      const key = `${cacheKey}:${JSON.stringify(args)}`
      const cached = queryCache.get(key)

      // 检查缓存是否有效
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        Logger.debug('缓存命中', { cacheKey: key })
        return cached.data
      }

      // 执行实际查询
      const result = await method.apply(this, args)

      // 缓存结果
      queryCache.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl: ttlMs
      })

      Logger.debug('缓存设置', { cacheKey: key, ttl: ttlMs })
      return result
    }
  }
}

// 清除缓存
export function clearCache(pattern?: string) {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key)
      }
    }
  } else {
    queryCache.clear()
  }
}

// 预加载相关数据
export async function preloadRelations<T>(
  baseData: T[],
  relations: {
    field: string
    table: string
    select: string
    foreignKey: string
    localKey: string
  }[]
): Promise<T[]> {
  const supabase = createServerClient()

  for (const relation of relations) {
    const ids = baseData
      .map(item => (item as any)[relation.localKey])
      .filter(Boolean)

    if (ids.length === 0) continue

    const { data: relatedData, error } = await supabase
      .from(relation.table)
      .select(relation.select)
      .in(relation.foreignKey, ids)

    if (error) {
      Logger.error('预加载关联数据失败', error)
      continue
    }

    // 将关联数据映射到基础数据
    const relatedMap = new Map()
    relatedData?.forEach(item => {
      const key = (item as any)[relation.foreignKey]
      if (!relatedMap.has(key)) {
        relatedMap.set(key, [])
      }
      relatedMap.get(key).push(item)
    })

    baseData.forEach(item => {
      const localValue = (item as any)[relation.localKey]
      ;(item as any)[relation.field] = relatedMap.get(localValue) || []
    })
  }

  return baseData
}

// 数据库健康检查
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy'
  checks: Record<string, boolean>
  performance: Record<string, number>
}> {
  const supabase = createServerClient()
  const checks: Record<string, boolean> = {}
  const performance: Record<string, number> = {}

  try {
    // 连接测试
    const start = Date.now()
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    performance.connectionTime = Date.now() - start
    checks.connection = !error

    // 查询性能统计
    const stats = QueryPerformanceMonitor.getStats()
    performance.averageQueryTime = Object.values(stats)
      .reduce((sum, stat) => sum + stat.avgTime, 0) / Object.keys(stats).length || 0

    // 整体状态
    const allChecksPass = Object.values(checks).every(Boolean)
    const performanceGood = performance.averageQueryTime < 500

    return {
      status: allChecksPass && performanceGood ? 'healthy' : 'unhealthy',
      checks,
      performance
    }
  } catch (error) {
    Logger.error('数据库健康检查失败', error as Error)
    return {
      status: 'unhealthy',
      checks: { connection: false },
      performance: {}
    }
  }
}

// 索引建议
export function analyzeQueries(): {
  recommendations: string[]
  slowQueries: Array<{ name: string; avgTime: number; count: number }>
} {
  const stats = QueryPerformanceMonitor.getStats()
  const recommendations: string[] = []
  const slowQueries: Array<{ name: string; avgTime: number; count: number }> = []

  Object.entries(stats).forEach(([name, stat]) => {
    if (stat.avgTime > 1000) {
      slowQueries.push({ name, avgTime: stat.avgTime, count: stat.count })
    }

    if (stat.avgTime > 500 && stat.count > 10) {
      recommendations.push(
        `考虑为查询 ${name} 添加索引，平均耗时 ${stat.avgTime}ms`
      )
    }
  })

  // 通用建议
  if (slowQueries.length > 0) {
    recommendations.push('发现慢查询，建议检查数据库索引')
  }

  return { recommendations, slowQueries }
}