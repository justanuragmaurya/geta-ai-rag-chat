import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { prisma, Prisma } from '@geta/db'
import { retrieveShlokas } from '../services/qdrant.service'
import { streamKrishnaResponse } from '../services/llm.service'
import { z } from 'zod'

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
})

export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    const parsed = messageSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message })

    const { message, conversationId } = parsed.data
    const userId = req.user!.userId

    let convo = conversationId
      ? await prisma.conversation.findFirst({ where: { id: conversationId, userId } })
      : null

    if (!convo) {
      convo = await prisma.conversation.create({
        data: {
          userId,
          title: message.slice(0, 60) + (message.length > 60 ? '...' : ''),
        },
      })
    }

    const history = await prisma.message.findMany({
      where: { conversationId: convo.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    })

    const shlokas = await retrieveShlokas(message)

    await prisma.message.create({
      data: { conversationId: convo.id, role: 'user', content: message },
    })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.write(`data: ${JSON.stringify({ conversationId: convo.id, shlokaRefs: shlokas })}\n\n`)

    const fullResponse = await streamKrishnaResponse(
      message,
      shlokas,
      history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      res
    )

    await prisma.message.create({
      data: {
        conversationId: convo.id,
        role: 'assistant',
        content: fullResponse,
        shlokaRefs: JSON.parse(JSON.stringify(shlokas)) as Prisma.InputJsonValue,
      },
    })

    res.end()
  } catch (err) {
    console.error('Chat error:', err)
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Failed to process message' })
    }
    res.end()
  }
}

export async function getHistory(req: AuthRequest, res: Response) {
  const { conversationId } = req.params
  const userId = req.user!.userId

  const convo = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  if (!convo) return res.status(404).json({ message: 'Conversation not found' })
  return res.json(convo)
}

export async function getConversations(req: AuthRequest, res: Response) {
  const userId = req.user!.userId
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  })
  return res.json(conversations)
}

export async function deleteConversation(req: AuthRequest, res: Response) {
  const { id } = req.params
  const userId = req.user!.userId
  await prisma.conversation.deleteMany({ where: { id, userId } })
  return res.json({ message: 'Deleted' })
}
