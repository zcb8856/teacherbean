'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Users, BookOpen, Calendar, Edit, Plus, AlertCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Student {
  id: string
  alias: string
  student_number: string
  created_at: string
}

interface Assignment {
  id: string
  title: string
  type: 'quiz' | 'homework' | 'writing'
  due_at: string | null
  is_published: boolean
  created_at: string
}

interface ClassDetail {
  id: string
  name: string
  grade: string | null
  description: string | null
  created_at: string
  updated_at: string
  students: Student[]
  assignments: Assignment[]
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const [classData, setClassData] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // 获取班级详情
  const fetchClassDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/classes/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取班级详情失败')
      }

      setClassData(data.class)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取班级详情失败'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClassDetail()
  }, [params.id])

  // 获取作业类型标签样式
  const getAssignmentTypeStyle = (type: string) => {
    const styles = {
      quiz: 'bg-blue-100 text-blue-800',
      homework: 'bg-green-100 text-green-800',
      writing: 'bg-purple-100 text-purple-800'
    }
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  // 获取作业类型中文名
  const getAssignmentTypeName = (type: string) => {
    const names = {
      quiz: '测验',
      homework: '作业',
      writing: '写作'
    }
    return names[type as keyof typeof names] || type
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">班级详情</h1>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchClassDetail}>重试</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/classes">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回班级列表
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
            {classData.grade && (
              <p className="text-gray-600">{classData.grade}</p>
            )}
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          编辑班级
        </Button>
      </div>

      {/* 班级信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>班级信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">班级名称:</span>
                  <span>{classData.name}</span>
                </div>
                {classData.grade && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">年级:</span>
                    <span>{classData.grade}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">创建时间:</span>
                  <span>{formatRelativeTime(classData.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">更新时间:</span>
                  <span>{formatRelativeTime(classData.updated_at)}</span>
                </div>
              </div>
            </div>
            {classData.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">班级描述</h4>
                <p className="text-sm text-gray-600">{classData.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">学生总数</p>
                <p className="text-2xl font-bold text-gray-900">{classData.students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">作业总数</p>
                <p className="text-2xl font-bold text-gray-900">{classData.assignments.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已发布作业</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classData.assignments.filter(a => a.is_published).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 学生和作业列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 学生列表 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>学生列表</CardTitle>
                <CardDescription>
                  管理班级中的学生
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                添加学生
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {classData.students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">还没有学生</p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个学生
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {classData.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{student.alias}</div>
                      {student.student_number && (
                        <div className="text-sm text-gray-600">学号: {student.student_number}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(student.created_at)}
                    </div>
                  </div>
                ))}
                {classData.students.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full">
                    查看全部 {classData.students.length} 个学生
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 作业列表 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>作业列表</CardTitle>
                <CardDescription>
                  查看和管理班级作业
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                创建作业
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {classData.assignments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">还没有作业</p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个作业
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {classData.assignments.map((assignment) => (
                  <div key={assignment.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">{assignment.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${getAssignmentTypeStyle(assignment.type)}`}>
                            {getAssignmentTypeName(assignment.type)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            assignment.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.is_published ? '已发布' : '草稿'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {assignment.due_at && (
                        <div>截止: {new Date(assignment.due_at).toLocaleString()}</div>
                      )}
                      <div>创建: {formatRelativeTime(assignment.created_at)}</div>
                    </div>
                  </div>
                ))}
                {classData.assignments.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full">
                    查看全部 {classData.assignments.length} 个作业
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}