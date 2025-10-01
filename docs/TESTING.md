# TeacherBean E2E Testing Guide

本文档提供了 TeacherBean 项目端到端测试的完整指南，包括测试设置、运行方法和最佳实践。

## 📋 目录

- [测试概述](#测试概述)
- [快速开始](#快速开始)
- [测试用例](#测试用例)
- [运行测试](#运行测试)
- [CI/CD集成](#cicd集成)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

## 🎯 测试概述

我们的端到端测试覆盖三个主要用户故事：

### 1. 教案生成和模板保存
**路径**: `/planner`
- 教师创建七年级"Food & Health"主题教案
- AI辅助生成完整教案内容
- 保存为可复用模板
- 模板在资源库中可见和复用

### 2. 课堂互动语法游戏
**路径**: `/classroom`
- 生成10道A2级语法选择题
- 运行1分钟快速游戏演示
- 实时答题和评分
- 查看结果分析和错误回顾

### 3. 写作评改和导出
**路径**: `/writing`
- 粘贴学生作文进行AI评改
- 获取详细的rubric评分
- 生成改进版本对比
- 导出讲评报告为DOCX格式

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm
- Supabase 项目配置

### 安装和设置

1. **安装依赖**
   ```bash
   npm install
   ```

2. **安装Playwright浏览器**
   ```bash
   npm run test:install
   ```

3. **配置环境变量**

   创建 `.env.local` 文件：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **数据库设置**
   ```bash
   # 确保数据库schema是最新的
   supabase db push
   ```

### 第一次运行

```bash
# 运行所有测试
npm test

# 或者运行特定测试套件
npm run test:e2e
```

## 🧪 测试用例

### 测试文件结构

```
tests/
├── e2e/                     # 端到端测试
│   ├── lesson-planner.spec.ts    # 教案生成测试
│   ├── classroom-games.spec.ts   # 课堂游戏测试
│   └── writing-assessment.spec.ts # 写作评改测试
├── accessibility/           # 可访问性测试
│   └── a11y.spec.ts
├── fixtures/               # 测试数据和工具
│   ├── auth.ts            # 认证相关
│   └── test-data.ts       # 测试数据
├── utils/                  # 测试工具
│   └── test-helpers.ts
├── setup.ts               # 测试环境设置
└── cleanup.ts             # 测试清理
```

### 主要测试场景

#### 1. 教案生成测试 (`lesson-planner.spec.ts`)

```typescript
// 主要测试步骤：
- 导航到 /planner
- 填写课程基本信息（年级、主题、时长）
- 添加学习目标和词汇
- 配置课程活动
- 生成AI教案
- 编辑和完善内容
- 保存为模板（设置分享权限）
- 验证模板在资源库中可见
- 测试模板复用功能
- 导出教案（DOCX/PDF格式）
```

**验证点**：
- ✅ 表单验证和错误处理
- ✅ AI生成内容正确显示
- ✅ 模板保存和权限设置
- ✅ 资源库集成
- ✅ 导出功能正常

#### 2. 课堂游戏测试 (`classroom-games.spec.ts`)

```typescript
// 主要测试步骤：
- 导航到 /classroom
- 设置游戏参数（类型、难度、题目数量）
- 生成A2级语法题目
- 预览和编辑题目
- 启动游戏演示
- 模拟答题过程
- 查看结果和分析
- 回顾错误答案
- 保存游戏结果
```

**验证点**：
- ✅ 游戏参数配置
- ✅ AI题目生成质量
- ✅ 游戏界面交互
- ✅ 计分和计时准确性
- ✅ 结果分析完整性

#### 3. 写作评改测试 (`writing-assessment.spec.ts`)

```typescript
// 主要测试步骤：
- 导航到 /writing
- 设置评改参数和rubric权重
- 粘贴学生作文
- 启动AI评改
- 查看评分结果和反馈
- 查看改进版本对比
- 添加教师评语
- 生成评改报告
- 导出DOCX文档
- 保存到学生档案
```

**验证点**：
- ✅ Rubric配置和权重计算
- ✅ AI评改准确性和反馈质量
- ✅ 版本对比功能
- ✅ 教师评语系统
- ✅ 报告生成和导出

## 🏃‍♂️ 运行测试

### 基本命令

```bash
# 运行所有测试
npm test

# 运行特定项目
npm run test:e2e          # 只运行E2E测试
npm run test:mobile       # 移动端测试
npm run test:accessibility # 可访问性测试

# 开发模式
npm run test:headed       # 显示浏览器窗口
npm run test:ui           # 交互式UI模式
npm run test:debug        # 调试模式

# 查看报告
npm run test:report       # 打开HTML报告
```

### 环境管理

```bash
# 设置测试数据
npm run test:setup

# 清理测试数据
npm run test:cleanup

# 完整重置
npm run test:cleanup && npm run test:setup
```

### 高级选项

```bash
# 运行特定测试文件
npx playwright test lesson-planner.spec.ts

# 运行特定测试用例
npx playwright test --grep "教师登录后在 /planner 生成"

# 并行运行
npx playwright test --workers=4

# 重试失败的测试
npx playwright test --retries=2

# 生成测试报告
npx playwright test --reporter=html,junit
```

## 🔄 CI/CD集成

### GitHub Actions

我们有三个主要的工作流：

#### 1. E2E Tests (`.github/workflows/e2e-tests.yml`)
- **触发时机**：推送到 main/develop 分支，Pull Request
- **运行内容**：完整的端到端测试套件
- **环境**：Ubuntu + PostgreSQL + Supabase
- **制品**：测试报告、截图、视频

#### 2. Quality Checks (`.github/workflows/quality-checks.yml`)
- **触发时机**：推送和Pull Request
- **运行内容**：
  - Lighthouse性能测试
  - 可访问性测试
  - 安全性扫描
  - 代码质量检查
  - Bundle大小检查

#### 3. Visual Tests
- **触发时机**：Pull Request
- **运行内容**：视觉回归测试
- **制品**：视觉差异报告

### 本地CI模拟

```bash
# 模拟CI环境运行
CI=true npm test

# 生成CI格式报告
npm test -- --reporter=junit,html
```

## 🐛 故障排除

### 常见问题

#### 1. 测试超时
```bash
# 增加超时时间
npx playwright test --timeout=60000

# 或在配置中设置
# playwright.config.ts
timeout: 60000
```

#### 2. 浏览器安装问题
```bash
# 重新安装浏览器
npx playwright install --force

# 安装系统依赖
npx playwright install-deps
```

#### 3. 数据库连接问题
```bash
# 检查Supabase连接
npx supabase status

# 重置本地数据库
npx supabase db reset
```

#### 4. 端口冲突
```bash
# 检查端口占用
lsof -i :3000

# 使用不同端口
PORT=3001 npm run dev
```

### 调试技巧

#### 1. 保存失败截图
```typescript
// 在测试中添加
await page.screenshot({ path: 'debug-screenshot.png' })
```

#### 2. 启用详细日志
```bash
DEBUG=pw:api npm test
```

#### 3. 暂停执行
```typescript
// 在测试中添加
await page.pause()
```

#### 4. 录制测试
```bash
npx playwright codegen http://localhost:3000
```

### 性能优化

```bash
# 禁用图片加载
npx playwright test --browser-args="--disable-images"

# 使用无头模式
npx playwright test --headed=false

# 减少并行度
npx playwright test --workers=1
```

## 📋 最佳实践

### 测试编写

#### 1. 测试结构
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // 公共设置
  })

  test('should do something specific', async ({ page }) => {
    await test.step('步骤1：设置', async () => {
      // 具体步骤
    })

    await test.step('步骤2：操作', async () => {
      // 具体步骤
    })

    await test.step('步骤3：验证', async () => {
      // 断言验证
    })
  })
})
```

#### 2. 选择器策略
```typescript
// 优先级：data-testid > role > text > CSS
await page.click('[data-testid="submit-button"]')  // 最佳
await page.click('role=button[name="Submit"]')     // 次优
await page.click('text=Submit')                    // 可接受
await page.click('.submit-btn')                    // 避免
```

#### 3. 等待策略
```typescript
// 等待元素出现
await page.waitForSelector('[data-testid="results"]')

// 等待网络请求
await page.waitForResponse('/api/generate')

// 等待状态变化
await page.waitForFunction(() => window.loadingComplete)
```

#### 4. 错误处理
```typescript
test('should handle errors gracefully', async ({ page }) => {
  // Mock错误响应
  await page.route('/api/endpoint', route => {
    route.fulfill({ status: 500 })
  })

  // 验证错误处理
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
})
```

### 数据管理

#### 1. 测试隔离
```typescript
// 每个测试使用独立数据
test('test with clean data', async ({ page }) => {
  const testData = await createTestData()
  // 测试逻辑
  await cleanupTestData(testData.id)
})
```

#### 2. Mock策略
```typescript
// Mock外部API
await page.route('/api/ai/**', route => {
  route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(mockResponse)
  })
})
```

### 维护性

#### 1. Page Object模式
```typescript
class PlannerPage {
  constructor(private page: Page) {}

