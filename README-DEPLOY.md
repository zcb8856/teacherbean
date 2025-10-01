# TeacherBean 部署指南 - 快速开始

## 🚀 一键部署到Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/teacherbean&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,OPENAI_API_KEY)

## 📋 快速部署步骤

### 1. 准备环境变量

创建Supabase项目并获取以下信息：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-... # 可选
```

### 2. 选择部署方式

#### 🌟 方式一：Vercel（最简单）
1. 点击上方"Deploy with Vercel"按钮
2. 连接GitHub账户
3. 填入环境变量
4. 点击部署

#### 🐳 方式二：Docker
```bash
# 克隆项目
git clone https://github.com/your-username/teacherbean.git
cd teacherbean

# 创建环境文件
cp .env.example .env.local
# 编辑 .env.local 填入你的配置

# 使用Docker部署
docker-compose -f docker-compose.prod.yml up -d
```

#### 🛠️ 方式三：本地开发
```bash
# 安装依赖
npm install

# 配置环境
cp .env.example .env.local
# 编辑 .env.local

# 启动开发服务器
npm run dev
```

### 3. 数据库设置

```bash
# 应用数据库架构
npx supabase db push

# 可选：创建示例数据
npx supabase db seed
```

### 4. 验证部署

访问你的部署地址：
- 主页：`https://your-domain.com`
- 健康检查：`https://your-domain.com/healthz`
- 教案规划：`https://your-domain.com/planner`

## 🔧 其他部署选项

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.next
```

### Railway
1. 连接GitHub到 [Railway](https://railway.app)
2. 添加环境变量
3. 自动部署

### DigitalOcean App Platform
1. 在DigitalOcean创建App
2. 连接GitHub仓库
3. 配置环境变量

## 📊 部署后检查清单

- [ ] 健康检查通过 (`/healthz`)
- [ ] 用户注册/登录正常
- [ ] AI功能正常（如果配置了OpenAI）
- [ ] 数据库连接正常
- [ ] 静态资源加载正常
- [ ] 移动端访问正常

## 🚨 常见问题

### 构建失败
```bash
# 检查Node.js版本（需要18+）
node --version

# 清理并重新安装
rm -rf node_modules .next
npm install
```

### 环境变量问题
- 确保所有必需的环境变量都已设置
- 检查Supabase URL和密钥是否正确
- 公共变量必须以`NEXT_PUBLIC_`开头

### 数据库连接问题
- 验证Supabase项目状态
- 检查RLS（行级安全）策略
- 确认API密钥权限

## 📱 移动端体验

部署后可通过以下方式体验：

1. **浏览器访问**：直接在手机浏览器打开
2. **PWA安装**：点击"添加到主屏幕"
3. **响应式测试**：在不同设备尺寸下测试

## 🎯 演示功能

部署成功后，可以体验三个核心功能：

1. **📚 教案生成** (`/planner`)
   - 创建"Food & Health"主题教案
   - 体验AI辅助生成功能

2. **🎮 课堂游戏** (`/classroom`)
   - 生成A2级语法练习题
   - 一分钟快速游戏演示

3. **✍️ 写作评改** (`/writing`)
   - 粘贴作文获取AI反馈
   - 导出评改报告

## 📞 需要帮助？

- 📖 详细文档：[DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- 🧪 测试文档：[TESTING.md](./docs/TESTING.md)
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-username/teacherbean/issues)

---

**🎉 祝您部署顺利！如有问题，请参考详细文档或联系支持。**