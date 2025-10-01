# TeacherBean Analytics 分析系统

完整的用户行为分析和性能监控系统，支持关键操作埋点、本地存储和周报生成。

## 🎯 核心功能

### 统一埋点系统
- **本地开发**: IndexedDB 存储，控制台输出
- **生产环境**: 自动上传到 `/api/log` 端点
- **关键操作**: 生成、保存、组卷、批改、导出全覆盖
- **性能监控**: 响应时间、成功率、错误追踪

### 数据存储
- **开发环境**: IndexedDB 本地存储（保留30天）
- **生产环境**: Supabase `analytics_events` 表
- **自动清理**: 定期删除过期数据
- **批量上传**: 减少网络请求，提升性能

## 📊 使用方法

### 基础埋点

```typescript
import { log, logSuccess, logError, startTiming, ANALYTICS_EVENTS } from '@/lib/analytics'

// 简单事件记录
await log(ANALYTICS_EVENTS.FEATURE_CLICK, {
  module: 'library',
  feature: 'search',
  action: 'click',
  searchQuery: 'grammar exercises'
})

// 带计时的操作
const startTime = startTiming()
try {
  const result = await apiCall()
  await logSuccess(ANALYTICS_EVENTS.GENERATE_SUCCESS, {
    module: 'generate',
    feature: 'lesson_plan',
    level: 'A2',
    contentLength: result.content.length
  }, startTime)
} catch (error) {
  await logError(ANALYTICS_EVENTS.GENERATE_ERROR, error, {
    module: 'generate',
    feature: 'lesson_plan'
  }, startTime)
}
```

### React Hook 使用

```typescript
import { useAnalytics } from '@/lib/analytics'

function MyComponent() {
  const { log, logSuccess, logError } = useAnalytics()

  const handleClick = async () => {
    await log('button_click', {
      module: 'ui',
      feature: 'navigation',
      buttonText: '生成题目'
    })
  }

  return <button onClick={handleClick}>生成题目</button>
}
```

### 高阶组件封装

```typescript
import { withAnalytics } from '@/lib/analytics'

// API 调用自动埋点
const generateLessonPlan = withAnalytics(
  async (data) => {
    const response = await fetch('/api/generate/lesson', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return response.json()
  },
  'generate_lesson',
  'lesson_plan'
)
```

## 🔧 关键操作埋点

### 1. 生成模块
```typescript
// 开始生成
ANALYTICS_EVENTS.GENERATE_START
payload: {
  module: 'generate',
  feature: 'lesson_plan' | 'reading' | 'questions',
  generationType: string,
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
  topic: string
}

// 生成成功
ANALYTICS_EVENTS.GENERATE_SUCCESS
payload: {
  ...startPayload,
  contentLength: number,
  itemCount?: number
}

// 生成失败
ANALYTICS_EVENTS.GENERATE_ERROR
payload: {
  ...startPayload,
  error: { message, stack, code }
}
```

### 2. 保存模块
```typescript
// 保存资源
ANALYTICS_EVENTS.SAVE_SUCCESS
payload: {
  module: 'save',
  feature: 'material',
  resourceType: 'lesson_plan' | 'assignment' | 'template',
  resourceId: string,
  sharing: 'private' | 'school' | 'public',
  contentSize: number
}
```

### 3. 组卷模块
```typescript
// 组卷成功
ANALYTICS_EVENTS.ASSEMBLE_SUCCESS
payload: {
  module: 'assemble',
  feature: 'test',
  questionTypes: string[],
  totalQuestions: number,
  assemblyStrategy: 'exact' | 'fallback',
  difficulty: number[]
}

// 降级策略触发
ANALYTICS_EVENTS.ASSEMBLE_FALLBACK
payload: {
  originalConfig: object,
  finalConfig: object,
  fallbackReason: string
}
```

### 4. 批改模块
```typescript
// 批改完成
ANALYTICS_EVENTS.GRADE_SUCCESS
payload: {
  module: 'grade',
  feature: 'submission',
  submissionId: string,
  scoreType: 'auto' | 'manual' | 'ai',
  finalScore: number,
  maxScore: number,
  feedbackLength: number
}
```

### 5. 导出模块
```typescript
// 导出成功
ANALYTICS_EVENTS.EXPORT_SUCCESS
payload: {
  module: 'export',
  feature: 'document',
  exportFormat: 'pdf' | 'docx' | 'json' | 'excel',
  exportType: string,
  fileSize: number
}
```

## 📈 周报分析

### 生成周报
```bash
# 基础周报（近7天）
pnpm analytics:report

# 月度报告（近30天）
pnpm analytics:report:monthly

# 自定义报告（近14天，Top10）
pnpm analytics:report:custom

# 自定义天数和数量
node scripts/weekly-analytics.js --days=14 --top=10
```

### 报告内容

**📊 基础统计**
- 总事件数、成功率、失败率
- 活跃用户数、会话数

**🏆 热门模块 Top5**
- 各模块使用次数和成功率
- 生成、保存、组卷、批改、导出排名

**🔥 热门功能 Top5**
- 功能级别的使用统计
- 平均响应时间分析

**❌ 错误热点 Top5**
- 错误频发的功能点
- 主要错误消息分析

**⚡ 性能分析 Top5**
- P95 响应时间排序
- 性能瓶颈识别

**👥 用户活跃度**
- 最活跃用户统计
- 日活跃度变化趋势

**🚨 自动告警**
- 成功率低于90%告警
- 模块成功率低于80%告警
- P95响应时间超过5秒告警
- 错误次数超过50次告警

### 报告输出
```
analytics-reports/
├── weekly-report-2024-01-15T10-30-00.txt  # 文本报告
└── weekly-report-2024-01-15T10-30-00.json # JSON数据
```

## 🔧 配置说明

### 环境变量
```bash
# 生产环境必需
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 开发环境可选
DEBUG_ANALYTICS=true  # 启用详细日志
```

### 数据库表结构
```sql
-- analytics_events 表已包含在 supabase/schema.sql 中
-- 包含完整的索引和 RLS 策略
-- 支持高效的分析查询
```

## 📋 最佳实践

### 1. 埋点规范
- 使用预定义的 `ANALYTICS_EVENTS` 常量
- 保持 payload 结构一致性
- 记录关键业务指标

### 2. 性能优化
- 本地开发使用 IndexedDB 缓存
- 生产环境批量上传
- 定期清理过期数据

### 3. 隐私保护
- 不记录敏感用户信息
- 遵循 GDPR 数据保护规定
- 用户可选择退出追踪

### 4. 错误处理
- 埋点系统本身不应影响业务流程
- 失败时静默处理，记录到控制台
- 提供降级方案

## 🎯 应用场景

### 产品优化
- 识别用户最常用的功能
- 发现用户流失点
- 优化用户体验

### 性能监控
- 监控 API 响应时间
- 识别性能瓶颈
- 预警系统异常

### 运营决策
- 功能使用情况分析
- 用户行为洞察
- 产品迭代方向

### 技术运维
- 错误监控和告警
- 系统稳定性分析
- 容量规划支持

通过完整的分析系统，TeacherBean 能够实现数据驱动的产品优化和用户体验提升。