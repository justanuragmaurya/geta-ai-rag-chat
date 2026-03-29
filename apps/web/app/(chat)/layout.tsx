'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { ConversationList } from '@/components/ConversationList'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (!accessToken) router.replace('/login')
  }, [accessToken, router])

  if (!accessToken) return null

  return (
    <div className="h-screen flex">
      <ConversationList />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-cream">
        {children}
      </main>
    </div>
  )
}
