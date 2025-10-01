import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Basic health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'unknown'
    }

    // Check database connection
    try {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      if (error) {
        throw error
      }

      healthStatus.database = 'connected'
    } catch (dbError) {
      console.error('Database health check failed:', dbError)
      healthStatus.database = 'disconnected'
      healthStatus.status = 'degraded'
    }

    // Check external services (optional)
    const services = {
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
    }

    return NextResponse.json({
      ...healthStatus,
      services
    }, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}