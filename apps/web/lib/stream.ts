import { useAuthStore } from '@/store/auth.store'
import { ShlokaRef } from '@geta/types'

export interface StreamCallbacks {
  onMeta: (data: { conversationId: string; shlokaRefs: ShlokaRef[] }) => void
  onChunk: (delta: string) => void
  onDone: () => void
  onError: (err: Error) => void
}

export async function streamChat(
  payload: { message: string; conversationId?: string },
  callbacks: StreamCallbacks
) {
  const token = useAuthStore.getState().accessToken
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const res = await fetch(`${baseURL}/api/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    callbacks.onError(new Error(`Stream request failed: ${res.status}`))
    return
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const json = JSON.parse(line.slice(6))
        if (json.conversationId) {
          callbacks.onMeta({ conversationId: json.conversationId, shlokaRefs: json.shlokaRefs || [] })
        } else if (json.done) {
          callbacks.onDone()
          return
        } else if (json.delta) {
          callbacks.onChunk(json.delta)
        }
      } catch { /* skip malformed */ }
    }
  }

  callbacks.onDone()
}
