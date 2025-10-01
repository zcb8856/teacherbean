'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  Search,
  Filter,
  Star,
  StarOff,
  FileText,
  Presentation,
  BookOpen,
  MessageSquare,
  Gamepad2,
  Layout,
  Download,
  Eye,
  Users,
  Calendar,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import type { Material, MaterialSearchFilters } from '@/types/library'
import toast from 'react-hot-toast'

interface TemplateCenterProps {}

export function TemplateCenter({}: TemplateCenterProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorited'>('all')
  const [filters, setFilters] = useState<MaterialSearchFilters>({
    search: '',
    type: 'all',
    shared: 'school',
    cefr_level: 'all',
    tags: '',
    owner: '',
    school: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [selectedClasses, setSelectedClasses] = useState<any[]>([])

  // Material type configuration
  const materialTypes = {
    lesson_plan: { icon: BookOpen, label: '教案设计', color: 'bg-blue-100 text-blue-800' },
    ppt_outline: { icon: Presentation, label: 'PPT大纲', color: 'bg-orange-100 text-orange-800' },
    reading: { icon: FileText, label: '阅读材料', color: 'bg-green-100 text-green-800' },
    dialog: { icon: MessageSquare, label: '对话练习', color: 'bg-purple-100 text-purple-800' },
    game: { icon: Gamepad2, label: '互动游戏', color: 'bg-pink-100 text-pink-800' },
    template: { icon: Layout, label: '通用模板', color: 'bg-gray-100 text-gray-800' }
  }

  // Load materials
  const loadMaterials = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        shared: 'school',
        exclude_own: 'true',
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => key !== 'shared' && value !== 'all' && value !== '')
        )
      })

      if (activeFilter === 'favorited') {
        params.append('favorited_only', 'true')
      }

      const response = await fetch(`/api/materials?${params}`)
      if (!response.ok) throw new Error('Failed to load materials')

      const data = await response.json()
      setMaterials(data.data)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }))

      // Load favorites
      const favoritesSet = new Set(
        data.data.filter((m: Material) => m.is_favorited).map((m: Material) => m.id)
      )
      setFavorites(favoritesSet)
    } catch (error) {
      console.error('Error loading materials:', error)
      toast.error('加载模板失败')
    } finally {
      setLoading(false)
    }
  }

  // Load user's classes
  const loadClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (!response.ok) throw new Error('Failed to load classes')

      const data = await response.json()
      setSelectedClasses(data.data || [])
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  useEffect(() => {
    loadMaterials()
    loadClasses()
  }, [pagination.page, filters, activeFilter])

  // Handle favorite/unfavorite
  const handleFavorite = async (materialId: string) => {
    try {
      const isFavorited = favorites.has(materialId)
      const method = isFavorited ? 'DELETE' : 'POST'

      const response = await fetch(`/api/materials/${materialId}/favorite`, {
        method
      })

      if (!response.ok) throw new Error('Failed to update favorite')

      const newFavorites = new Set(favorites)
      if (isFavorited) {
        newFavorites.delete(materialId)
        toast.success('已取消收藏')
      } else {
        newFavorites.add(materialId)
        toast.success('收藏成功')
      }
      setFavorites(newFavorites)

      // Reload if viewing favorited only
      if (activeFilter === 'favorited') {
        loadMaterials()
      }
    } catch (error) {
      console.error('Error updating favorite:', error)
      toast.error('操作失败')
    }
  }

  // Handle apply to class
  const handleApplyToClass = async (material: Material, classId: string) => {
    try {
      const response = await fetch('/api/materials/apply-to-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_id: material.id,
          class_id: classId,
          assignment_title: `${material.title} - 作业`
        })
      })

      if (!response.ok) throw new Error('Failed to apply to class')

      const result = await response.json()
      toast.success(`已成功应用到班级，作业ID: ${result.assignment_id}`)
    } catch (error) {
      console.error('Error applying to class:', error)
      toast.error('应用到班级失败')
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和筛选 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">模板中心</h2>
          <p className="text-gray-600">浏览和收藏同校教师分享的优质教学资源</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
          >
            全部模板
          </Button>
          <Button
            variant={activeFilter === 'favorited' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('favorited')}
          >
            <Star className="h-4 w-4 mr-2" />
            我的收藏
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索模板标题、标签或创建者..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 类型筛选 */}
            <div>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="资源类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(materialTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 级别筛选 */}
            <div>
              <Select
                value={filters.cefr_level}
                onValueChange={(value) => setFilters(prev => ({ ...prev, cefr_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="难度级别" />
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
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              找到 {pagination.total} 个模板
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMaterials}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 模板网格 */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">加载中...</p>
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeFilter === 'favorited' ? '暂无收藏的模板' : '暂无可用模板'}
            </h3>
            <p className="text-gray-600">
              {activeFilter === 'favorited'
                ? '您还没有收藏任何模板'
                : '同校教师还没有分享模板'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => {
            const typeConfig = materialTypes[material.type]
            const Icon = typeConfig.icon
            const isFavorited = favorites.has(material.id)

            return (
              <Card key={material.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate">{material.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {material.description || '暂无描述'}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavorite(material.id)}
                      className="flex-shrink-0"
                    >
                      {isFavorited ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 标签和级别 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={typeConfig.color}>
                      {typeConfig.label}
                    </Badge>
                    {material.cefr_level && (
                      <Badge variant="outline">{material.cefr_level}</Badge>
                    )}
                    {material.estimated_duration && (
                      <Badge variant="outline">{material.estimated_duration}分钟</Badge>
                    )}
                  </div>

                  {/* 创建者信息 */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{material.owner_name || '匿名教师'}</span>
                    {material.school_name && (
                      <>
                        <span>•</span>
                        <span>{material.school_name}</span>
                      </>
                    )}
                  </div>

                  {/* 标签 */}
                  {material.tags && material.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {material.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {material.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{material.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* 统计信息 */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(material.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {material.download_count && (
                        <span>{material.download_count} 下载</span>
                      )}
                      {material.favorite_count && (
                        <span>{material.favorite_count} 收藏</span>
                      )}
                      {material.view_count && (
                        <span>{material.view_count} 查看</span>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        预览
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        下载
                      </Button>
                    </div>

                    {/* 应用到班级 */}
                    {selectedClasses.length > 0 && (
                      <div className="relative">
                        <Select onValueChange={(classId) => handleApplyToClass(material, classId)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="应用到班级..." />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedClasses.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="h-3 w-3" />
                                  {cls.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

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