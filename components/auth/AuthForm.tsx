'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase'
import { validateEmail, validatePassword } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const router = useRouter()
  const supabase = createClient()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!email) {
      newErrors.email = t('Email is required')
    } else if (!validateEmail(email)) {
      newErrors.email = t('Please enter a valid email address')
    }

    if (!password) {
      newErrors.password = t('Password is required')
    } else if (mode === 'signup') {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]
      }
    }

    if (mode === 'signup') {
      if (!fullName) {
        newErrors.fullName = t('Full name is required')
      }
      if (!schoolName) {
        newErrors.schoolName = t('School name is required')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDemoLogin = () => {
    setLoading(true)
    // 直接跳转到开发者面板
    router.push('/dev')
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // 检查是否是演示模式
      if (process.env.NODE_ENV === 'development') {
        // 演示模式：模拟成功登录
        setTimeout(() => {
          toast.success(mode === 'login' ? t('Demo login successful!') : t('Demo account created!'))
          router.push(mode === 'login' ? '/dashboard' : '/auth/login')
          setLoading(false)
        }, 1000)
        return
      }

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          toast.error(error.message)
        } else {
          toast.success(t('Logged in successfully!'))
          // 确保会话已建立，然后跳转
          if (data.session) {
            // 等待会话设置到 cookie 中
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 1500)  // 增加到1.5秒确保会话同步
          } else {
            // 如果没有会话，可能需要邮箱确认
            toast.success(t('Please check your email to confirm your account'))
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              school_name: schoolName,
            },
          },
        })

        if (error) {
          toast.error(error.message)
        } else {
          toast.success(t('Account created! Please check your email to verify your account.'))
          router.push('/auth/login')
        }
      }
    } catch (error) {
      toast.error(t('An unexpected error occurred'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-orange-50 to-warm-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-soft-cyan-200 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-text-primary font-bold">
            {mode === 'login' ? t('Sign in to TeacherBean') : t('Create your account')}
          </CardTitle>
          <CardDescription className="text-center text-text-primary-light">
            {mode === 'login'
              ? t('Enter your email and password to access your account')
              : t('Enter your information to get started')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <Input
                    type="text"
                    placeholder={t('Full Name')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder={t('School Name')}
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className={errors.schoolName ? 'border-red-500' : ''}
                  />
                  {errors.schoolName && (
                    <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <Input
                type="email"
                placeholder={t('Email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder={t('Password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? t('Loading...') : mode === 'login' ? t('Sign In') : t('Create Account')}
            </Button>
          </form>

          {mode === 'login' && (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full border-warm-orange-300 text-warm-orange-700 hover:bg-warm-orange-50"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                🚀 {t('Demo Login (Developer Access)')}
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-text-primary-light">
              {mode === 'login' ? (
                <>
                  {t('Don\'t have an account?')}{' '}
                  <Link href="/auth/signup" className="text-soft-cyan-600 hover:text-soft-cyan-700 font-semibold">
                    {t('Sign up')}
                  </Link>
                </>
              ) : (
                <>
                  {t('Already have an account?')}{' '}
                  <Link href="/auth/login" className="text-soft-cyan-600 hover:text-soft-cyan-700 font-semibold">
                    {t('Sign in')}
                  </Link>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}