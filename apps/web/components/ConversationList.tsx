'use client'
import { useEffect } from 'react'
import { MessageSquare, Plus, Trash2, LogOut } from 'lucide-react'
import { api } from '@/lib/api'
import { useChatStore } from '@/store/chat.store'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
import { Conversation } from '@geta/types'

export function ConversationList() {
  const router = useRouter()
  const { conversations, setConversations, activeConversationId, setActiveConversation, setMessages, removeConversation } = useChatStore()
  const { user, logout: authLogout } = useAuthStore()

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    try {
      const { data } = await api.get<Conversation[]>('/api/chat/conversations')
      setConversations(data)
    } catch {
      // might not be logged in
    }
  }

  function handleNewChat() {
    setActiveConversation(null)
    setMessages([])
    router.push('/chat')
  }

  function handleSelect(id: string) {
    setActiveConversation(id)
    router.push(`/chat/${id}`)
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    try {
      await api.delete(`/api/chat/conversation/${id}`)
      removeConversation(id)
    } catch { /* silent */ }
  }

  function handleLogout() {
    const { refreshToken } = useAuthStore.getState()
    api.post('/api/auth/logout', { refreshToken }).catch(() => {})
    authLogout()
    router.push('/login')
  }

  return (
    <div className="w-72 h-full bg-white border-r border-border/60 flex flex-col shadow-warm">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-gold
            flex items-center justify-center text-white text-xs shadow-warm">ॐ</div>
          <div>
            <h1 className="font-yatra text-xl text-deep-brown leading-none">Geta-AI</h1>
            <p className="text-[9px] text-muted tracking-[0.2em] uppercase mt-0.5">Ask Krishna</p>
          </div>
        </div>
      </div>

      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
            border border-saffron/30 text-saffron text-sm font-medium
            hover:bg-saffron/5 hover:border-saffron/50
            active:scale-[0.98] transition-all duration-150"
        >
          <Plus size={16} />
          New Conversation
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {conversations.map((convo) => (
          <button
            key={convo.id}
            onClick={() => handleSelect(convo.id)}
            className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
              text-left text-sm transition-all duration-150 ${
              activeConversationId === convo.id
                ? 'bg-ivory text-deep-brown border border-border/50'
                : 'text-warm-brown hover:bg-ivory/60'
            }`}
          >
            <MessageSquare size={14} className="flex-shrink-0 opacity-40" />
            <span className="flex-1 truncate text-xs">{convo.title || 'New conversation'}</span>
            <Trash2
              size={12}
              onClick={(e) => handleDelete(e, convo.id)}
              className="opacity-0 group-hover:opacity-40 hover:!opacity-100
                hover:text-red-500 flex-shrink-0 transition-opacity"
            />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/40">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted truncate flex-1">
            {user?.name || user?.email || 'User'}
          </span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-ivory text-muted hover:text-saffron transition-colors"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
