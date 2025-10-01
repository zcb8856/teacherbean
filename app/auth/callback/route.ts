import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore
    })

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // 成功确认邮箱，跳转到指定页面
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        console.error('邮箱确认错误:', error)
        // 跳转到确认页面显示错误
        return NextResponse.redirect(new URL(`/auth/confirm?error=${encodeURIComponent(error.message)}`, request.url))
      }
    } catch (err) {
      console.error('处理回调时出错:', err)
      return NextResponse.redirect(new URL('/auth/confirm?error=处理确认时发生错误', request.url))
    }
  }

  // 没有代码参数，跳转到登录页
  return NextResponse.redirect(new URL('/auth/login', request.url))
}