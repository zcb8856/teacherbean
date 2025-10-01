'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Users, Plus, Search, Edit, Trash2, Calendar, BookOpen, AlertCircle } from 'lucide-react'
import { ClassForm } from '@/components/classes/ClassForm'
import { ConfirmDialog } from '@/components/classes/ConfirmDialog'
import { createClient } from '@/lib/supabase'
import type { Class } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ClassWithStats extends Class {
  student_count: number
  assignment_count: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassWithStats | null>(null)
  const [deletingClass, setDeletingClass] = useState<ClassWithStats | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [error, setError] = useState<string | null>(null)

  // 获取班级列表
  const fetchClasses = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const supabase = createClient()
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      })

      const response = await fetch(`/api/classes?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取班级列表失败')
      }

      setClasses(data.classes)
      setPagination(data.pagination)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取班级列表失败'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 创建班级
  const handleCreateClass = async (classData: { name: string; grade?: string; description?: string }) => {
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '创建班级失败')
      }

      toast.success('班级创建成功!')
      setShowCreateForm(false)
      fetchClasses(pagination.page, searchTerm)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建班级失败'
      toast.error(errorMessage)
    }
  }

  // 更新班级
  const handleUpdateClass = async (classData: { name: string; grade?: string; description?: string }) => {
    if (!editingClass) return

    try {
      const response = await fetch(`/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新班级失败')
      }

      toast.success('班级更新成功!')
      setEditingClass(null)
      fetchClasses(pagination.page, searchTerm)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新班级失败'
      toast.error(errorMessage)
    }
  }

  // 删除班级
  const handleDeleteClass = async () => {
    if (!deletingClass) return

    try {
      const response = await fetch(`/api/classes/${deletingClass.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '删除班级失败')
      }

      toast.success('班级删除成功!')
      setDeletingClass(null)
      fetchClasses(pagination.page, searchTerm)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除班级失败'
      toast.error(errorMessage)
    }
  }

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    fetchClasses(1, value)
  }

  // 分页处理
  const handlePageChange = (newPage: number) => {
    fetchClasses(newPage, searchTerm)
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">班级管理</h1>
          <p className="text-text-primary-light">管理您的班级、学生和教学活动</p>
        </div>
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-soft-cyan-600" />
              <h3 className="text-lg font-medium text-text-primary mb-2">加载失败</h3>
              <p className="text-text-primary-light mb-4">{error}</p>
              <Button onClick={() => fetchClasses()}>重试</Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-sm">班级管理</h1>
          <p className="text-text-primary-light">管理您的班级、学生和教学活动</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建班级
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-primary-muted" />
        <Input
          placeholder="搜索班级名称或年级..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 班级统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">总班级数</p>
                <p className="text-2xl font-bold text-text-primary">{pagination.total}</p>
              </div>
              <Users className="h-8 w-8 text-soft-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">总学生数</p>
                <p className="text-2xl font-bold text-text-primary">
                  {classes.reduce((sum, cls) => sum + cls.student_count, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-soft-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary-light">总作业数</p>
                <p className="text-2xl font-bold text-text-primary">
                  {classes.reduce((sum, cls) => sum + cls.assignment_count, 0)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-soft-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 班级列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-soft-cyan-50 border-soft-cyan-200">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card className="bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-soft-cyan-600" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {searchTerm ? '未找到匹配的班级' : '还没有班级'}
              </h3>
              <p className="text-text-primary-light mb-4">
                {searchTerm ? '尝试调整搜索条件' : '创建您的第一个班级开始教学'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建班级
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow bg-soft-cyan-50 border-soft-cyan-200 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-text-primary">{classItem.name}</CardTitle>
                      {classItem.grade && (
                        <CardDescription className="text-text-primary-light">{classItem.grade}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingClass(classItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingClass(classItem)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classItem.description && (
                      <p className="text-sm text-text-primary-light line-clamp-2">
                        {classItem.description}
                      </p>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1 text-text-primary-light">
                        <Users className="h-4 w-4 text-soft-cyan-600" />
                        {classItem.student_count} 学生
                      </span>
                      <span className="flex items-center gap-1 text-text-primary-light">
                        <BookOpen className="h-4 w-4 text-soft-cyan-600" />
                        {classItem.assignment_count} 作业
                      </span>
                    </div>

                    <div className="text-xs text-text-primary-muted flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-soft-cyan-600" />
                      创建于 {formatRelativeTime(classItem.created_at)}
                    </div>

                    <Link href={`/classes/${classItem.id}`}>
                      <Button className="w-full" size="sm">
                        管理班级
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                上一页
              </Button>
              <span className="flex items-center px-4 text-sm text-text-primary-light">
                第 {pagination.page} 页，共 {pagination.totalPages} 页
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* 创建班级表单 */}
      {showCreateForm && (
        <ClassForm
          onSubmit={handleCreateClass}
          onCancel={() => setShowCreateForm(false)}
          title="创建新班级"
        />
      )}

      {/* 编辑班级表单 */}
      {editingClass && (
        <ClassForm
          initialData={{
            name: editingClass.name,
            grade: editingClass.grade || undefined,
            description: editingClass.description || undefined
          }}
          onSubmit={handleUpdateClass}
          onCancel={() => setEditingClass(null)}
          title="编辑班级"
        />
      )}

      {/* 删除确认对话框 */}
      {deletingClass && (
        <ConfirmDialog
          title="删除班级"
          message={`确定要删除班级 "${deletingClass.name}" 吗？此操作不可撤销。`}
          onConfirm={handleDeleteClass}
          onCancel={() => setDeletingClass(null)}
          confirmText="删除"
          cancelText="取消"
          type="danger"
        />
      )}
      </div>
    </div>
  )
}