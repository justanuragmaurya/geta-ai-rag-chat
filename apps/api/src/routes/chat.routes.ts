import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { sendMessage, getHistory, getConversations, deleteConversation } from '../controllers/chat.controller'

export const chatRouter: Router = Router()

chatRouter.use(authMiddleware)
chatRouter.post('/message', sendMessage)
chatRouter.get('/conversations', getConversations)
chatRouter.get('/conversation/:conversationId', getHistory)
chatRouter.delete('/conversation/:id', deleteConversation)
