'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X } from 'lucide-react'

interface ClassFormData {
  name: string
  grade: string
  description: string
}

interface ClassFormProps {
  title: string
  initialData?: Partial<ClassFormData>
  onSubmit: (data: ClassFormData) => Promise<void>
  onCancel: () => void
}

export function ClassForm({ title, initialData, onSubmit, onCancel }: ClassFormProps) {
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    grade: '',
    description: ''
  })
  const [errors, setErrors] = useState<Partial<ClassFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        grade: initialData.grade || '',
        description: initialData.description || ''
      })
    }
  }, [initialData])

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<ClassFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = '班级名称不能为空'
    } else if (formData.name.length > 100) {
      newErrors.name = '班级名称不能超过100字符'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = '描述不能超过500字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleInputChange = (field: keyof ClassFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      // 错误处理在父组件中进行
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4" onKeyDown={handleKeyDown}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                填写班级信息以继续
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 班级名称 */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                班级名称 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例如：八年级1班"
                className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.name.length}/100 字符
              </p>
            </div>

            {/* 年级 */}
            <div>
              <label className="text-sm font-medium text-gray-700">年级</label>
              <select
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">选择年级</option>
                <option value="小学一年级">小学一年级</option>
                <option value="小学二年级">小学二年级</option>
                <option value="小学三年级">小学三年级</option>
                <option value="小学四年级">小学四年级</option>
                <option value="小学五年级">小学五年级</option>
                <option value="小学六年级">小学六年级</option>
                <option value="初一">初一</option>
                <option value="初二">初二</option>
                <option value="初三">初三</option>
                <option value="高一">高一</option>
                <option value="高二">高二</option>
                <option value="高三">高三</option>
                <option value="成人班">成人班</option>
                <option value="其他">其他</option>
              </select>
            </div>

            {/* 描述 */}
            <div>
              <label className="text-sm font-medium text-gray-700">班级描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="描述班级的特点、目标或其他信息..."
                rows={3}
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-md resize-none text-sm ${
                  errors.description ? 'border-red-500 focus:border-red-500' : 'border-input'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.description.length}/500 字符
              </p>
            </div>

            {/* 按钮 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : (initialData ? '更新' : '创建')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}