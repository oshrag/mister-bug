import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { bugRoutes } from './api/bug/bug.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'



const app = express() 

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174'
    ],
    credentials: true
}


app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

//* Routes
app.use('/api/bug', bugRoutes)
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)



// app.get('/api/bug', async (req, res) => {
//     // const { txt, minSpeed } = req.query
//     // const filterBy = { txt, minSpeed: +minSpeed }
//     try {
//         const bugs = await bugService.query()
//         res.send(bugs)
//     } catch (err) {
//         console.log('err:', err)
//         res.status(400).send(`Couldn't get bugs`)
//     }
// })





// app.get('/api/bug/:bugId', async (req, res) => {
//     const { bugId } = req.params
//     try {
//         const bug = await bugService.getById(bugId)
//         res.send(bug)
//     } catch (err) {
//         console.log('err:', err)
//         res.status(400).send(`Couldn't get bug`)
//     }
// })

// // http://localhost:3030/api/bug/Q3xoM8

// app.delete('/api/bug/:bugId', async (req, res) => {
//     const { bugId } = req.params
//     try {
//         await bugService.remove(bugId)
//         res.send('Bug Deleted')
//     } catch (err) {
//         console.log('err:', err)
//         res.status(400).send(`Couldn't get bug`)
//     }
// })

// // http://localhost:3030/api/bug/Q3xoM8/remove



// app.post('/api/bug', async (req, res) => {
//     const { title, severity, description } = req.body
//     const bugToSave = { title, severity: +severity, description, createdAt: Date.now() }
//     try {
//         const savedBug = await bugService.save(bugToSave)
//         res.send(savedBug)
//     } catch (err) {
//         console.log('err:', err)
//         res.status(400).send(`Couldn't save bug`)
//     }
// })

// // used before rest api - browser run only get reguest
// //http://localhost:3030/api/bug/save?title=missing%20delimeter&severity=4


// app.put('/api/bug', async (req, res) => {
//     const { _id, title, severity, description } = req.body
//     const bugToSave = { _id, title, severity: +severity, description, createdAt: Date.now() }
//     try {
//         const savedBug = await bugService.save(bugToSave)
//         res.send(savedBug)
//     } catch (err) {
//         console.log('err:', err)
//         res.status(400).send(`Couldn't save bug`)
//     }
// })





// app.get('/', (req, res) => res.send('Hello there')) 
// app.listen(3030, () => console.log('Server ready at port 3030'))


//! --EXAMPLE-- !
app.get('/api/logs', requiredAdmin, (req, res) => {
    const path = process.cwd() + '/logs/backend.log'
    res.sendFile(path)
})

function requiredAdmin(req, res, next) {
    const loggedInUser = { isAdmin: true }
    if (!loggedInUser.isAdmin) {
        loggerService.warn('Unauthenticated user tried to access a restricted path!', req.path)
        return res.status(401).send('Not Authorized')
    }
    next()
}

const port = process.env.PORT || 3030;
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)


