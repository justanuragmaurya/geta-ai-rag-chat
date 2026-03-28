'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function Home() {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  useEffect(() => {
    router.replace(accessToken ? '/chat' : '/login')
  }, [accessToken, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-saffron to-gold
          flex items-center justify-center text-white text-2xl shadow-warm-md animate-pulse">ॐ</div>
        <h1 className="font-yatra text-2xl text-deep-brown">Geta-AI</h1>
      </div>
    </div>
  )
}
