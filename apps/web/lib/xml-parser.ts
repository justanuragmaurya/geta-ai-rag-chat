import { ShlokaRef } from '@geta/types'

export interface TeachingBlock {
  ref: string
  chapter: number
  verse: number
  content: string
  shloka?: ShlokaRef
}

export interface ParsedResponse {
  empathy: string
  teachings: TeachingBlock[]
  practical: string
  closing: string
  raw: string
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function extractTeachings(xml: string, shlokaRefs: ShlokaRef[]): TeachingBlock[] {
  const teachings: TeachingBlock[] = []
  const regex = /<teaching\s+ref="(\d+)\.(\d+)"[^>]*>([\s\S]*?)<\/teaching>/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(xml)) !== null) {
    const chapter = parseInt(match[1])
    const verse = parseInt(match[2])
    const content = match[3].trim()
    const shloka = shlokaRefs.find(
      (s) => s.chapter === chapter && s.verse === verse
    )

    teachings.push({ ref: `${chapter}.${verse}`, chapter, verse, content, shloka })
  }

  return teachings
}

export function parseKrishnaResponse(raw: string, shlokaRefs: ShlokaRef[]): ParsedResponse {
  const hasXml = raw.includes('<response>') && raw.includes('</response>')

  if (!hasXml) {
    return {
      empathy: '',
      teachings: [],
      practical: '',
      closing: '',
      raw,
    }
  }

  const responseBlock = raw.match(/<response>([\s\S]*)<\/response>/i)
  const xml = responseBlock ? responseBlock[1] : raw

  return {
    empathy: extractTag(xml, 'empathy'),
    teachings: extractTeachings(xml, shlokaRefs),
    practical: extractTag(xml, 'practical'),
    closing: extractTag(xml, 'closing'),
    raw,
  }
}

export function isCompleteXml(text: string): boolean {
  return text.includes('<response>') && text.includes('</response>')
}
