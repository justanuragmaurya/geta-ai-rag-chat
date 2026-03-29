'use client'
import { ShlokaRef } from '@geta/types'

export function ShlokaCard({ shloka }: { shloka: ShlokaRef }) {
  return (
    <div className="bg-ivory border border-border rounded-2xl p-4 space-y-2.5 shadow-warm">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-saffron to-gold rounded-full" />
        <span className="text-xs font-semibold tracking-wide text-saffron uppercase">
          Adhyay {shloka.chapter} · Shlok {shloka.verse}
        </span>
      </div>

      {shloka.sanskrit && (
        <p className="text-deep-brown/70 italic text-sm leading-relaxed pl-3 border-l-2 border-gold/30">
          {shloka.sanskrit}
        </p>
      )}

      {shloka.transliteration && (
        <p className="text-muted text-xs leading-relaxed">{shloka.transliteration}</p>
      )}

      {shloka.hindi && (
        <p className="text-warm-brown text-sm leading-relaxed">{shloka.hindi}</p>
      )}

      {shloka.english && (
        <p className="text-muted text-xs leading-relaxed italic">{shloka.english}</p>
      )}
    </div>
  )
}
