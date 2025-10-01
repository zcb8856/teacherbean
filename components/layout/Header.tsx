'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/hooks/useTranslation'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types'

export function Header() {
  const [user, setUser] = useState<Profile | null>(null)
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        setUser(profile)
      }
    }
    getUser()
  }, [supabase])

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-soft-cyan-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-primary-muted" />
            <Input
              placeholder="Search materials, students, assignments..."
              className="pl-10 w-96 border-soft-cyan-200 focus:border-soft-cyan-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />

          <Button variant="ghost" size="icon" className="hover:bg-soft-cyan-50">
            <Bell className="h-5 w-5 text-soft-cyan-600" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-soft-cyan-600 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-text-primary">
                {user?.full_name || 'Teacher'}
              </p>
              <p className="text-text-primary-light">{user?.school_name}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}