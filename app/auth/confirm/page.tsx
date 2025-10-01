'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // 检查是否有从回调传来的错误
        const errorParam = searchParams.get('error')
        if (errorParam) {
          setError(decodeURIComponent(errorParam))
          setLoading(false)
          return
        }

        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          })

          if (error) {
            setError(error.message)
          } else {
            setConfirmed(true)
            // 延迟跳转到仪表板
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } else {
          // 如果没有必要参数，可能是通过回调路由处理的
          // 检查用户是否已经登录
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            setConfirmed(true)
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          } else {
            setError('缺少必要的确认参数')
          }
        }
      } catch (err) {
        console.error('确认邮箱时出错:', err)
        setError('确认邮箱时发生错误')
      } finally {
        setLoading(false)
      }
    }

    confirmEmail()
  }, [searchParams, supabase.auth, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              确认邮箱中...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-600">
            正在验证您的邮箱，请稍候...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              邮箱确认成功！
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              您的邮箱已成功确认，即将跳转到仪表板...
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              立即前往仪表板
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-600">
            <XCircle className="h-6 w-6" />
            邮箱确认失败
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {error || '邮箱确认过程中发生错误'}
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => router.push('/auth/signup')}
              variant="outline"
              className="w-full"
            >
              重新注册
            </Button>
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              前往登录
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}