import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
// import { MongoClient } from 'mongodb'
import { bugService } from './api/bug/bug.service.js'


import { loggerService } from './services/logger.service.js'
import { bugRoutes } from './api/bug/bug.routes.js'
import { msgRoutes } from './api/msg/msg.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'



// Connection URL
const url = 'mongodb://localhost:27017'

// Database Name
const dbName = 'bugs'

//tryMongo()
//helloMongo()

// async function tryMongo() {

//     console.log('Connecting')
//     const connection = await MongoClient.connect(url)
    
//     console.log('Connected. Getting DB')
//     const db = connection.db(dbName)

//     console.log('Getting Collection')
//     const collection = db.collection('bug')

//     console.log('Fetching Docs.')
//     const docs = await collection.find({ severity : 3 }).toArray()    

//     console.log(`Docs:\n`, docs)
//     connection.close()
// }

// async function helloMongo() {


//     //const filterBy = { severity : 100}
//     //const filterBy = { txt : 'problem'}
    

//     // var bugs = await bugService.query(filterBy)
//     // console.log('Got Bugs: ', bugs)

//     // var bug = await bugService.getById('66bba951d74a4a68c5f32f03')
//     // console.log('Got Bug: ', bug)

//     // bug.severity += 100 // { severity: 103 }
//     // var updatedBug = await bugService.update(bug)
//     // console.log('Updated Bug: ', updatedBug)

//     // const newBug = { title: 'trible bug', severity: 220 }

//     // var addedBug = await bugService.add(newBug)
//     // console.log('Added Bug: ', addedBug)

//     // const { deletedCount } = await bugService.remove('66bbc0be947dd17c6f83503b')
//     // console.log('Bug Removed?', deletedCount)
// }


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

app.all('*', setupAsyncLocalStorage)

//* Routes
app.use('/api/bug', bugRoutes)
app.use('/api/user', userRoutes)
app.use('/api/msg', msgRoutes)
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