  async fillBasicInfo(data: LessonData) {
    await this.page.fill('[data-testid="grade"]', data.grade)
    await this.page.fill('[data-testid="subject"]', data.subject)
  }

  async generateLesson() {
    await this.page.click('[data-testid="generate"]')
    await this.page.waitForSelector('[data-testid="results"]')
  }
}
```

#### 2. 共享工具函数
```typescript
// tests/utils/helpers.ts
export async function loginAsTeacher(page: Page) {
  // 登录逻辑
}

export async function createSampleClass(page: Page) {
  // 创建测试班级
}
```

### 监控和报告

#### 1. 自定义报告
```typescript
// playwright.config.ts
reporter: [
  ['html'],
  ['junit', { outputFile: 'test-results/results.xml' }],
  ['json', { outputFile: 'test-results/results.json' }]
]
```

#### 2. 性能监控
```typescript
test('should load within performance budget', async ({ page }) => {
  const start = Date.now()
  await page.goto('/dashboard')
  const loadTime = Date.now() - start

  expect(loadTime).toBeLessThan(3000) // 3秒内加载
})
```

### 团队协作

#### 1. 测试规范
- 测试名称使用中文描述用户行为
- 每个测试专注单一功能点
- 使用data-testid属性标识测试元素
- Mock外部依赖保证测试稳定性

#### 2. 代码审查
- 确保测试覆盖关键用户路径
- 验证错误处理和边界情况
- 检查测试的可读性和维护性
- 确保Mock数据真实可信

## 📈 测试指标

### 覆盖率目标
- **功能覆盖**：90% 核心用户流程
- **页面覆盖**：100% 主要页面
- **API覆盖**：80% 关键接口
- **错误场景**：60% 异常情况

### 性能指标
- **测试执行时间**：< 15分钟（完整套件）
- **单个测试**：< 2分钟
- **成功率**：> 95%（稳定环境）

### 质量指标
- **可访问性**：WCAG 2.1 AA 标准
- **性能分数**：Lighthouse > 80分
- **SEO分数**：> 80分

---

## 📞 获取帮助

- **文档问题**：查看 `/docs` 目录下的其他文档
- **测试问题**：在项目仓库创建Issue
- **技术支持**：联系开发团队

Happy Testing! 🎉