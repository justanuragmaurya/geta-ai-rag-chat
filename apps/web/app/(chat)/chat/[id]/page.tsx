'use client'
import { useRef, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ChatMessage } from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'
import { StreamingMessage } from '@/components/StreamingMessage'
import { useChatStore } from '@/store/chat.store'
import { api } from '@/lib/api'
import { streamChat } from '@/lib/stream'
import { ChatMessage as ChatMessageType, Conversation } from '@geta/types'

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.id as string
  const scrollRef = useRef<HTMLDivElement>(null)
  const {
    messages, isStreaming, streamingContent,
    setMessages, addMessage, setStreaming, appendStreamContent,
    setStreamingShlokaRefs, resetStream, setActiveConversation,
  } = useChatStore()

  useEffect(() => {
    setActiveConversation(conversationId)
    loadHistory()
  }, [conversationId])

  async function loadHistory() {
    try {
      const { data } = await api.get<Conversation & { messages: ChatMessageType[] }>(
        `/api/chat/conversation/${conversationId}`
      )
      setMessages(data.messages.map((m) => ({
        ...m,
        createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date(m.createdAt).toISOString(),
      })))
    } catch { setMessages([]) }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = useCallback(async (message: string) => {
    const userMsg: ChatMessageType = {
      id: `temp-${Date.now()}`, role: 'user', content: message,
      createdAt: new Date().toISOString(),
    }
    addMessage(userMsg)
    resetStream()
    setStreaming(true)

    await streamChat(
      { message, conversationId },
      {
        onMeta: (meta) => setStreamingShlokaRefs(meta.shlokaRefs),
        onChunk: (delta) => appendStreamContent(delta),
        onDone: () => {
          const state = useChatStore.getState()
          const assistantMsg: ChatMessageType = {
            id: `temp-${Date.now()}-assistant`, role: 'assistant',
            content: state.streamingContent, shlokaRefs: state.streamingShlokaRefs,
            createdAt: new Date().toISOString(),
          }
          addMessage(assistantMsg)
          resetStream()
        },
        onError: (err) => { console.error('Stream error:', err); resetStream() },
      }
    )
  }, [conversationId, addMessage, setStreaming, resetStream, appendStreamContent, setStreamingShlokaRefs])

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <StreamingMessage />
        </div>
      </div>
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </>
  )
}
