'use client'
import { useMemo } from 'react'
import { ShlokaRef } from '@geta/types'
import { parseKrishnaResponse, type ParsedResponse } from '@/lib/xml-parser'
import { ShlokaCard } from './ShlokaCard'

interface KrishnaResponseProps {
  content: string
  shlokaRefs: ShlokaRef[]
}

function Section({ icon, label, children, accent }: {
  icon: string
  label: string
  children: React.ReactNode
  accent?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{icon}</span>
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${accent || 'text-muted'}`}>
          {label}
        </span>
      </div>
      <div className="text-sm leading-relaxed text-deep-brown/85">
        {children}
      </div>
    </div>
  )
}

function FallbackRender({ content }: { content: string }) {
  const cleaned = content
    .replace(/<\/?response>/gi, '')
    .replace(/<\/?empathy>/gi, '')
    .replace(/<teaching[^>]*>/gi, '')
    .replace(/<\/teaching>/gi, '')
    .replace(/<\/?practical>/gi, '')
    .replace(/<\/?closing>/gi, '')
    .trim()

  return (
    <p className="text-sm leading-relaxed text-deep-brown/85 whitespace-pre-wrap">{cleaned}</p>
  )
}

export function KrishnaResponse({ content, shlokaRefs }: KrishnaResponseProps) {
  const parsed: ParsedResponse = useMemo(
    () => parseKrishnaResponse(content, shlokaRefs),
    [content, shlokaRefs]
  )

  const hasStructure = parsed.empathy || parsed.teachings.length > 0 || parsed.practical

  if (!hasStructure) {
    return <FallbackRender content={content} />
  }

  return (
    <div className="space-y-4">
      {parsed.empathy && (
        <Section icon="🙏" label="Understanding" accent="text-krishna-blue">
          <p className="whitespace-pre-wrap">{parsed.empathy}</p>
        </Section>
      )}

      {parsed.teachings.map((t, i) => (
        <div key={i} className="space-y-2">
          <Section icon="📖" label={`Gita ${t.ref}`} accent="text-saffron">
            <p className="whitespace-pre-wrap">{t.content}</p>
          </Section>
          {t.shloka && <ShlokaCard shloka={t.shloka} />}
        </div>
      ))}

      {parsed.practical && (
        <Section icon="✦" label="Apply Today" accent="text-gold-dark">
          <p className="whitespace-pre-wrap">{parsed.practical}</p>
        </Section>
      )}

      {parsed.closing && (
        <div className="pt-2 border-t border-border/60">
          <p className="text-sm italic text-warm-brown/80 whitespace-pre-wrap">
            {parsed.closing}
          </p>
        </div>
      )}

      {/* Show remaining unreferenced shlokas */}
      {shlokaRefs.filter(
        (s) => !parsed.teachings.some((t) => t.chapter === s.chapter && t.verse === s.verse)
      ).length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            Related Shlokas
          </p>
          {shlokaRefs
            .filter((s) => !parsed.teachings.some((t) => t.chapter === s.chapter && t.verse === s.verse))
            .map((s, i) => (
              <ShlokaCard key={i} shloka={s} />
            ))}
        </div>
      )}
    </div>
  )
}
