# TeacherBean 部署指南

本文档提供了TeacherBean项目的完整部署指南，支持多种部署平台和环境。

## 📋 目录

- [快速部署](#快速部署)
- [部署平台选择](#部署平台选择)
- [环境配置](#环境配置)
- [部署方法](#部署方法)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 🚀 快速部署

### 最简单的方式 - Vercel（推荐）

1. **Fork项目到GitHub**
2. **在Vercel中导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Import Project"
   - 选择您的GitHub仓库

3. **配置环境变量**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   ```

4. **部署**
   - Vercel会自动构建和部署
   - 几分钟后即可访问

## 🎯 部署平台选择

| 平台 | 优势 | 适用场景 |
|------|------|----------|
| **Vercel** | 零配置、自动HTTPS、CDN | 快速原型、生产环境 |
| **Netlify** | 良好的静态站点支持 | 静态部署、JAMstack |
| **Docker** | 完全控制、可扩展 | 自托管、企业部署 |
| **Railway** | 简单、支持数据库 | 全栈应用 |
| **DigitalOcean** | 价格实惠、灵活 | 中小型项目 |

## ⚙️ 环境配置

### 必需的环境变量

```bash
# Supabase配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI服务配置（可选）
OPENAI_API_KEY=your-openai-api-key

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 可选的环境变量

```bash
# 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 文件存储
STORAGE_BUCKET=teacherbean-files

# 安全配置
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

## 🛠️ 部署方法

### 方法1: Vercel部署

#### 使用Vercel CLI
```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署到生产环境
vercel --prod
```

#### 使用GitHub集成
1. 连接GitHub仓库到Vercel
2. 每次推送到main分支自动部署
3. Pull Request自动创建预览环境

### 方法2: Netlify部署

```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 登录Netlify
netlify login

# 构建项目
npm run build

# 部署
netlify deploy --prod --dir=.next
```

### 方法3: Docker部署

#### 单容器部署
```bash
# 构建镜像
docker build -t teacherbean .

# 运行容器
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your_url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key" \
  teacherbean
```

#### Docker Compose部署
```bash
# 创建环境文件
cp .env.example .env.production

# 编辑环境变量
nano .env.production

# 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

### 方法4: 自动化部署脚本

```bash
# 赋予执行权限
chmod +x scripts/deploy.sh

# 部署到Docker
./scripts/deploy.sh v1.0.0 production docker

# 部署到Vercel
./scripts/deploy.sh v1.0.0 production vercel

# 回滚
./scripts/deploy.sh latest production rollback
```

## 📊 监控和维护

### 健康检查

应用提供健康检查端点：

```bash
# 检查应用状态
curl https://your-domain.com/healthz

# 响应示例
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "database": "connected",
  "services": {
    "openai": "configured"
  }
}
```

### 性能监控

#### Vercel Analytics
- 自动集成Web Vitals监控
- 查看用户行为分析

#### 自定义监控
```javascript
// 添加到应用中
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  )
}
```

### 日志监控

#### Vercel函数日志
```bash
# 查看函数日志
vercel logs --follow
```

#### Docker日志
```bash
# 查看容器日志
docker-compose -f docker-compose.prod.yml logs -f app

# 查看特定服务日志
docker logs teacherbean_app_1 -f
```

### 备份策略

#### 数据库备份
```bash
# Supabase自动备份
# 可在Supabase Dashboard查看

# 手动备份
supabase db dump > backup.sql
```

#### 应用配置备份
```bash
# 导出环境变量
vercel env pull .env.backup

# 备份重要文件
tar -czf teacherbean-backup.tar.gz \
  .env.production \
  docker-compose.prod.yml \
  nginx.conf
```

## 🔧 高级配置

### CDN和缓存优化

#### Vercel Edge Network
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=60, stale-while-revalidate',
          },
        ],
      },
    ]
  },
}
```

#### Cloudflare集成
1. 添加域名到Cloudflare
2. 配置DNS指向Vercel
3. 启用缓存和压缩

### 安全配置

#### HTTPS强制跳转
```nginx
# nginx.conf
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

#### 安全头设置
```javascript
// next.config.js
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
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval';",
        },
      ],
    },
  ]
}
```

### 数据库优化

#### 连接池配置
```javascript
// lib/supabase.js
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
```

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 检查依赖
npm audit
npm audit fix

# 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

#### 2. 环境变量问题
```bash
# 验证环境变量
echo $NEXT_PUBLIC_SUPABASE_URL

# Vercel环境变量
vercel env ls
vercel env pull
```

#### 3. 数据库连接失败
```bash
# 检查Supabase状态
curl https://your-project.supabase.co/rest/v1/

# 验证API密钥
supabase status
```

#### 4. 性能问题
```bash
# 分析bundle大小
npm run build
npx @next/bundle-analyzer

# 检查内存使用
docker stats teacherbean_app_1
```

### 错误处理

#### 应用级错误监控
```javascript
// 集成Sentry
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

#### 自定义错误页面
```jsx
// pages/_error.js
function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `服务器发生了 ${statusCode} 错误`
        : '客户端发生了错误'}
    </p>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
```

## 📱 移动端优化

### PWA配置
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // 其他配置
})
```

### 响应式部署验证
```bash
# 使用Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=https://your-domain.com
```

## 🔄 持续集成/部署

### GitHub Actions
参考 `.github/workflows/deploy.yml` 文件：

- 自动测试
- 构建验证
- 多环境部署
- 健康检查
- 回滚机制

### 部署流程
1. **开发** → 推送到 `develop` 分支
2. **测试** → 自动运行E2E测试
3. **预览** → 合并到 `main` 分支创建预览
4. **生产** → 打tag触发生产部署
5. **监控** → 自动健康检查和通知

---

## 📞 获取帮助

- **部署问题**：检查日志和健康检查端点
- **性能问题**：使用Lighthouse和Web Vitals
- **安全问题**：参考OWASP指南
- **技术支持**：创建GitHub Issue

部署愉快! 🚀