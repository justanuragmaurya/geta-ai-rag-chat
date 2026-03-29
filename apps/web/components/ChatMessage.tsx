'use client'
import { ChatMessage as ChatMessageType } from '@geta/types'
import { KrishnaResponse } from './KrishnaResponse'

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isKrishna = message.role === 'assistant'

  return (
    <div className={`flex gap-3 mb-6 ${isKrishna ? 'flex-row' : 'flex-row-reverse'}`}>
      {isKrishna && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-saffron to-gold
          flex items-center justify-center flex-shrink-0 text-white text-sm shadow-warm">
          ॐ
        </div>
      )}

      <div className={`max-w-[80%] ${isKrishna ? '' : 'flex flex-col items-end'}`}>
        {isKrishna && (
          <p className="text-[10px] text-muted mb-1.5 ml-1 font-semibold tracking-wider uppercase">Krishna</p>
        )}
        <div
          className={`rounded-2xl px-5 py-4 shadow-warm ${
            isKrishna
              ? 'bg-white border border-border/60 rounded-tl-md'
              : 'bg-saffron/10 border border-saffron/20 rounded-tr-md'
          }`}
        >
          {isKrishna ? (
            <KrishnaResponse
              content={message.content}
              shlokaRefs={message.shlokaRefs || []}
            />
          ) : (
            <p className="text-sm leading-relaxed text-deep-brown">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  )
}
