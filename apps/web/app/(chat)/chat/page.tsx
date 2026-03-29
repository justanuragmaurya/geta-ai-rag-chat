'use client'
import { useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChatMessage } from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'
import { StreamingMessage } from '@/components/StreamingMessage'
import { useChatStore } from '@/store/chat.store'
import { streamChat } from '@/lib/stream'
import { ChatMessage as ChatMessageType } from '@geta/types'

export default function NewChatPage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const {
    messages, isStreaming, streamingContent,
    setMessages, addMessage, setStreaming, appendStreamContent,
    setStreamingShlokaRefs, resetStream, setActiveConversation,
    setConversations, conversations, activeConversationId,
  } = useChatStore()

  useEffect(() => {
    setActiveConversation(null)
    setMessages([])
    resetStream()
  }, [setActiveConversation, setMessages, resetStream])

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

    let receivedConvoId: string | null = null

    await streamChat(
      { message, conversationId: activeConversationId || undefined },
      {
        onMeta: (meta) => {
          receivedConvoId = meta.conversationId
          setActiveConversation(meta.conversationId)
          setStreamingShlokaRefs(meta.shlokaRefs)
        },
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
          if (receivedConvoId) {
            const title = message.slice(0, 60) + (message.length > 60 ? '...' : '')
            if (!conversations.find((c) => c.id === receivedConvoId)) {
              setConversations([
                { id: receivedConvoId, title, createdAt: new Date().toISOString() },
                ...conversations,
              ])
            }
            router.replace(`/chat/${receivedConvoId}`)
          }
        },
        onError: (err) => { console.error('Stream error:', err); resetStream() },
      }
    )
  }, [activeConversationId, addMessage, setStreaming, resetStream, appendStreamContent, setActiveConversation, setStreamingShlokaRefs, conversations, setConversations, router])

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center min-h-[65vh] text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-saffron to-gold
                flex items-center justify-center text-white text-3xl shadow-warm-lg">ॐ</div>
              <div>
                <h2 className="font-yatra text-2xl text-deep-brown mb-2">Pranam, Arjun</h2>
                <p className="text-muted text-sm max-w-md leading-relaxed">
                  Main Krishna hoon. Apni zindagi ke sawaal poocho — career, relationships,
                  fear, purpose — aur main tumhe Gita ka gyan doonga.
                </p>
              </div>
              <div className="h-px w-24 border-ornate border-b" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {[
                  'Mujhe apne career mein confusion ho raha hai',
                  'How to deal with anxiety and fear?',
                  'Karm kaise karoon bina result ki chinta ke?',
                  'What is the meaning of dharma in daily life?',
                ].map((q) => (
                  <button key={q} onClick={() => handleSend(q)}
                    className="text-left text-xs px-4 py-3 rounded-xl border border-border
                      bg-white hover:bg-ivory hover:border-saffron/30
                      text-warm-brown hover:text-deep-brown transition-all duration-200 shadow-warm">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <StreamingMessage />
        </div>
      </div>
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </>
  )
}
