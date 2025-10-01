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
  Plus,
  MoreVertical,
  FileText,
  Presentation,
  BookOpen,
  MessageSquare,
  Gamepad2,
  Layout,
  Edit2,
  Share2,
  Download,
  Trash2,
  Copy,
  Eye,
  CheckSquare,
  RefreshCw
} from 'lucide-react'
import type { Material, MaterialSearchFilters } from '@/types/library'
import toast from 'react-hot-toast'

interface MyResourcesProps {}

export function MyResources({}: MyResourcesProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<MaterialSearchFilters>({
    search: '',
    type: 'all',
    shared: 'all',
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
  const [groupBy, setGroupBy] = useState<'type' | 'date' | 'level'>('type')

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
        my_resources: 'true',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== 'all' && value !== '')
        )
      })

      const response = await fetch(`/api/materials?${params}`)
      if (!response.ok) throw new Error('Failed to load materials')

      const data = await response.json()
      setMaterials(data.data)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }))
    } catch (error) {
      console.error('Error loading materials:', error)
      toast.error('加载资源失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMaterials()
  }, [pagination.page, filters])

  // Group materials
  const groupedMaterials = () => {
    const groups: Record<string, Material[]> = {}

    materials.forEach(material => {
      let groupKey = ''

      switch (groupBy) {
        case 'type':
          groupKey = materialTypes[material.type].label
          break
        case 'date':
          const date = new Date(material.created_at)
          groupKey = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
          break
        case 'level':
          groupKey = material.cefr_level || '未分级'
          break
      }

      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(material)
    })

    return groups
  }

  // Handle selection
  const handleSelect = (materialId: string) => {
    const newSelected = new Set(selectedMaterials)
    if (newSelected.has(materialId)) {
      newSelected.delete(materialId)
    } else {
      newSelected.add(materialId)
    }
    setSelectedMaterials(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedMaterials.size === materials.length) {
      setSelectedMaterials(new Set())
    } else {
      setSelectedMaterials(new Set(materials.map(m => m.id)))
    }
  }

  // Handle actions
  const handleShare = async (material: Material) => {
    try {
      const newShared = material.shared === 'private' ? 'school' : 'private'
      const response = await fetch(`/api/materials/${material.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shared: newShared })
      })

      if (!response.ok) throw new Error('Failed to update sharing')

      toast.success(newShared === 'school' ? '已设为校内共享' : '已设为私有')
      loadMaterials()
    } catch (error) {
      console.error('Error updating sharing:', error)
      toast.error('更新分享状态失败')
    }
  }

  const handleDelete = async (materialId: string) => {
    if (!confirm('确定要删除这个资源吗？此操作不可撤销。')) return

    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete material')

      toast.success('资源删除成功')
      loadMaterials()
    } catch (error) {
      console.error('Error deleting material:', error)
      toast.error('删除失败')
    }
  }

  const handleBatchExport = async () => {
    if (selectedMaterials.size === 0) {
      toast.error('请选择要导出的资源')
      return
    }

    try {
      const response = await fetch('/api/materials/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_ids: Array.from(selectedMaterials),
          format: 'zip',
          include_metadata: true
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `教学资源_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('导出成功！')
    } catch (error) {
      console.error('Error exporting materials:', error)
      toast.error('导出失败')
    }
  }

  const groups = groupedMaterials()

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">我的资源</h2>
          <p className="text-gray-600">管理您创建的教学资源</p>
        </div>
        <div className="flex gap-2">
          {selectedMaterials.size > 0 && (
            <Button variant="outline" onClick={handleBatchExport}>
              <Download className="h-4 w-4 mr-2" />
              批量导出 ({selectedMaterials.size})
            </Button>
          )}
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建资源
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
                  placeholder="搜索标题、标签或内容..."
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
            {/* 分组方式 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">分组方式：</span>
              <Select value={groupBy} onValueChange={(value) => setGroupBy(value as 'type' | 'date' | 'level')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type">按类型</SelectItem>
                  <SelectItem value="date">按日期</SelectItem>
                  <SelectItem value="level">按级别</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 批量选择 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {selectedMaterials.size === materials.length ? '取消全选' : '全选'}
              </Button>
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
          </div>
        </CardContent>
      </Card>

      {/* 资源列表（按组显示） */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">加载中...</p>
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Layout className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无资源</h3>
            <p className="text-gray-600">开始创建您的第一个教学资源吧</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([groupName, groupMaterials]) => (
            <div key={groupName}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {groupName}
                <Badge variant="secondary">{groupMaterials.length}</Badge>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupMaterials.map((material) => {
                  const typeConfig = materialTypes[material.type]
                  const Icon = typeConfig.icon
                  const isSelected = selectedMaterials.has(material.id)

                  return (
                    <Card
                      key={material.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelect(material.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base truncate">{material.title}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {material.description || '暂无描述'}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelect(material.id)}
                              className="rounded border-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
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
                            <Badge
                              variant={material.shared === 'school' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {material.shared === 'school' ? '校内共享' : '私有'}
                            </Badge>
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

                          {/* 时间和统计 */}
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>
                              {new Date(material.created_at).toLocaleDateString('zh-CN')}
                            </span>
                            <div className="flex items-center gap-2">
                              {material.download_count && (
                                <span>{material.download_count} 下载</span>
                              )}
                              {material.view_count && (
                                <span>{material.view_count} 查看</span>
                              )}
                            </div>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              查看
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit2 className="h-3 w-3 mr-1" />
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(material)}
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(material.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
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