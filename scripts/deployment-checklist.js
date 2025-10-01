#!/usr/bin/env node

/**
 * TeacherBean 部署检查清单脚本
 * 从本地开发到线上部署的逐步指导
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 TeacherBean 部署检查清单');
console.log('================================\n');

// 检查清单数据
const deploymentSteps = [
  {
    phase: "📁 本地环境准备",
    steps: [
      {
        id: "env-setup",
        title: "配置本地环境变量",
        description: "复制 .env.example 到 .env.local 并填入真实值",
        commands: [
          "cp .env.example .env.local",
          "# 编辑 .env.local 文件，填入 Supabase 和 OpenAI 配置"
        ],
        verification: "检查 .env.local 文件是否存在且包含必需的环境变量",
        critical: true
      },
      {
        id: "dependencies",
        title: "安装项目依赖",
        description: "安装所有必需的 npm 包",
        commands: ["pnpm install"],
        verification: "node_modules 目录存在且无错误",
        critical: true
      },
      {
        id: "type-check",
        title: "TypeScript 类型检查",
        description: "确保代码没有类型错误",
        commands: ["pnpm type-check"],
        verification: "TypeScript 编译通过，无错误输出",
        critical: true
      },
      {
        id: "local-build",
        title: "本地构建测试",
        description: "验证应用可以成功构建",
        commands: ["pnpm build"],
        verification: ".next 目录生成成功",
        critical: true
      },
      {
        id: "test-suite",
        title: "运行测试套件",
        description: "确保所有测试通过",
        commands: ["pnpm test", "pnpm test:e2e"],
        verification: "所有单元测试和 E2E 测试通过",
        critical: false
      }
    ]
  },
  {
    phase: "🗄️ Supabase 数据库设置",
    steps: [
      {
        id: "supabase-project",
        title: "创建 Supabase 项目",
        description: "在 Supabase Dashboard 创建新项目",
        commands: [
          "# 访问 https://supabase.com/dashboard",
          "# 点击 'New Project'",
          "# 项目名: teacherbean-prod",
          "# 选择地区: 最近的数据中心",
          "# 设置强密码并保存"
        ],
        verification: "项目创建成功，获得项目 URL",
        critical: true
      },
      {
        id: "database-schema",
        title: "执行数据库架构",
        description: "运行 schema.sql 创建表结构和 RLS 策略",
        commands: [
          "# 在 Supabase SQL Editor 中：",
          "# 1. 复制 supabase/schema.sql 全部内容",
          "# 2. 执行 SQL 脚本",
          "# 3. 确认所有表和函数创建成功"
        ],
        verification: "所有表、索引、RLS 策略和函数创建成功",
        critical: true
      },
      {
        id: "encryption-key",
        title: "更新数据库加密密钥",
        description: "为生产环境设置安全的加密密钥",
        commands: [
          "# 生成32位随机密钥",
          "# 在 SQL Editor 执行：",
          "ALTER DATABASE postgres SET app.encryption_key = 'your-production-key-32-chars';"
        ],
        verification: "加密密钥更新成功",
        critical: true
      },
      {
        id: "seed-data",
        title: "创建示例数据（可选）",
        description: "运行 seed.sql 创建测试账户和数据",
        commands: [
          "# 在 Supabase SQL Editor 中：",
          "# 1. 复制 supabase/seed.sql 全部内容",
          "# 2. 根据需要修改教师账户 UUID",
          "# 3. 执行 SQL 脚本"
        ],
        verification: "示例数据创建成功（2个教师，3个班级，20道题目）",
        critical: false
      },
      {
        id: "supabase-auth",
        title: "配置 Supabase 认证",
        description: "设置认证提供商和重定向 URL",
        commands: [
          "# 在 Authentication > Settings 中：",
          "# Site URL: https://your-app.vercel.app",
          "# Redirect URLs: https://your-app.vercel.app/auth/callback",
          "# 启用 Email 认证"
        ],
        verification: "认证设置保存成功",
        critical: true
      },
      {
        id: "supabase-credentials",
        title: "获取 Supabase 凭证",
        description: "复制项目 URL 和 API 密钥",
        commands: [
          "# 在 Settings > API 页面复制：",
          "# NEXT_PUBLIC_SUPABASE_URL",
          "# NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "# SUPABASE_SERVICE_ROLE_KEY"
        ],
        verification: "所有三个密钥已复制并保存",
        critical: true
      }
    ]
  },
  {
    phase: "🤖 OpenAI API 设置",
    steps: [
      {
        id: "openai-key",
        title: "获取 OpenAI API 密钥",
        description: "创建并配置 OpenAI API 密钥",
        commands: [
          "# 访问 https://platform.openai.com/api-keys",
          "# 创建新的 API 密钥",
          "# 复制密钥（只显示一次！）",
          "# 设置使用限制和预算警告"
        ],
        verification: "API 密钥创建成功且可用",
        critical: true
      },
      {
        id: "openai-limits",
        title: "配置使用限制",
        description: "设置 API 使用预算和警告",
        commands: [
          "# 在 Usage limits 中设置：",
          "# Monthly budget: $50",
          "# Email alerts: 启用",
          "# Hard limit: 启用"
        ],
        verification: "使用限制设置完成",
        critical: false
      }
    ]
  },
  {
    phase: "📦 GitHub 代码准备",
    steps: [
      {
        id: "git-commit",
        title: "提交所有更改",
        description: "确保所有代码更改已提交到 Git",
        commands: [
          "git add .",
          "git commit -m \"准备生产环境部署\"",
          "git push origin main"
        ],
        verification: "代码已推送到 GitHub 主分支",
        critical: true
      },
      {
        id: "github-secrets",
        title: "设置 GitHub Secrets（CI/CD）",
        description: "为 GitHub Actions 配置环境变量",
        commands: [
          "# 在 GitHub Repository > Settings > Secrets 中添加：",
          "# NEXT_PUBLIC_SUPABASE_URL",
          "# NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "# SUPABASE_SERVICE_ROLE_KEY"
        ],
        verification: "GitHub Secrets 配置完成",
        critical: false
      }
    ]
  },
  {
    phase: "🚀 Vercel 部署",
    steps: [
      {
        id: "vercel-import",
        title: "导入 GitHub 仓库到 Vercel",
        description: "连接 Vercel 与 GitHub 仓库",
        commands: [
          "# 访问 https://vercel.com/dashboard",
          "# 点击 'New Project'",
          "# 导入 GitHub 仓库",
          "# 选择正确的分支（main）"
        ],
        verification: "项目成功导入到 Vercel",
        critical: true
      },
      {
        id: "vercel-build-config",
        title: "配置构建设置",
        description: "设置 Vercel 构建参数",
        commands: [
          "# Framework Preset: Next.js",
          "# Build Command: pnpm run build",
          "# Output Directory: .next",
          "# Install Command: pnpm install",
          "# Node.js Version: 18.x"
        ],
        verification: "构建设置配置正确",
        critical: true
      },
      {
        id: "vercel-env-vars",
        title: "设置 Vercel 环境变量",
        description: "配置生产环境变量",
        commands: [
          "# 在 Settings > Environment Variables 中添加：",
          "# NEXT_PUBLIC_SUPABASE_URL (Production)",
          "# NEXT_PUBLIC_SUPABASE_ANON_KEY (Production)",
          "# SUPABASE_SERVICE_ROLE_KEY (Production)",
          "# OPENAI_API_KEY (Production)",
          "# NEXT_PUBLIC_APP_URL (Production)",
          "# NODE_ENV=production"
        ],
        verification: "所有必需的环境变量已设置",
        critical: true
      },
      {
        id: "vercel-deploy",
        title: "触发部署",
        description: "开始首次部署",
        commands: [
          "# Vercel 自动部署或手动触发",
          "# 监控 Deployments 页面",
          "# 检查构建日志"
        ],
        verification: "部署成功，获得生产环境 URL",
        critical: true
      }
    ]
  },
  {
    phase: "✅ 部署后验证",
    steps: [
      {
        id: "functional-test",
        title: "功能测试",
        description: "验证应用核心功能正常工作",
        commands: [
          "# 访问生产环境 URL",
          "# 测试用户注册/登录",
          "# 测试课程规划生成",
          "# 测试题目生成和组卷",
          "# 测试文档导出功能"
        ],
        verification: "所有核心功能正常工作",
        critical: true
      },
      {
        id: "performance-audit",
        title: "性能审计",
        description: "运行 Lighthouse 性能测试",
        commands: [
          "LIGHTHOUSE_URL=https://your-app.vercel.app pnpm audit:lighthouse"
        ],
        verification: "Lighthouse 分数达标（Performance ≥90, Accessibility ≥95）",
        critical: true
      },
      {
        id: "accessibility-check",
        title: "可访问性检查",
        description: "验证 WCAG AA 合规性",
        commands: [
          "LIGHTHOUSE_URL=https://your-app.vercel.app pnpm accessibility:check"
        ],
        verification: "可访问性测试通过",
        critical: true
      },
      {
        id: "error-monitoring",
        title: "检查错误日志",
        description: "确认没有运行时错误",
        commands: [
          "# 检查 Vercel Functions 日志",
          "# 检查 Supabase Logs",
          "# 检查浏览器控制台错误"
        ],
        verification: "无严重错误或异常",
        critical: true
      },
      {
        id: "domain-setup",
        title: "配置自定义域名（可选）",
        description: "设置生产域名",
        commands: [
          "# 在 Vercel Settings > Domains 添加域名",
          "# 配置 DNS 记录",
          "# 更新 Supabase 认证 URL",
          "# 更新环境变量中的 APP_URL"
        ],
        verification: "自定义域名配置成功",
        critical: false
      }
    ]
  },
  {
    phase: "🔧 生产环境优化",
    steps: [
      {
        id: "monitoring-setup",
        title: "设置监控和告警",
        description: "配置生产环境监控",
        commands: [
          "# 设置 Vercel Analytics",
          "# 配置 Uptime 监控",
          "# 设置错误告警（Sentry）",
          "# 配置性能监控"
        ],
        verification: "监控系统运行正常",
        critical: false
      },
      {
        id: "backup-strategy",
        title: "制定备份策略",
        description: "确保数据安全",
        commands: [
          "# 启用 Supabase 自动备份",
          "# 导出重要配置",
          "# 文档化回滚流程",
          "# 测试恢复程序"
        ],
        verification: "备份策略就位",
        critical: false
      },
      {
        id: "security-review",
        title: "安全检查",
        description: "验证生产环境安全性",
        commands: [
          "# 检查 RLS 策略",
          "# 验证环境变量安全",
          "# 确认 HTTPS 启用",
          "# 检查依赖安全性 (pnpm audit)"
        ],
        verification: "安全检查通过",
        critical: true
      }
    ]
  }
];

// 生成检查清单
function generateChecklist() {
  console.log('📋 完整部署检查清单');
  console.log('===================\n');

  let totalSteps = 0;
  let criticalSteps = 0;

  deploymentSteps.forEach((phase, phaseIndex) => {
    console.log(`${phase.phase}`);
    console.log('─'.repeat(50));

    phase.steps.forEach((step, stepIndex) => {
      totalSteps++;
      if (step.critical) criticalSteps++;

      const critical = step.critical ? '🔴' : '🔵';
      console.log(`\n${critical} ${phaseIndex + 1}.${stepIndex + 1} ${step.title}`);
      console.log(`   📝 ${step.description}`);

      if (step.commands.length > 0) {
        console.log('   💻 命令:');
        step.commands.forEach(cmd => {
          console.log(`      ${cmd}`);
        });
      }

      console.log(`   ✅ 验证: ${step.verification}`);

      if (step.critical) {
        console.log('   ⚠️  关键步骤 - 必须完成');
      }
    });

    console.log('\n');
  });

  console.log('📊 统计信息');
  console.log('============');
  console.log(`总步骤数: ${totalSteps}`);
  console.log(`关键步骤: ${criticalSteps}`);
  console.log(`可选步骤: ${totalSteps - criticalSteps}`);
  console.log('');

  console.log('🔴 关键步骤 - 必须完成才能成功部署');
  console.log('🔵 可选步骤 - 建议完成以获得最佳体验');
  console.log('');
}

// 生成交互式检查清单（JSON格式）
function generateInteractiveChecklist() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(process.cwd(), `deployment-checklist-${timestamp}.json`);

  const checklistData = {
    title: "TeacherBean 部署检查清单",
    version: "1.0.0",
    created: new Date().toISOString(),
    totalSteps: deploymentSteps.reduce((sum, phase) => sum + phase.steps.length, 0),
    criticalSteps: deploymentSteps.reduce((sum, phase) =>
      sum + phase.steps.filter(step => step.critical).length, 0
    ),
    phases: deploymentSteps.map(phase => ({
      ...phase,
      completed: false,
      steps: phase.steps.map(step => ({
        ...step,
        completed: false,
        notes: ""
      }))
    }))
  };

  fs.writeFileSync(outputFile, JSON.stringify(checklistData, null, 2));
  console.log(`📁 交互式检查清单已保存到: ${outputFile}`);
  console.log('   可以使用此文件跟踪部署进度');

  return outputFile;
}

// 生成快速参考指南
function generateQuickReference() {
  console.log('\n🚀 快速部署命令参考');
  console.log('=====================\n');

  console.log('本地环境设置:');
  console.log('cp .env.example .env.local');
  console.log('pnpm install');
  console.log('pnpm type-check');
  console.log('pnpm build');
  console.log('');

  console.log('测试命令:');
  console.log('pnpm test');
  console.log('pnpm test:e2e');
  console.log('pnpm audit:lighthouse');
  console.log('pnpm accessibility:check');
  console.log('');

  console.log('Git 部署:');
  console.log('git add .');
  console.log('git commit -m "部署到生产环境"');
  console.log('git push origin main');
  console.log('');

  console.log('关键 URL:');
  console.log('• Supabase Dashboard: https://supabase.com/dashboard');
  console.log('• OpenAI API Keys: https://platform.openai.com/api-keys');
  console.log('• Vercel Dashboard: https://vercel.com/dashboard');
  console.log('• GitHub: https://github.com');
  console.log('');
}

// 主函数
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--interactive') || args.includes('-i')) {
    const checklistFile = generateInteractiveChecklist();
    console.log('\n使用交互式检查清单:');
    console.log('1. 编辑 JSON 文件');
    console.log('2. 将 completed 字段设为 true');
    console.log('3. 在 notes 字段添加备注');
  } else if (args.includes('--quick') || args.includes('-q')) {
    generateQuickReference();
  } else {
    generateChecklist();
    console.log('\n💡 提示:');
    console.log('运行 node scripts/deployment-checklist.js --interactive 生成可编辑的检查清单');
    console.log('运行 node scripts/deployment-checklist.js --quick 查看快速命令参考');
  }

  console.log('\n🎉 准备好开始部署了！按照清单逐步完成即可成功部署 TeacherBean。');
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = { deploymentSteps, generateChecklist, generateInteractiveChecklist };