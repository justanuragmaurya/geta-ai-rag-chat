import { openai } from '../lib/openrouter'
import { qdrant, COLLECTION } from '../lib/qdrant'
import { ShlokaRef } from '@geta/types'

export async function retrieveShlokas(query: string, topK = 5): Promise<ShlokaRef[]> {
  const embeddingRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const vector = embeddingRes.data[0].embedding

  const results = await qdrant.search(COLLECTION, {
    vector,
    limit: topK,
    with_payload: true,
  })

  return results.map((r) => ({
    chapter: r.payload?.chapter as number,
    verse: r.payload?.verse as number,
    sanskrit: r.payload?.sanskrit as string,
    transliteration: r.payload?.transliteration as string,
    hindi: r.payload?.hindi as string,
    english: r.payload?.english as string,
  }))
}
