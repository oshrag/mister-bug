
import { userService } from "./user.service.js"
import { authService } from "../auth/auth.service.js"
import { loggerService } from "../../services/logger.service.js";
import { bugService } from "../bug/bug.service.js"



export async function getUsers(req, res){
    // const { pageIdx, txt, severity, labels, sortBy, sortDir } = req.query
    // const filterBy = { pageIdx, txt, severity: +severity, labels, sortBy, sortDir  }


    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    //loggerService.info(`get users loggedinUser 11111`, loggedinUser);
	if (!loggedinUser || !loggedinUser.isAdmin) return res.status(401).send('you have no premition to that page')


    
    try {
        const users = await userService.query()
        res.send(users)
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't get users`)
    }
}

export async function getUser(req, res){

    const { userId } = req.params

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // loggerService.info(`get users loggedinUser`, loggedinUser);
	if (!loggedinUser || (!loggedinUser.isAdmin && loggedinUser._id !== userId)) return res.status(401).send('you have no premition to that page')

    
        try {
            const user = await userService.getById(userId)
            res.send(user)
        } catch (err) {
            console.log('err:', err)
            res.status(400).send(`Couldn't get user`)
        }
}


export async function removeUser(req, res) {


    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // loggerService.info(`get users loggedinUser`, loggedinUser);
	if (!loggedinUser || !loggedinUser.isAdmin) return res.status(401).send('you have no premition to that page')


    const { userId } = req.params
    try {
        const bugs = await bugService.query({ owner : userId})
        loggerService.info(`get bugs of user before delete user`, bugs);

        if (bugs.length)  {
            loggerService.info(`Couldn't delete user with bugs`)
            res.status(400).send(`Couldn't delete user with bugs`)
            return
        }
        await userService.remove(userId)
        res.send('User Deleted')
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't get user`)
    }
}


export async function addUser(req, res) {

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // loggerService.info(`get users loggedinUser`, loggedinUser);
	if (!loggedinUser || !loggedinUser.isAdmin) return res.status(401).send('you have no premition to that page')


    const { fullname, username, password, score } = req.body
    const userToSave = { fullname, username, password, score  }
    try {
        const savedUser = await userService.save(userToSave)
        res.send(savedUser)
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't save user`)
    }
}


export async function updateUser(req, res) {

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // loggerService.info(`get users loggedinUser`, loggedinUser);
	if (!loggedinUser || !loggedinUser.isAdmin) return res.status(401).send('you have no premition to that page')


    const { _id, fullname, username, password, score } = req.body
    const userToSave = { _id, fullname, username, password, score }
    try {
        const savedUser = await userService.save(userToSave)
        res.send(savedUser)
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't save user`)
    }
}
