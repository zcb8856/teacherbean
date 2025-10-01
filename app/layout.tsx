import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ChatAssistant } from '@/components/chat/ChatAssistant'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TeacherBean - 智能英语教学平台',
  description: 'AI-powered English teaching platform for lesson planning, assessment, and interactive learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
          <ChatAssistant />
          <Toaster position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  )
}