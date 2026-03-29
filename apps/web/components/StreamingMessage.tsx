'use client'
import { useChatStore } from '@/store/chat.store'
import { KrishnaResponse } from './KrishnaResponse'
import { isCompleteXml } from '@/lib/xml-parser'

export function StreamingMessage() {
  const { isStreaming, streamingContent, streamingShlokaRefs } = useChatStore()

  if (!isStreaming && !streamingContent) return null

  const complete = isCompleteXml(streamingContent)

  return (
    <div className="flex gap-3 mb-6 flex-row">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-saffron to-gold
        flex items-center justify-center flex-shrink-0 text-white text-sm shadow-warm">
        ॐ
      </div>
      <div className="max-w-[80%]">
        <p className="text-[10px] text-muted mb-1.5 ml-1 font-semibold tracking-wider uppercase">Krishna</p>
        <div className="rounded-2xl rounded-tl-md px-5 py-4 bg-white border border-border/60 shadow-warm">
          {!streamingContent ? (
            <div className="flex items-center gap-2 py-1">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-saffron/50 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-saffron/50 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-saffron/50 animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-muted italic">Krishna is contemplating...</span>
            </div>
          ) : complete ? (
            <KrishnaResponse content={streamingContent} shlokaRefs={streamingShlokaRefs} />
          ) : (
            <div className="text-sm leading-relaxed text-deep-brown/70 whitespace-pre-wrap">
              {streamingContent
                .replace(/<\/?response>/gi, '')
                .replace(/<\/?empathy>/gi, '')
                .replace(/<teaching[^>]*>/gi, '')
                .replace(/<\/teaching>/gi, '')
                .replace(/<\/?practical>/gi, '')
                .replace(/<\/?closing>/gi, '')
                .trim()}
              {isStreaming && <span className="inline-block w-1.5 h-4 bg-saffron/60 animate-pulse ml-0.5 -mb-0.5" />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
