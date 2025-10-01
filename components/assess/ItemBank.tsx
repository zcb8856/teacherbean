'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import type { Item } from '@/types/assess'
import toast from 'react-hot-toast'

interface ItemBankProps {}

export function ItemBank({}: ItemBankProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    type: 'all',
    level: 'all',
    difficulty: 'all',
    tags: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 加载题目数据
  const loadItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== 'all' && value !== '')
        )
      })

      const response = await fetch(`/api/items?${params}`)
      if (!response.ok) throw new Error('Failed to load items')

      const data = await response.json()
      setItems(data.data)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }))
    } catch (error) {
      console.error('Error loading items:', error)
      toast.error('加载题目失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [pagination.page, searchQuery, filters])

  // 删除题目
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这道题目吗？')) return

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete item')

      toast.success('题目删除成功')
      loadItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('删除失败')
    }
  }

  // 题型映射
  const itemTypeMap = {
    mcq: '选择题',
    cloze: '填空题',
    error_correction: '改错题',
    matching: '配对题',
    reading_q: '阅读理解',
    writing_task: '写作任务'
  }

  // 难度等级颜色
  const getDifficultyColor = (score: number) => {
    if (score <= 0.3) return 'bg-green-100 text-green-800'
    if (score <= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getDifficultyLabel = (score: number) => {
    if (score <= 0.3) return '容易'
    if (score <= 0.6) return '中等'
    return '困难'
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">题库管理</h2>
          <p className="text-gray-600">管理您的测评题目资源</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            批量导入
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出题库
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建题目
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            搜索与筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 搜索框 */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索题目内容、话题、语法点..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 题型筛选 */}
            <div>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="题型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部题型</SelectItem>
                  <SelectItem value="mcq">选择题</SelectItem>
                  <SelectItem value="cloze">填空题</SelectItem>
                  <SelectItem value="error_correction">改错题</SelectItem>
                  <SelectItem value="matching">配对题</SelectItem>
                  <SelectItem value="reading_q">阅读理解</SelectItem>
                  <SelectItem value="writing_task">写作任务</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 级别筛选 */}
            <div>
              <Select
                value={filters.level}
                onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 难度筛选 */}
            <div>
              <Select
                value={filters.difficulty}
                onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="难度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部难度</SelectItem>
                  <SelectItem value="easy">容易</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 标签筛选 */}
          <div className="mt-4">
            <Input
              placeholder="标签筛选（用逗号分隔）如：grammar, present_simple, vocabulary"
              value={filters.tags}
              onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          {/* 重置按钮 */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setFilters({
                  type: 'all',
                  level: 'all',
                  difficulty: 'all',
                  tags: ''
                })
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重置筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 题目列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">加载中...</p>
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">暂无题目数据</p>
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* 题目标签 */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">
                        {itemTypeMap[item.type as keyof typeof itemTypeMap]}
                      </Badge>
                      <Badge variant="outline">
                        {item.level}
                      </Badge>
                      <Badge
                        className={getDifficultyColor(item.difficulty_score)}
                        variant="outline"
                      >
                        {getDifficultyLabel(item.difficulty_score)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        使用次数: {item.usage_count}
                      </span>
                      {item.correct_rate && (
                        <span className="text-sm text-gray-500">
                          正确率: {(item.correct_rate * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {/* 题目内容 */}
                    <div className="mb-3">
                      <p className="font-medium text-lg mb-2">{item.stem}</p>

                      {/* 选择题选项 */}
                      {item.type === 'mcq' && item.options_json && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {(item.options_json as string[]).map((option, idx) => (
                            <div
                              key={idx}
                              className={`text-sm p-2 rounded border ${
                                idx === (item.answer_json as number)
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}. {option}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 解释说明 */}
                      {item.explanation && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>解释：</strong> {item.explanation}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 标签 */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* 来源信息 */}
                    {item.source && (
                      <p className="text-xs text-gray-500 mt-2">
                        来源: {item.source}
                      </p>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            上一页
          </Button>

          <span className="text-sm text-gray-600">
            第 {pagination.page} 页，共 {pagination.totalPages} 页
          </span>

          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}