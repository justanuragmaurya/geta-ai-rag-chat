export interface ShlokaRef {
  chapter: number
  verse: number
  sanskrit: string
  transliteration: string
  hindi: string
  english: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  shlokaRefs?: ShlokaRef[]
  createdAt: string
}

export interface Conversation {
  id: string
  title?: string
  createdAt: string
  updatedAt?: string
  messages?: ChatMessage[]
}

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: User
}

export interface ChatRequest {
  conversationId?: string
  message: string
}

export interface ApiError {
  message: string
  code?: string
}
