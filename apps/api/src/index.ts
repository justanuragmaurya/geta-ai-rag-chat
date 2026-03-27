import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { authRouter } from './routes/auth.routes'
import { chatRouter } from './routes/chat.routes'
import { errorMiddleware } from './middleware/error.middleware'

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10kb' }))

const authLimiter = rateLimit({ windowMs: 60_000, max: 20, message: 'Too many requests' })
const chatLimiter = rateLimit({ windowMs: 60_000, max: 30, message: 'Too many requests' })

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/chat', chatLimiter, chatRouter)
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

app.use(errorMiddleware)

app.listen(PORT, () => console.log(`🪷 Geta-AI API running on port ${PORT}`))
