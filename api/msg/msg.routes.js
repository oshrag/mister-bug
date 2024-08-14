import express from 'express'
import { addMsg, getMsg, getMsgs, removeMsg, updateMsg } from './msg.controller.js'
import { log } from '../../middlewares/log.middleware.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', log, getMsgs)
router.get('/:msgId', log, getMsg)
router.delete('/:msgId', log, requireAuth, removeMsg)
router.post('/', log, requireAuth, addMsg)
router.put('/', log, requireAuth, updateMsg)

export const msgRoutes = router
