'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BookOpen, Clock, Users, Target, Download, Save, Home, FileText, Bookmark } from 'lucide-react'
import type { LessonPlanForm, CEFRLevel } from '@/types'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

export default function LessonPlanPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<LessonPlanForm>({
    title: '',
    level: 'A2',
    duration: 45,
    topic: '',
    focus_skills: [],
    class_size: 25,
    student_level: 'Beginner to Intermediate',
    special_requirements: '',
    // 新增教案设计字段
    subject: '',
    grade: '',
    textbook: '',
    curriculum_standards: '',
    teaching_objectives: '',
    key_points: '',
    difficult_points: '',
    teaching_methods: []
  })
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const skillOptions = ['Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Pronunciation']
  const gradeOptions = ['小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级', '初中一年级', '初中二年级', '初中三年级', '高中一年级', '高中二年级', '高中三年级']
  const subjectOptions = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '音乐', '美术', '体育', '信息技术']
  const teachingMethodOptions = ['讲授法', '讨论法', '演示法', '练习法', '实验法', '任务驱动法', '合作学习', '探究学习', '情境教学', '游戏教学']

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      focus_skills: prev.focus_skills.includes(skill)
        ? prev.focus_skills.filter(s => s !== skill)
        : [...prev.focus_skills, skill]
    }))
  }

  const handleTeachingMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      teaching_methods: prev.teaching_methods.includes(method)
        ? prev.teaching_methods.filter(m => m !== method)
        : [...prev.teaching_methods, method]
    }))
  }

  const handleGeneratePlan = async () => {
    if (!formData.title || !formData.subject || !formData.grade || !formData.teaching_objectives) {
      toast.error('请填写所有必填字段（课题、学科、年级、教学目标）')
      return
    }

    setLoading(true)
    try {
      // 检查是否是开发者模式或演示模式
      if (process.env.NODE_ENV === 'development' || true) {
        // 演示模式：生成模拟的教案
        setTimeout(() => {
          const demoLessonPlan = {
            title: formData.title,
            subject: formData.subject,
            grade: formData.grade,
            duration: formData.duration,
            textbook: formData.textbook,
            teaching_objectives: formData.teaching_objectives,
            key_points: formData.key_points,
            difficult_points: formData.difficult_points,
            teaching_methods: formData.teaching_methods.join('、'),
            curriculum_standards: formData.curriculum_standards,
            teaching_process: [
              {
                step: '导入环节',
                duration: 5,
                activities: '通过多媒体展示相关图片，激发学生学习兴趣，引入本节课主题',
                purpose: '营造学习氛围，激发学习兴趣'
              },
              {
                step: '新课讲授',
                duration: 20,
                activities: '结合教材内容，运用' + (formData.teaching_methods.slice(0, 2).join('、') || '讲授法、讨论法') + '等方法进行知识点讲解',
                purpose: '让学生掌握核心知识点，突破教学重点'
              },
              {
                step: '巩固练习',
                duration: 12,
                activities: '设计层次性练习，让学生在实践中深化理解',
                purpose: '巩固所学知识，突破教学难点'
              },
              {
                step: '总结提升',
                duration: 6,
                activities: '师生共同总结本节课重点内容，布置课后作业',
                purpose: '梳理知识脈络，为下节课做准备'
              },
              {
                step: '板书设计',
                duration: 2,
                activities: '设计简洁明了的板书，突出重点难点',
                purpose: '帮助学生理清思路，形成知识结构'
              }
            ],
            assessment_methods: '采用过程性评价与终结性评价相结合的方式，通过课堂观察、提问、练习等多种形式评价学生学习效果',
            homework: '完成课后练习题，预习下节课内容，思考相关问题',
            teaching_reflection: '本节课设计注重理论与实践相结合，通过多样化的教学方法提高学生学习兴趣和参与度'
          }
          setGeneratedPlan(demoLessonPlan)
          toast.success('教案生成成功！')
          setLoading(false)
        }, 1500)
        return
      }

      const response = await fetch('/api/generate/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to generate lesson plan')

      const data = await response.json()
      setGeneratedPlan(data)
      toast.success('教案生成成功！')
    } catch (error) {
      toast.error('生成教案失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlan = async () => {
    if (!generatedPlan) return

    try {
      // 检查是否是开发者模式或演示模式
      if (process.env.NODE_ENV === 'development' || true) {
        // 演示模式：模拟保存成功
        setTimeout(() => {
          toast.success('教案已保存到资料库！')
        }, 500)
        return
      }

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lesson_plan',
          title: formData.title,
          content_json: generatedPlan,
          tags: [formData.topic, ...formData.focus_skills],
          cefr_level: formData.level,
          estimated_duration: formData.duration
        })
      })

      if (!response.ok) throw new Error('Failed to save lesson plan')

      toast.success('教案已保存到资料库！')
    } catch (error) {
      toast.error('保存教案失败')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">教案设计</h1>
          <p className="text-text-primary-light">基于课程标准和教学要求，AI智能生成符合教学目标的详细教案</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-soft-cyan-50 border-soft-cyan-200">
            <Home className="h-4 w-4" />
            {t('Back to Home')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <FileText className="h-5 w-5" />
              教案设计详情
            </CardTitle>
            <CardDescription className="text-text-primary-light">
              填写课题、教学目标和课程标准，生成符合教学要求的详细教案
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">课题名称 *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="例如：二次函数的图像和性质"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">学科 *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">请选择学科</option>
                  {subjectOptions.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">年级 *</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">请选择年级</option>
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">课时时长（分钟）</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="15"
                  max="120"
                  placeholder="45"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">使用教材</label>
                <Input
                  value={formData.textbook || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, textbook: e.target.value }))}
                  placeholder="例如：人教版九年级上册"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">教学目标 *</label>
              <textarea
                value={formData.teaching_objectives}
                onChange={(e) => setFormData(prev => ({ ...prev, teaching_objectives: e.target.value }))}
                placeholder="请描述本节课的教学目标，包括知识目标、能力目标和情感目标..."
                className="w-full p-3 rounded-md border border-input bg-background min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">课程标准</label>
              <textarea
                value={formData.curriculum_standards}
                onChange={(e) => setFormData(prev => ({ ...prev, curriculum_standards: e.target.value }))}
                placeholder="请输入相关的课程标准和教学要求..."
                className="w-full p-3 rounded-md border border-input bg-background min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">教学重点</label>
                <textarea
                  value={formData.key_points}
                  onChange={(e) => setFormData(prev => ({ ...prev, key_points: e.target.value }))}
                  placeholder="请列出本节课的教学重点..."
                  className="w-full p-3 rounded-md border border-input bg-background min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">教学难点</label>
                <textarea
                  value={formData.difficult_points}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficult_points: e.target.value }))}
                  placeholder="请列出本节课的教学难点..."
                  className="w-full p-3 rounded-md border border-input bg-background min-h-[80px]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">教学方法</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {teachingMethodOptions.map(method => (
                  <label key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.teaching_methods.includes(method)}
                      onChange={() => handleTeachingMethodToggle(method)}
                      className="rounded"
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">其他要求</label>
              <textarea
                value={formData.special_requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
                placeholder="其他特殊要求或补充说明..."
                className="w-full p-3 rounded-md border border-input bg-background min-h-[60px]"
              />
            </div>

            <Button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full bg-gradient-to-r from-soft-cyan-600 to-soft-cyan-700 hover:from-soft-cyan-700 hover:to-soft-cyan-800"
            >
              {loading ? '正在生成...' : '生成教案'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Plan Section */}
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Bookmark className="h-5 w-5" />
              生成的教案
            </CardTitle>
            <CardDescription className="text-text-primary-light">
              AI生成的详细教案将在这里显示
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedPlan ? (
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Button onClick={handleSavePlan} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    保存到资料库
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    导出 PDF
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* 教案基本信息 */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-bold text-xl mb-3 text-center border-b pb-2">{generatedPlan.title}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>学科：</strong>{generatedPlan.subject}</div>
                      <div><strong>年级：</strong>{generatedPlan.grade}</div>
                      <div><strong>课时：</strong>{generatedPlan.duration}分钟</div>
                      <div><strong>教材：</strong>{generatedPlan.textbook || '未指定'}</div>
                    </div>
                  </div>

                  {/* 教学目标 */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-lg mb-2 text-soft-cyan-700">教学目标</h4>
                    <div className="text-sm text-gray-700">{generatedPlan.teaching_objectives}</div>
                  </div>

                  {/* 课程标准 */}
                  {generatedPlan.curriculum_standards && (
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-lg mb-2 text-soft-cyan-700">课程标准</h4>
                      <div className="text-sm text-gray-700">{generatedPlan.curriculum_standards}</div>
                    </div>
                  )}

                  {/* 重点难点 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-lg mb-2 text-soft-cyan-700">教学重点</h4>
                      <div className="text-sm text-gray-700">{generatedPlan.key_points}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-lg mb-2 text-soft-cyan-700">教学难点</h4>
                      <div className="text-sm text-gray-700">{generatedPlan.difficult_points}</div>
                    </div>
                  </div>

                  {/* 教学方法 */}
                  {generatedPlan.teaching_methods && (
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-lg mb-2 text-soft-cyan-700">教学方法</h4>
                      <div className="text-sm text-gray-700">{generatedPlan.teaching_methods}</div>
                    </div>
                  )}

                  {/* 教学过程 */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-lg mb-4 text-soft-cyan-700">教学过程</h4>
                    <div className="space-y-4">
                      {generatedPlan.teaching_process?.map((step: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-soft-cyan-300 pl-4 py-2">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-soft-cyan-800">{step.step}</h5>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{step.duration}分钟</span>
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>活动内容：</strong>{step.activities}
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>设计意图：</strong>{step.purpose}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 评价与作业 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-lg mb-2 text-soft-cyan-700">教学评价</h4>
                      <div className="text-sm text-gray-700">{generatedPlan.assessment_methods}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-lg mb-2 text-soft-cyan-700">课后作业</h4>
                      <div className="text-sm text-gray-700">{generatedPlan.homework}</div>
                    </div>
                  </div>

                  {/* 教学反思 */}
                  {generatedPlan.teaching_reflection && (
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-lg mb-2 text-soft-cyan-700">教学反思</h4>
                      <div className="text-sm text-gray-700">{generatedPlan.teaching_reflection}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-text-primary-muted">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>填写表单并点击“生成教案”按钮，AI将为您生成详细的教案内容。</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}