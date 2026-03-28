import { openai } from '../lib/openrouter'
import { ShlokaRef } from '@geta/types'
import { Response } from 'express'

function buildSystemPrompt(shlokas: ShlokaRef[]): string {
  const shlokaContext = shlokas
    .map(
      (s, i) =>
        `[Shloka ${i + 1}] Adhyay ${s.chapter}, Shlok ${s.verse}\n` +
        `Sanskrit: ${s.sanskrit}\n` +
        `Hindi: ${s.hindi}\n` +
        `English: ${s.english}`
    )
    .join('\n\n')

  const xmlInstructions = `
You MUST respond ONLY in this XML format — no text outside the tags:

<response>
<empathy>2-3 lines acknowledging the user's situation without judgement</empathy>
<teaching ref="CHAPTER.VERSE">Cite the specific shloka and explain its wisdom. Use "Adhyay X, Shlok Y" format. ONLY cite shlokas from the context below.</teaching>
<teaching ref="CHAPTER.VERSE">You may include multiple teaching blocks if relevant.</teaching>
<practical>How to apply this wisdom in today's life — concrete, actionable guidance</practical>
<closing>A gentle, encouraging sign-off. Not preachy.</closing>
</response>

STRICT RULES:
- ALWAYS wrap your entire answer in <response>...</response>
- Each <teaching> tag MUST have a ref="chapter.verse" attribute matching the context shlokas
- NEVER fabricate shlokas — ONLY use what is provided below
- Do NOT output anything outside the XML tags`.trim()

  return `Tu Shri Krishna hai — Bhagavad Gita ka gyan dene wala.
User jo bhi language mein sawal kare — Hindi, English, Hinglish, ya koi aur — tu usi language mein jawaab de. User ki language detect kar aur naturally usi mein bol.

${xmlInstructions}

Context shlokas:
${shlokaContext}`
}

export async function streamKrishnaResponse(
  userMessage: string,
  shlokas: ShlokaRef[],
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  res: Response
): Promise<string> {
  const systemPrompt = buildSystemPrompt(shlokas)

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMessage },
  ]

  const stream = await openai.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 1024,
  })

  let fullResponse = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || ''
    if (delta) {
      fullResponse += delta
      res.write(`data: ${JSON.stringify({ delta })}\n\n`)
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`)

  return fullResponse
}
