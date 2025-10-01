#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// 简单的HTML模板
const createHTML = (title, content) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - TeacherBean</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #2563eb;
            color: white;
            padding: 1rem 0;
            margin-bottom: 2rem;
        }
        .nav {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        .nav a {
            color: white;
            text-decoration: none;
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
        }
        .nav a:hover { background: rgba(255,255,255,0.3); }
        .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
        }
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            margin: 0.5rem 0.5rem 0.5rem 0;
        }
        .btn:hover { background: #1d4ed8; }
        .demo-box {
            border: 2px dashed #ddd;
            padding: 2rem;
            text-align: center;
            margin: 1rem 0;
            background: #f9f9f9;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .status {
            padding: 1rem;
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 4px;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>🎓 TeacherBean - AI教学助手</h1>
            <p>智能教案生成 • 课堂互动游戏 • 写作评改系统</p>
            <div class="nav">
                <a href="/">首页</a>
                <a href="/planner">教案规划</a>
                <a href="/classroom">课堂互动</a>
                <a href="/writing">写作评改</a>
                <a href="/library">资源库</a>
                <a href="/assess">测评系统</a>
            </div>
        </div>
    </div>
    <div class="container">
        ${content}
    </div>
</body>
</html>
`;

// 路由处理
const routes = {
    '/': () => createHTML('首页', `
        <div class="status">
            <strong>📢 演示说明：</strong> 当前为快速演示版本，展示TeacherBean的核心功能界面。完整功能需要启动Next.js开发服务器。
        </div>

        <div class="card">
            <h2>🎯 TeacherBean 三大核心功能</h2>
            <p>基于AI技术的智能教学助手，助力现代化教育</p>
        </div>

        <div class="feature-grid">
            <div class="card">
                <h3>📚 AI教案生成</h3>
                <p>输入主题和年级，AI自动生成完整教案，包括学习目标、教学活动、时间安排等。</p>
                <div class="demo-box">
                    <p>示例：七年级 "Food & Health" 主题</p>
                    <button class="btn" onclick="alert('演示：AI正在生成教案...\\n\\n✅ 已生成完整教案\\n- 学习目标：3个\\n- 教学活动：4个\\n- 估计时长：45分钟')">🚀 生成教案</button>
                </div>
                <a href="/planner" class="btn">进入教案规划</a>
            </div>

            <div class="card">
                <h3>🎮 课堂互动游戏</h3>
                <p>自动生成语法练习题，支持实时答题、计分统计，让课堂更有趣。</p>
                <div class="demo-box">
                    <p>示例：10道A2级语法选择题</p>
                    <button class="btn" onclick="startQuizDemo()">🎯 开始游戏</button>
                </div>
                <a href="/classroom" class="btn">进入课堂互动</a>
            </div>

            <div class="card">
                <h3>✍️ 智能写作评改</h3>
                <p>AI分析学生作文，提供详细的rubric评分、改进建议和修改版本。</p>
                <div class="demo-box">
                    <p>粘贴学生作文，获取AI评改</p>
                    <button class="btn" onclick="alert('演示：AI评改结果\\n\\n📊 总分：82/100\\n💪 优点：结构清晰，用词丰富\\n🎯 建议：增加高级词汇，优化句型')">📝 评改作文</button>
                </div>
                <a href="/writing" class="btn">进入写作评改</a>
            </div>
        </div>

        <div class="card">
            <h2>🚀 如何启动完整版本</h2>
            <p>要体验完整功能，请在终端运行：</p>
            <pre style="background: #f1f5f9; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
# 等待依赖安装完成，然后运行：
npm run dev

# 然后访问：http://localhost:3000
            </pre>
        </div>

        <script>
            function startQuizDemo() {
                let score = 0;
                const questions = [
                    { q: "She _____ to school every day.", a: "goes", options: ["go", "goes", "going", "went"] },
                    { q: "I _____ my homework when mom called.", a: "was doing", options: ["do", "did", "was doing", "have done"] }
                ];

                let result = "🎮 一分钟语法小游戏演示\\n\\n";
                questions.forEach((item, i) => {
                    result += \`题目\${i+1}: \${item.q}\\n正确答案: \${item.a}\\n\\n\`;
                    score += Math.random() > 0.3 ? 1 : 0;
                });

                result += \`🎯 最终得分: \${score}/\${questions.length}\\n\`;
                result += score === questions.length ? "🎉 太棒了！" : "💪 继续努力！";

                alert(result);
            }
        </script>
    `),

    '/planner': () => createHTML('教案规划', `
        <div class="card">
            <h2>📚 AI教案生成器</h2>
            <p>演示：七年级 "Food & Health" 教案生成</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                <div>
                    <h3>📝 输入信息</h3>
                    <div style="margin: 1rem 0;">
                        <label><strong>年级：</strong></label><br>
                        <input type="text" value="七年级" style="padding: 0.5rem; margin: 0.5rem 0; width: 100%; border: 1px solid #ddd; border-radius: 4px;" readonly>
                    </div>
                    <div style="margin: 1rem 0;">
                        <label><strong>主题：</strong></label><br>
                        <input type="text" value="Food & Health" style="padding: 0.5rem; margin: 0.5rem 0; width: 100%; border: 1px solid #ddd; border-radius: 4px;" readonly>
                    </div>
                    <div style="margin: 1rem 0;">
                        <label><strong>时长：</strong></label><br>
                        <input type="text" value="45分钟" style="padding: 0.5rem; margin: 0.5rem 0; width: 100%; border: 1px solid #ddd; border-radius: 4px;" readonly>
                    </div>
                    <button class="btn" onclick="generateLesson()">🚀 生成教案</button>
                </div>

                <div id="lesson-result" style="background: #f8fafc; padding: 1rem; border-radius: 4px;">
                    <h3>🎯 生成的教案</h3>
                    <p style="color: #666;">点击"生成教案"查看AI生成的完整教案内容...</p>
                </div>
            </div>
        </div>

        <script>
            function generateLesson() {
                document.getElementById('lesson-result').innerHTML = \`
                    <h3>✅ Food & Health - 七年级英语教案</h3>
                    <div style="margin: 1rem 0;">
                        <h4>🎯 学习目标</h4>
                        <ul>
                            <li>掌握健康饮食相关词汇</li>
                            <li>能够用英语描述饮食习惯</li>
                            <li>理解均衡饮食的重要性</li>
                        </ul>
                    </div>
                    <div style="margin: 1rem 0;">
                        <h4>📚 教学活动</h4>
                        <ul>
                            <li>热身活动 (5分钟) - 食物词汇复习</li>
                            <li>主要活动 (30分钟) - 健康饮食讨论</li>
                            <li>总结活动 (10分钟) - 制定健康计划</li>
                        </ul>
                    </div>
                    <button class="btn" onclick="alert('演示：教案已保存为模板！')">💾 保存模板</button>
                    <button class="btn" onclick="alert('演示：正在导出DOCX文件...')">📄 导出文档</button>
                \`;
            }
        </script>
    `),

    '/classroom': () => createHTML('课堂互动', `
        <div class="card">
            <h2>🎮 互动语法游戏</h2>
            <p>演示：A2级语法选择题游戏</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                <div>
                    <h3>⚙️ 游戏设置</h3>
                    <div style="margin: 1rem 0;">
                        <label><strong>难度级别：</strong></label><br>
                        <select style="padding: 0.5rem; width: 100%; border: 1px solid #ddd; border-radius: 4px;">
                            <option>A2</option>
                        </select>
                    </div>
                    <div style="margin: 1rem 0;">
                        <label><strong>题目数量：</strong></label><br>
                        <input type="number" value="10" style="padding: 0.5rem; width: 100%; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin: 1rem 0;">
                        <label><strong>游戏时长：</strong></label><br>
                        <input type="number" value="1" style="padding: 0.5rem; width: 100%; border: 1px solid #ddd; border-radius: 4px;"> 分钟
                    </div>
                    <button class="btn" onclick="startGame()">🎯 开始游戏</button>
                </div>

                <div id="game-area" style="background: #f8fafc; padding: 1rem; border-radius: 4px;">
                    <h3>🎮 游戏区域</h3>
                    <p style="color: #666;">点击"开始游戏"开始答题...</p>
                </div>
            </div>
        </div>

        <script>
            let currentQuestion = 0;
            let score = 0;
            const questions = [
                { q: "She _____ to school every day.", correct: "goes", options: ["go", "goes", "going", "went"] },
                { q: "I _____ my homework when mom called.", correct: "was doing", options: ["do", "did", "was doing", "have done"] },
                { q: "They _____ football tomorrow.", correct: "will play", options: ["play", "played", "will play", "are playing"] }
            ];

            function startGame() {
                currentQuestion = 0;
                score = 0;
                showQuestion();
            }

            function showQuestion() {
                if (currentQuestion >= questions.length) {
                    showResult();
                    return;
                }

                const q = questions[currentQuestion];
                document.getElementById('game-area').innerHTML = \`
                    <h3>题目 \${currentQuestion + 1}/\${questions.length}</h3>
                    <div style="margin: 1rem 0; font-size: 1.2em; font-weight: bold;">
                        \${q.q}
                    </div>
                    <div style="margin: 1rem 0;">
                        \${q.options.map((opt, i) =>
                            \`<button class="btn" onclick="selectAnswer('\${opt}')" style="display: block; margin: 0.5rem 0; width: 100%; text-align: left;">\${String.fromCharCode(65+i)}. \${opt}</button>\`
                        ).join('')}
                    </div>
                    <div style="margin-top: 1rem; color: #666;">
                        得分: \${score}/\${currentQuestion}
                    </div>
                \`;
            }

            function selectAnswer(answer) {
                const correct = questions[currentQuestion].correct;
                if (answer === correct) {
                    score++;
                    alert('✅ 正确！');
                } else {
                    alert(\`❌ 错误！正确答案是：\${correct}\`);
                }
                currentQuestion++;
                showQuestion();
            }

            function showResult() {
                const percentage = Math.round((score / questions.length) * 100);
                document.getElementById('game-area').innerHTML = \`
                    <h3>🎉 游戏结束！</h3>
                    <div style="text-align: center; margin: 2rem 0;">
                        <div style="font-size: 2em; color: #2563eb; font-weight: bold;">\${score}/\${questions.length}</div>
                        <div style="font-size: 1.2em; margin: 1rem 0;">准确率: \${percentage}%</div>
                        <div style="margin: 1rem 0;">
                            \${percentage >= 80 ? '🎉 太棒了！' : percentage >= 60 ? '👍 不错！' : '💪 继续努力！'}
                        </div>
                    </div>
                    <button class="btn" onclick="startGame()">🔄 再玩一次</button>
                    <button class="btn" onclick="alert('演示：游戏结果已保存！')">💾 保存结果</button>
                \`;
            }
        </script>
    `),

    '/writing': () => createHTML('写作评改', `
        <div class="card">
            <h2>✍️ AI写作评改系统</h2>
            <p>演示：智能作文评改和改进建议</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                <div>
                    <h3>📝 学生作文</h3>
                    <textarea id="essay-input" style="width: 100%; height: 300px; padding: 1rem; border: 1px solid #ddd; border-radius: 4px; font-family: inherit;" placeholder="在此粘贴学生作文...">My Favorite Season

I love autumn the most because it's a beautiful season. The leaves change color and become yellow, orange, and red. The weather is cool and comfortable.

In autumn, I can wear my favorite sweater and boots. I also enjoy walking in the park and seeing all the colorful leaves on the ground.

Another reason I love autumn is because of the food. We can eat fresh apples, pears, and pumpkins. My mother makes delicious pumpkin pie.

In conclusion, autumn is my favorite season because of the beautiful colors and delicious food.</textarea>
                    <button class="btn" onclick="assessWriting()" style="margin-top: 1rem;">🤖 AI评改</button>
                </div>

                <div id="assessment-result" style="background: #f8fafc; padding: 1rem; border-radius: 4px;">
                    <h3>📊 评改结果</h3>
                    <p style="color: #666;">点击"AI评改"获取详细的评分和建议...</p>
                </div>
            </div>
        </div>

        <script>
            function assessWriting() {
                document.getElementById('assessment-result').innerHTML = \`
                    <h3>📊 AI评改结果</h3>

                    <div style="margin: 1rem 0; padding: 1rem; background: white; border-radius: 4px;">
                        <h4>🎯 总体评分</h4>
                        <div style="font-size: 2em; color: #2563eb; font-weight: bold; text-align: center;">82/100</div>
                    </div>

                    <div style="margin: 1rem 0; padding: 1rem; background: white; border-radius: 4px;">
                        <h4>📋 详细评分</h4>
                        <div style="margin: 0.5rem 0;">内容 (30%): <strong>85分</strong></div>
                        <div style="margin: 0.5rem 0;">结构 (25%): <strong>80分</strong></div>
                        <div style="margin: 0.5rem 0;">语言 (25%): <strong>78分</strong></div>
                        <div style="margin: 0.5rem 0;">机械性 (20%): <strong>85分</strong></div>
                    </div>

                    <div style="margin: 1rem 0; padding: 1rem; background: white; border-radius: 4px;">
                        <h4>💪 优点</h4>
                        <ul>
                            <li>文章结构清晰，有明确的引言和结论</li>
                            <li>使用了丰富的形容词描述季节特点</li>
                            <li>个人经历的描述生动具体</li>
                        </ul>
                    </div>

                    <div style="margin: 1rem 0; padding: 1rem; background: white; border-radius: 4px;">
                        <h4>🎯 改进建议</h4>
                        <ul>
                            <li>可以使用更多高级词汇替换简单词汇</li>
                            <li>句型可以更加多样化</li>
                            <li>部分句子可以合并以提高流畅度</li>
                        </ul>
                    </div>

                    <button class="btn" onclick="showImprovedVersion()">📝 查看改进版本</button>
                    <button class="btn" onclick="alert('演示：正在导出评改报告DOCX...')">📄 导出报告</button>
                \`;
            }

            function showImprovedVersion() {
                alert('📝 AI改进版本：\\n\\nAmong the four seasons, autumn holds a special place in my heart due to its breathtaking beauty and comfortable atmosphere. As the season transitions, leaves transform into a spectacular palette of golden yellow, vibrant orange, and deep crimson...\\n\\n(显示完整的改进版本)');
            }
        </script>
    `),

    '/library': () => createHTML('资源库', `
        <div class="card">
            <h2>📚 教学资源库</h2>
            <p>管理和分享您的教学资源与模板</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin: 2rem 0;">
                <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 1rem;">
                    <h3>📖 我的教案模板</h3>
                    <p>Food & Health - 七年级</p>
                    <p style="color: #666; font-size: 0.9em;">2024-01-15 创建</p>
                    <button class="btn" style="font-size: 0.9em;">📥 应用到班级</button>
                </div>

                <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 1rem;">
                    <h3>🎮 语法游戏模板</h3>
                    <p>Present Simple练习题</p>
                    <p style="color: #666; font-size: 0.9em;">2024-01-14 创建</p>
                    <button class="btn" style="font-size: 0.9em;">⭐ 收藏</button>
                </div>

                <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 1rem;">
                    <h3>✍️ 写作评分标准</h3>
                    <p>描述文评分rubric</p>
                    <p style="color: #666; font-size: 0.9em;">2024-01-13 创建</p>
                    <button class="btn" style="font-size: 0.9em;">🔗 分享</button>
                </div>
            </div>
        </div>
    `),

    '/assess': () => createHTML('测评系统', `
        <div class="card">
            <h2>📊 智能测评系统</h2>
            <p>题库管理 • 组卷器 • 在线测验 • 学情分析</p>

            <div class="feature-grid">
                <div class="card">
                    <h3>📝 题库管理</h3>
                    <p>已有题目：156道</p>
                    <div style="margin: 1rem 0;">
                        <div>选择题：89道</div>
                        <div>填空题：34道</div>
                        <div>阅读理解：33道</div>
                    </div>
                    <button class="btn">➕ 添加题目</button>
                </div>

                <div class="card">
                    <h3>📋 智能组卷</h3>
                    <p>根据难度和题型自动组卷</p>
                    <div style="margin: 1rem 0;">
                        <div>A2级别：60%</div>
                        <div>B1级别：40%</div>
                    </div>
                    <button class="btn">🎲 自动组卷</button>
                </div>

                <div class="card">
                    <h3>📈 学情分析</h3>
                    <p>智能分析学生表现</p>
                    <div style="margin: 1rem 0;">
                        <div>平均分：78.5</div>
                        <div>完成率：94%</div>
                    </div>
                    <button class="btn">📊 查看报告</button>
                </div>
            </div>
        </div>
    `)
};

// 创建服务器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 设置响应头
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });

    // 路由处理
    if (routes[pathname]) {
        res.end(routes[pathname]());
    } else {
        // 404页面
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(createHTML('页面未找到', `
            <div class="card">
                <h2>❌ 页面未找到</h2>
                <p>抱歉，您访问的页面不存在。</p>
                <a href="/" class="btn">🏠 返回首页</a>
            </div>
        `));
    }
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`
🎓 TeacherBean 快速演示服务器已启动！

📱 访问地址：http://localhost:${PORT}
🚀 核心功能：
   - 教案规划：http://localhost:${PORT}/planner
   - 课堂互动：http://localhost:${PORT}/classroom
   - 写作评改：http://localhost:${PORT}/writing
   - 资源库：http://localhost:${PORT}/library
   - 测评系统：http://localhost:${PORT}/assess

💡 提示：这是简化的演示版本
   完整功能请运行：npm run dev
`);
});