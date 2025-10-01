# TeacherBean 部署指南

完整的从本地开发到生产环境的部署说明。

## 🎯 部署概览

**技术栈**:
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **部署平台**: Vercel
- **文件存储**: Supabase Storage
- **AI服务**: OpenAI GPT-4

## 📋 前置要求

### 必需账户
- [Supabase](https://supabase.com) 账户（免费层可用）
- [OpenAI](https://platform.openai.com) 账户（需要 API 密钥）
- [Vercel](https://vercel.com) 账户（免费层可用）
- [GitHub](https://github.com) 账户（代码托管）

### 本地环境
- Node.js 18+
- pnpm 包管理器
- Git

## 🗄️ 数据库设置（Supabase）

### 1. 创建 Supabase 项目

```bash
# 访问 https://supabase.com/dashboard
# 点击 "New Project"
# 填写项目信息：
#   - Name: teacherbean-prod
#   - Database Password: 生成强密码并保存
#   - Region: 选择最近的区域
```

### 2. 配置数据库

```bash
# 在 Supabase Dashboard > SQL Editor 中执行：
# 1. 复制 supabase/schema.sql 的全部内容并执行
# 2. 复制 supabase/seed.sql 的全部内容并执行（可选）
```

### 3. 获取数据库凭证

```bash
# 在 Supabase Dashboard > Settings > API 页面获取：
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 配置认证

```bash
# 在 Supabase Dashboard > Authentication > Settings 中：
# - Site URL: https://your-app.vercel.app
# - Redirect URLs: https://your-app.vercel.app/auth/callback
# - 启用 Email 认证
```

### 5. 更新数据库加密密钥（生产环境）

```sql
-- 在 SQL Editor 中执行（将密钥改为32位随机字符串）：
ALTER DATABASE postgres SET app.encryption_key = 'your-production-encryption-key-32chars';
```

## 🤖 AI 服务设置（OpenAI）

### 1. 获取 OpenAI API 密钥

```bash
# 访问 https://platform.openai.com/api-keys
# 创建新的 API 密钥
# 复制密钥（只显示一次！）
OPENAI_API_KEY=sk-proj-...your_api_key_here
```

### 2. 配置使用限制

```bash
# 在 OpenAI Dashboard > Usage limits 中设置：
# - Monthly budget: $50 (根据需要调整)
# - Email alerts: 启用
```

## 🚀 Vercel 部署

### 1. 连接 GitHub 仓库

```bash
# 1. 将代码推送到 GitHub 仓库
git add .
git commit -m "准备部署到生产环境"
git push origin main

# 2. 访问 https://vercel.com/dashboard
# 3. 点击 "New Project"
# 4. 导入你的 GitHub 仓库
```

### 2. 配置构建设置

```bash
# Vercel 项目设置：
Framework Preset: Next.js
Root Directory: ./
Build Command: pnpm run build
Output Directory: .next
Install Command: pnpm install
```

### 3. 设置环境变量

在 Vercel Dashboard > Settings > Environment Variables 中添加：

```bash
# ================================
# REQUIRED: Supabase Configuration
# ================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ================================
# REQUIRED: OpenAI Configuration
# ================================
OPENAI_API_KEY=sk-proj-...your_openai_api_key
AI_MODEL=gpt-4o-mini

# ================================
# APPLICATION CONFIGURATION
# ================================
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# ================================
# OPTIONAL: Email & Security
# ================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
NEXTAUTH_SECRET=your-super-secret-production-key-32chars
NEXTAUTH_URL=https://your-app.vercel.app
```

### 4. 部署

```bash
# Vercel 会自动部署，或者手动触发：
# 在 Vercel Dashboard > Deployments 点击 "Redeploy"
```

## 📦 Next.js 构建配置

### package.json 脚本

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "audit:lighthouse": "node scripts/lighthouse-audit.js",
    "audit:lighthouse:ci": "node scripts/lighthouse-ci.js",
    "accessibility:check": "node scripts/accessibility-check.js"
  }
}
```

### next.config.js 优化

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## ✅ 部署后验证

### 1. 功能测试

```bash
# 1. 访问应用主页
https://your-app.vercel.app

# 2. 测试用户注册/登录
# 3. 测试课程规划生成
# 4. 测试题目生成和组卷
# 5. 测试文档导出功能
```

### 2. 性能审计

```bash
# 本地运行 Lighthouse 审计（指向生产环境）
LIGHTHOUSE_URL=https://your-app.vercel.app pnpm audit:lighthouse

# 目标分数：
# - Performance: ≥ 90
# - Accessibility: ≥ 95
# - Best Practices: ≥ 90
# - SEO: ≥ 90
```

### 3. 错误监控

```bash
# 检查 Vercel Dashboard > Functions 页面的错误日志
# 检查 Supabase Dashboard > Logs 页面的数据库日志
# 设置 Vercel 集成（如 Sentry）进行错误追踪
```

## 🔄 持续集成/部署 (CI/CD)

### GitHub Actions 配置

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run type check
        run: pnpm type-check

      - name: Run tests
        run: pnpm test

      - name: Build application
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  lighthouse:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run Lighthouse CI
        run: pnpm audit:lighthouse:ci
        env:
          LIGHTHOUSE_URL: https://your-app-preview.vercel.app
```

## 🚨 故障排除

### 常见问题

**1. 构建失败**
```bash
# 检查环境变量是否正确设置
# 检查 package.json 依赖版本
# 查看 Vercel 构建日志
```

**2. Supabase 连接失败**
```bash
# 验证 URL 和密钥格式
# 检查 RLS 策略是否正确
# 确认网络访问权限
```

**3. OpenAI API 错误**
```bash
# 检查 API 密钥有效性
# 确认账户余额充足
# 验证 API 使用限制
```

**4. 性能问题**
```bash
# 运行 Lighthouse 审计找出瓶颈
# 检查图片优化设置
# 验证 CDN 缓存配置
```

### 回滚策略

```bash
# 在 Vercel Dashboard 中：
# 1. 进入 Deployments 页面
# 2. 找到稳定的部署版本
# 3. 点击 "Promote to Production"
```

## 📊 监控和维护

### 1. 性能监控

```bash
# 设置定期 Lighthouse 审计
# 监控 Core Web Vitals
# 设置性能告警阈值
```

### 2. 安全维护

```bash
# 定期更新依赖包
pnpm update

# 运行安全审计
pnpm audit

# 更新密钥和密码
# 检查访问日志
```

### 3. 数据备份

```bash
# Supabase 自动备份（Pro 计划）
# 导出重要配置和数据
# 定期测试恢复流程
```

## 📞 支持和帮助

如遇到部署问题：

1. **查看文档**: 检查相关服务的官方文档
2. **检查日志**: Vercel、Supabase、GitHub Actions 日志
3. **社区支持**: GitHub Issues、Discord 社区
4. **专业支持**: 考虑升级到 Pro 计划获得技术支持

---

**部署成功！** 🎉 你的 TeacherBean 应用现在已经在生产环境中运行。