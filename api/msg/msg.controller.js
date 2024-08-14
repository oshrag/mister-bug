
import { msgService } from "./msg.service.js"
import { authService } from "../auth/auth.service.js"
import { loggerService } from "../../services/logger.service.js";
import { ObjectId } from 'mongodb'




export async function getMsgs(req, res){

    // const { pageIdx, txt, severity, labels, sortBy, sortDir , owner} = req.query
    // const filterBy = { pageIdx, txt, severity: +severity, labels, sortBy, sortDir , owner }

    // const filterBy = {
    //     txt: req.query.txt || '',
    //     severity: +req.query.severity || 0,
    //     sortField: req.query.sortField || '',
    //     sortDir: req.query.sortDir || 1,
    //     pageIdx: req.query.pageIdx,
    // }

   
    try {
        const msgs = await msgService.query()
        res.send(msgs)
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't get msgs`)
    }
}

export async function getMsg(req, res){
    const { msgId } = req.params
        try {
            const msg = await msgService.getById(msgId)
            res.send(msg)
        } catch (err) {
            console.log('err:', err)
            res.status(400).send(`Couldn't get msg`)
        }
}


export async function removeMsg(req, res) {

    const { msgId } = req.params
    try {
        await msgService.remove(msgId)
        res.send('Msg Deleted')
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't get msg`)
    }
}


export async function addMsg(req, res) {

    
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
	// if (!loggedinUser) return res.status(401).send('Login first')
   

    const { txt, aboutBugId } = req.body
    const msgToSave = { txt, aboutBugId: ObjectId.createFromHexString(aboutBugId), byUserId: ObjectId.createFromHexString(loggedinUser._id)  }
    try {
        const savedMsg = await msgService.add(msgToSave)
        res.send(savedMsg)
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't save msg`)
    }
}


export async function updateMsg(req, res) {

    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
	// if (!loggedinUser) return res.status(401).send('Login first')


    const { loggedinUser, body: msg } = req
    const { _id: userId, isAdmin } = loggedinUser

    // if(!isAdmin && msg.byUserId !== userId) {
    //     res.status(403).send('Not your msg...')
    //     return
    // }

	try {
		const updatedMsg = await msgService.update(msg)
		res.json(updatedMsg)
	} catch (err) {
		loggerService.error('Failed to update msg', err)
		res.status(400).send({ err: 'Failed to update msg' })
	}


}
