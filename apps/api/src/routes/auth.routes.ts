import { Router } from 'express'
import { register, login, refresh, logout } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

export const authRouter: Router = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh', refresh)
authRouter.post('/logout', authMiddleware, logout)
