# TeacherBean E2E Testing - Quick Start

## 🚀 快速运行测试

### 1. 环境准备
```bash
# 安装依赖
npm install

# 安装Playwright浏览器
npm run test:install

# 设置环境变量 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. 运行测试
```bash
# 完整测试套件
npm test

# 只运行主要E2E测试
npm run test:e2e

# 显示浏览器（调试用）
npm run test:headed

# 交互式运行
npm run test:ui
```

### 3. 查看结果
```bash
# 打开HTML报告
npm run test:report
```

## 📋 三个核心测试用例

### 1. 📚 教案生成与模板保存
**测试路径**: `/planner`
- 生成七年级"Food & Health"教案
- AI辅助完善教学内容
- 保存为可复用模板
- 验证资源库集成

### 2. 🎮 课堂语法小游戏
**测试路径**: `/classroom`
- 生成10道A2级语法题
- 运行1分钟快速演示
- 实时答题评分
- 查看结果分析

### 3. ✍️ 写作评改与导出
**测试路径**: `/writing`
- 粘贴学生作文评改
- 获取rubric详细反馈
- 生成改进版本对比
- 导出讲评Docx文档

## 🔧 常用命令

```bash
# 测试特定功能
npx playwright test lesson-planner.spec.ts
npx playwright test classroom-games.spec.ts
npx playwright test writing-assessment.spec.ts

# 数据管理
npm run test:setup    # 初始化测试数据
npm run test:cleanup  # 清理测试数据

# 调试模式
npm run test:debug    # 逐步调试
npx playwright codegen http://localhost:3000  # 录制测试
```

## 🐛 故障排除

### 常见问题
```bash
# 浏览器问题
npx playwright install --force

# 端口冲突
PORT=3001 npm run dev

# 数据库连接
npx supabase status
```

### 调试技巧
```bash
# 保存失败截图
DEBUG=pw:api npm test

# 查看详细日志
npx playwright test --trace=on
```

## 📊 CI/CD 状态

[![E2E Tests](https://github.com/your-repo/teacherbean/workflows/E2E%20Tests/badge.svg)](https://github.com/your-repo/teacherbean/actions)
[![Quality Checks](https://github.com/your-repo/teacherbean/workflows/Quality%20Checks/badge.svg)](https://github.com/your-repo/teacherbean/actions)

## 📖 详细文档

查看完整文档：[/docs/TESTING.md](./docs/TESTING.md)

---
**需要帮助？** 查看测试报告或联系开发团队 🚀