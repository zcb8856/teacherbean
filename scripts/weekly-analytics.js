#!/usr/bin/env node

/**
 * TeacherBean 周报分析脚本
 *
 * 功能：
 * - 查询近7天各模块使用次数Top5
 * - 计算各功能的成功率和失败率
 * - 生成用户行为分析报告
 * - 识别性能瓶颈和错误热点
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// ================================
// 配置信息
// ================================

const config = {
  // Supabase 配置
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // 报告配置
  reportDays: 7,
  topLimit: 5,
  outputDir: path.join(process.cwd(), 'analytics-reports'),

  // 时间范围
  get startDate() {
    const date = new Date()
    date.setDate(date.getDate() - this.reportDays)
    date.setHours(0, 0, 0, 0)
    return date.toISOString()
  },

  get endDate() {
    const date = new Date()
    date.setHours(23, 59, 59, 999)
    return date.toISOString()
  }
}

// ================================
// 数据库查询类
// ================================

class AnalyticsQuery {
  constructor() {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('缺少 Supabase 配置。请设置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量。')
    }

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
  }

  /**
   * 获取基础统计数据
   */
  async getBasicStats() {
    const { data, error } = await this.supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', config.startDate)
      .lte('timestamp', config.endDate)

    if (error) throw error

    const total = data.length
    const successful = data.filter(event => event.success).length
    const failed = total - successful
    const successRate = total > 0 ? (successful / total * 100).toFixed(2) : '0.00'

    return {
      total,
      successful,
      failed,
      successRate: parseFloat(successRate),
      uniqueUsers: new Set(data.map(event => event.user_id).filter(Boolean)).size,
      uniqueSessions: new Set(data.map(event => event.session_id)).size
    }
  }

  /**
   * 获取各模块使用次数Top5
   */
  async getTopModules() {
    const { data, error } = await this.supabase
      .from('analytics_events')
      .select('module, event_name, success')
      .gte('timestamp', config.startDate)
      .lte('timestamp', config.endDate)
      .not('module', 'is', null)

    if (error) throw error

    const moduleStats = {}

    data.forEach(event => {
      const { module, success } = event

      if (!moduleStats[module]) {
        moduleStats[module] = {
          total: 0,
          successful: 0,
          failed: 0,
          successRate: 0
        }
      }

      moduleStats[module].total++
      if (success) {
        moduleStats[module].successful++
      } else {
        moduleStats[module].failed++
      }
    })

    // 计算成功率
    Object.keys(moduleStats).forEach(module => {
      const stats = moduleStats[module]
      stats.successRate = stats.total > 0 ?
        parseFloat((stats.successful / stats.total * 100).toFixed(2)) : 0
    })

    // 按使用次数排序，返回Top5
    return Object.entries(moduleStats)
      .map(([module, stats]) => ({ module, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, config.topLimit)
  }

  /**
   * 获取各功能使用次数Top5
   */
  async getTopFeatures() {
    const { data, error } = await this.supabase
      .from('analytics_events')
      .select('feature, event_name, success, duration_ms')
      .gte('timestamp', config.startDate)
      .lte('timestamp', config.endDate)
      .not('feature', 'is', null)

    if (error) throw error

    const featureStats = {}

    data.forEach(event => {
      const { feature, success, duration_ms } = event

      if (!featureStats[feature]) {
        featureStats[feature] = {
          total: 0,
          successful: 0,
          failed: 0,
          successRate: 0,
          avgDuration: 0,
          durations: []
        }
      }

      featureStats[feature].total++
      if (success) {
        featureStats[feature].successful++
      } else {
        featureStats[feature].failed++
      }

      if (duration_ms) {
        featureStats[feature].durations.push(duration_ms)
      }
    })

    // 计算成功率和平均响应时间
    Object.keys(featureStats).forEach(feature => {
      const stats = featureStats[feature]
      stats.successRate = stats.total > 0 ?
        parseFloat((stats.successful / stats.total * 100).toFixed(2)) : 0

      if (stats.durations.length > 0) {
        stats.avgDuration = Math.round(
          stats.durations.reduce((sum, d) => sum + d, 0) / stats.durations.length
        )
      }
      delete stats.durations // 清理临时数据
    })

    // 按使用次数排序，返回Top5
    return Object.entries(featureStats)
      .map(([feature, stats]) => ({ feature, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, config.topLimit)
  }

  /**
   * 获取错误分析
   */
  async getErrorAnalysis() {
    const { data, error } = await this.supabase
      .from('analytics_events')
      .select('event_name, error_message, error_code, module, feature')
      .gte('timestamp', config.startDate)
      .lte('timestamp', config.endDate)
      .eq('success', false)

    if (error) throw error

    const errorStats = {}

    data.forEach(event => {
      const { event_name, error_message, module, feature } = event
      const errorKey = `${module || 'unknown'}.${feature || 'unknown'}.${event_name}`

      if (!errorStats[errorKey]) {
        errorStats[errorKey] = {
          event: event_name,
          module: module || 'unknown',
          feature: feature || 'unknown',
          count: 0,
          messages: {}
        }
      }

      errorStats[errorKey].count++

      if (error_message) {
        if (!errorStats[errorKey].messages[error_message]) {
          errorStats[errorKey].messages[error_message] = 0
        }
        errorStats[errorKey].messages[error_message]++
      }
    })

    // 转换为数组并排序
    return Object.values(errorStats)
      .map(stats => ({
        ...stats,
        topErrorMessage: Object.entries(stats.messages)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || '无错误信息'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, config.topLimit)
  }

  /**
   * 获取性能分析
   */
  async getPerformanceAnalysis() {
    const { data, error } = await this.supabase
      .from('analytics_events')
      .select('module, feature, duration_ms')
      .gte('timestamp', config.startDate)
      .lte('timestamp', config.endDate)
      .not('duration_ms', 'is', null)
      .gte('duration_ms', 0)

    if (error) throw error

    const performanceStats = {}

    data.forEach(event => {
      const { module, feature, duration_ms } = event
      const key = `${module || 'unknown'}.${feature || 'unknown'}`

      if (!performanceStats[key]) {
        performanceStats[key] = {
          module: module || 'unknown',
          feature: feature || 'unknown',
          durations: [],
          count: 0
        }
      }

      performanceStats[key].durations.push(duration_ms)
      performanceStats[key].count++
    })

    // 计算性能指标
    return Object.values(performanceStats)
      .map(stats => {
        const sorted = stats.durations.sort((a, b) => a - b)
        const len = sorted.length

        return {
          module: stats.module,
          feature: stats.feature,
          count: stats.count,
          avgDuration: Math.round(sorted.reduce((sum, d) => sum + d, 0) / len),
          minDuration: sorted[0],
          maxDuration: sorted[len - 1],
          p50: sorted[Math.floor(len * 0.5)],
          p95: sorted[Math.floor(len * 0.95)],
          p99: sorted[Math.floor(len * 0.99)]
        }
      })
      .sort((a, b) => b.p95 - a.p95) // 按P95排序，找出最慢的功能
      .slice(0, config.topLimit)
  }

  /**
   * 获取用户活跃度分析
   */
  async getUserActivity() {
    const { data, error } = await this.supabase
      .from('analytics_events')
      .select('user_id, timestamp, event_name')
      .gte('timestamp', config.startDate)
      .lte('timestamp', config.endDate)
      .not('user_id', 'is', null)

    if (error) throw error

    const userStats = {}
    const dailyActive = {}

    data.forEach(event => {
      const { user_id, timestamp, event_name } = event
      const date = timestamp.split('T')[0] // 获取日期部分

      // 用户统计
      if (!userStats[user_id]) {
        userStats[user_id] = {
          totalEvents: 0,
          uniqueDays: new Set(),
          events: {}
        }
      }

      userStats[user_id].totalEvents++
      userStats[user_id].uniqueDays.add(date)

      if (!userStats[user_id].events[event_name]) {
        userStats[user_id].events[event_name] = 0
      }
      userStats[user_id].events[event_name]++

      // 日活统计
      if (!dailyActive[date]) {
        dailyActive[date] = new Set()
      }
      dailyActive[date].add(user_id)
    })

    // 计算活跃用户
    const activeUsers = Object.entries(userStats)
      .map(([userId, stats]) => ({
        userId,
        totalEvents: stats.totalEvents,
        activeDays: stats.uniqueDays.size,
        topEvent: Object.entries(stats.events)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown'
      }))
      .sort((a, b) => b.totalEvents - a.totalEvents)
      .slice(0, config.topLimit)

    // 计算日活跃度
    const dailyActiveUsers = Object.entries(dailyActive)
      .map(([date, users]) => ({
        date,
        activeUsers: users.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      activeUsers,
      dailyActiveUsers,
      totalUniqueUsers: Object.keys(userStats).length
    }
  }
}

// ================================
// 报告生成器
// ================================

class ReportGenerator {
  constructor(data) {
    this.data = data
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  }

  /**
   * 生成文本报告
   */
  generateTextReport() {
    const { basicStats, topModules, topFeatures, errorAnalysis, performance, userActivity } = this.data

    let report = `
📊 TeacherBean 周报分析 (${config.startDate.split('T')[0]} 至 ${config.endDate.split('T')[0]})
${'='.repeat(80)}

📈 基础统计
============
• 总事件数: ${basicStats.total.toLocaleString()}
• 成功事件: ${basicStats.successful.toLocaleString()} (${basicStats.successRate}%)
• 失败事件: ${basicStats.failed.toLocaleString()}
• 活跃用户: ${basicStats.uniqueUsers} 人
• 活跃会话: ${basicStats.uniqueSessions} 个

🏆 热门模块 Top ${config.topLimit}
${'='.repeat(30)}
${topModules.map((item, index) =>
  `${index + 1}. ${item.module}
     使用次数: ${item.total.toLocaleString()}
     成功率: ${item.successRate}% (${item.successful}/${item.total})
     失败次数: ${item.failed}`
).join('\n\n')}

🔥 热门功能 Top ${config.topLimit}
${'='.repeat(30)}
${topFeatures.map((item, index) =>
  `${index + 1}. ${item.feature}
     使用次数: ${item.total.toLocaleString()}
     成功率: ${item.successRate}% (${item.successful}/${item.total})
     平均响应时间: ${item.avgDuration}ms`
).join('\n\n')}

❌ 错误热点 Top ${config.topLimit}
${'='.repeat(30)}
${errorAnalysis.map((item, index) =>
  `${index + 1}. ${item.module}.${item.feature}.${item.event}
     错误次数: ${item.count}
     主要错误: ${item.topErrorMessage}`
).join('\n\n')}

⚡ 性能分析 Top ${config.topLimit} (按P95响应时间排序)
${'='.repeat(50)}
${performance.map((item, index) =>
  `${index + 1}. ${item.module}.${item.feature}
     调用次数: ${item.count}
     平均响应: ${item.avgDuration}ms
     P95响应: ${item.p95}ms
     最慢响应: ${item.maxDuration}ms`
).join('\n\n')}

👥 用户活跃度分析
=================
• 总活跃用户: ${userActivity.totalUniqueUsers} 人

最活跃用户 Top ${config.topLimit}:
${userActivity.activeUsers.map((user, index) =>
  `${index + 1}. 用户${user.userId.substring(0, 8)}...
     总操作数: ${user.totalEvents}
     活跃天数: ${user.activeDays}/${config.reportDays}
     主要操作: ${user.topEvent}`
).join('\n')}

日活跃度变化:
${userActivity.dailyActiveUsers.map(day =>
  `${day.date}: ${day.activeUsers} 人`
).join('\n')}

📋 关键指标总结
===============
• 整体成功率: ${basicStats.successRate}%
• 用户留存: ${userActivity.dailyActiveUsers.length > 0 ?
  (userActivity.dailyActiveUsers[userActivity.dailyActiveUsers.length - 1].activeUsers / userActivity.totalUniqueUsers * 100).toFixed(2) : 0}%
• 平均每用户操作数: ${basicStats.total > 0 && userActivity.totalUniqueUsers > 0 ?
  Math.round(basicStats.total / userActivity.totalUniqueUsers) : 0}
• 错误率: ${(100 - basicStats.successRate).toFixed(2)}%

🚨 需要关注的问题
=================
${this.generateAlerts()}

📅 报告生成时间: ${new Date().toLocaleString('zh-CN')}
`

    return report
  }

  /**
   * 生成JSON报告
   */
  generateJSONReport() {
    return {
      metadata: {
        reportType: 'weekly',
        startDate: config.startDate,
        endDate: config.endDate,
        generatedAt: new Date().toISOString(),
        period: `${config.reportDays} days`
      },
      ...this.data,
      alerts: this.generateAlertsData()
    }
  }

  /**
   * 生成警报信息
   */
  generateAlerts() {
    const alerts = []
    const { basicStats, topModules, errorAnalysis, performance } = this.data

    // 成功率警报
    if (basicStats.successRate < 90) {
      alerts.push(`⚠️ 整体成功率偏低 (${basicStats.successRate}%)，建议检查系统稳定性`)
    }

    // 模块失败率警报
    topModules.forEach(module => {
      if (module.successRate < 80) {
        alerts.push(`⚠️ ${module.module} 模块成功率偏低 (${module.successRate}%)`)
      }
    })

    // 性能警报
    performance.forEach(perf => {
      if (perf.p95 > 5000) { // P95 > 5秒
        alerts.push(`🐌 ${perf.module}.${perf.feature} 响应缓慢 (P95: ${perf.p95}ms)`)
      }
    })

    // 错误频率警报
    errorAnalysis.forEach(error => {
      if (error.count > 50) {
        alerts.push(`🚨 ${error.module}.${error.feature} 错误频发 (${error.count} 次)`)
      }
    })

    return alerts.length > 0 ? alerts.join('\n') : '✅ 暂无需要特别关注的问题'
  }

  /**
   * 生成结构化警报数据
   */
  generateAlertsData() {
    const alerts = []
    const { basicStats, topModules, errorAnalysis, performance } = this.data

    if (basicStats.successRate < 90) {
      alerts.push({
        type: 'success_rate',
        severity: 'warning',
        message: `整体成功率偏低 (${basicStats.successRate}%)`,
        value: basicStats.successRate,
        threshold: 90
      })
    }

    topModules.forEach(module => {
      if (module.successRate < 80) {
        alerts.push({
          type: 'module_success_rate',
          severity: 'warning',
          message: `${module.module} 模块成功率偏低`,
          module: module.module,
          value: module.successRate,
          threshold: 80
        })
      }
    })

    performance.forEach(perf => {
      if (perf.p95 > 5000) {
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `${perf.module}.${perf.feature} 响应缓慢`,
          module: perf.module,
          feature: perf.feature,
          value: perf.p95,
          threshold: 5000
        })
      }
    })

    errorAnalysis.forEach(error => {
      if (error.count > 50) {
        alerts.push({
          type: 'error_frequency',
          severity: 'critical',
          message: `${error.module}.${error.feature} 错误频发`,
          module: error.module,
          feature: error.feature,
          value: error.count,
          threshold: 50
        })
      }
    })

    return alerts
  }

  /**
   * 保存报告到文件
   */
  async saveReports() {
    // 确保输出目录存在
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true })
    }

    const baseFilename = `weekly-report-${this.timestamp}`

    // 保存文本报告
    const textReport = this.generateTextReport()
    const textPath = path.join(config.outputDir, `${baseFilename}.txt`)
    fs.writeFileSync(textPath, textReport, 'utf8')

    // 保存JSON报告
    const jsonReport = this.generateJSONReport()
    const jsonPath = path.join(config.outputDir, `${baseFilename}.json`)
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf8')

    return {
      textPath,
      jsonPath
    }
  }
}

// ================================
// 主程序
// ================================

async function generateWeeklyReport() {
  console.log('📊 正在生成 TeacherBean 周报分析...\n')

  try {
    const query = new AnalyticsQuery()

    console.log('📈 收集基础统计数据...')
    const basicStats = await query.getBasicStats()

    console.log('🏆 分析热门模块...')
    const topModules = await query.getTopModules()

    console.log('🔥 分析热门功能...')
    const topFeatures = await query.getTopFeatures()

    console.log('❌ 分析错误热点...')
    const errorAnalysis = await query.getErrorAnalysis()

    console.log('⚡ 分析性能数据...')
    const performance = await query.getPerformanceAnalysis()

    console.log('👥 分析用户活跃度...')
    const userActivity = await query.getUserActivity()

    const reportData = {
      basicStats,
      topModules,
      topFeatures,
      errorAnalysis,
      performance,
      userActivity
    }

    console.log('📝 生成报告文件...')
    const generator = new ReportGenerator(reportData)
    const { textPath, jsonPath } = await generator.saveReports()

    console.log('\n✅ 周报生成完成！')
    console.log(`📄 文本报告: ${textPath}`)
    console.log(`📊 JSON报告: ${jsonPath}`)

    // 在控制台显示摘要
    console.log('\n📋 本周概览:')
    console.log(`• 总事件数: ${basicStats.total.toLocaleString()}`)
    console.log(`• 成功率: ${basicStats.successRate}%`)
    console.log(`• 活跃用户: ${basicStats.uniqueUsers} 人`)
    console.log(`• 热门模块: ${topModules[0]?.module || '无'}`)
    console.log(`• 热门功能: ${topFeatures[0]?.feature || '无'}`)

    return reportData

  } catch (error) {
    console.error('❌ 生成周报时出错:', error.message)

    if (error.message.includes('缺少 Supabase 配置')) {
      console.error('\n💡 请确保设置了以下环境变量:')
      console.error('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
      console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
    }

    process.exit(1)
  }
}

// ================================
// 命令行参数处理
// ================================

function parseArgs() {
  const args = process.argv.slice(2)

  args.forEach(arg => {
    if (arg.startsWith('--days=')) {
      config.reportDays = parseInt(arg.split('=')[1]) || 7
    } else if (arg.startsWith('--top=')) {
      config.topLimit = parseInt(arg.split('=')[1]) || 5
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
TeacherBean 周报分析脚本

用法:
  node scripts/weekly-analytics.js [选项]

选项:
  --days=N      分析过去N天的数据 (默认: 7)
  --top=N       显示TopN结果 (默认: 5)
  --help, -h    显示帮助信息

环境变量:
  NEXT_PUBLIC_SUPABASE_URL      Supabase项目URL
  SUPABASE_SERVICE_ROLE_KEY     Supabase服务角色密钥

示例:
  node scripts/weekly-analytics.js --days=14 --top=10
      `)
      process.exit(0)
    }
  })
}

// ================================
// 程序入口
// ================================

if (require.main === module) {
  parseArgs()
  generateWeeklyReport()
}

module.exports = {
  AnalyticsQuery,
  ReportGenerator,
  generateWeeklyReport,
  config
}