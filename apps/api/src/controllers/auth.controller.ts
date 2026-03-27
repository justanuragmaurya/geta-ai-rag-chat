import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@geta/db'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

function signAccess(userId: string, email: string) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRY || '15m',
  } as jwt.SignOptions)
}

async function createRefreshToken(userId: string) {
  const token = uuidv4()
  const days = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '7')
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } })
  return token
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message })

  const { email, password, name } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ message: 'Email already in use' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({ data: { email, passwordHash, name } })

  const accessToken = signAccess(user.id, user.email)
  const refreshToken = await createRefreshToken(user.id)

  return res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  })
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message })

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

  const accessToken = signAccess(user.id, user.email)
  const refreshToken = await createRefreshToken(user.id)

  return res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  })
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' })

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  })
  if (!stored || stored.expiresAt < new Date()) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } })
  const accessToken = signAccess(stored.user.id, stored.user.email)
  const newRefreshToken = await createRefreshToken(stored.user.id)

  return res.json({ accessToken, refreshToken: newRefreshToken })
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {})
  }
  return res.json({ message: 'Logged out' })
}
