import express from 'express'
import { signup, login, logout } from './auth.controller.js'
import { log } from '../../middlewares/log.middleware.js'

const router = express.Router()

router.post('/signup', log, signup)
router.post('/login', log, login)
router.post('/logout', log, logout)



export const authRoutes = router
