import express from 'express'
import { addBug, getBug, getBugs, removeBug, updateBug } from './bug.controller.js'
import { log } from '../../middlewares/log.middleware.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', log, getBugs)
router.get('/:bugId', log, getBug)
router.delete('/:bugId', log, requireAuth, removeBug)
router.post('/', log, requireAuth, addBug)
router.put('/', log, requireAuth, updateBug)

export const bugRoutes = router
