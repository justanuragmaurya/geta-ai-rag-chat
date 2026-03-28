import { create } from 'zustand'
import { ChatMessage, Conversation, ShlokaRef } from '@geta/types'

interface ChatStore {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
  streamingShlokaRefs: ShlokaRef[]

  setConversations: (convos: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  setMessages: (msgs: ChatMessage[]) => void
  addMessage: (msg: ChatMessage) => void
  setStreaming: (val: boolean) => void
  appendStreamContent: (delta: string) => void
  setStreamingShlokaRefs: (refs: ShlokaRef[]) => void
  resetStream: () => void
  removeConversation: (id: string) => void
}

export const useChatStore = create<ChatStore>()((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  streamingShlokaRefs: [],

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (activeConversationId) => set({ activeConversationId }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  appendStreamContent: (delta) =>
    set((state) => ({ streamingContent: state.streamingContent + delta })),
  setStreamingShlokaRefs: (streamingShlokaRefs) => set({ streamingShlokaRefs }),
  resetStream: () => set({ streamingContent: '', streamingShlokaRefs: [], isStreaming: false }),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
      messages: state.activeConversationId === id ? [] : state.messages,
    })),
}))
