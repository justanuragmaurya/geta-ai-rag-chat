'use client'
import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`
    }
  }

  return (
    <div className="border-t border-border/60 bg-cream/90 backdrop-blur-sm px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask Krishna your question..."
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-white border border-border rounded-xl px-4 py-3
              text-sm text-deep-brown placeholder:text-muted/50
              focus:outline-none focus:border-saffron/40 focus:ring-2 focus:ring-saffron/10
              disabled:opacity-40 transition-all shadow-warm"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-xl
              bg-gradient-to-br from-saffron to-saffron-dark
              hover:from-saffron-dark hover:to-saffron
              disabled:opacity-25 disabled:hover:from-saffron disabled:hover:to-saffron-dark
              flex items-center justify-center transition-all duration-200
              active:scale-95 shadow-warm"
          >
            <Send size={17} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
