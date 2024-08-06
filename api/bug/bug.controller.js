
import { bugService } from "./bug.service.js"
import { authService } from "../auth/auth.service.js"
import { loggerService } from "../../services/logger.service.js";



export async function getBugs(req, res){
    const { pageIdx, txt, severity, labels, sortBy, sortDir , owner} = req.query
    const filterBy = { pageIdx, txt, severity: +severity, labels, sortBy, sortDir , owner }
    try {
        const bugs = await bugService.query(filterBy)
        res.send(bugs)
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't get bugs`)
    }
}

export async function getBug(req, res){
    const { bugId } = req.params
        try {

            let visitBugsObj = {}
            let visitBugs = req.cookies.visitBugs || ''
            


            if (visitBugs === '') {
                // console.log('visitBugs is  empty' )
                visitBugsObj[bugId] = true
                // console.log('visitBugsObj:', visitBugsObj)
            } else {
                // console.log('visitBugs is not empty', visitBugs)
                visitBugsObj = JSON.parse(visitBugs);

                if (( Object.keys(visitBugsObj).length === 3) && !( bugId in visitBugsObj)){
                   // throw('you cant watch')
                   return res.status(401).send('Wait for a bit')
                }


                visitBugsObj[bugId] = true
                // console.log('visitBugsObj:', visitBugsObj)
            }
          
             visitBugs = JSON.stringify(visitBugsObj);
             console.log('visitBugs to set', visitBugs)


            
            res.cookie('visitBugs', visitBugs, { maxAge: 1000 * 15 })
           
            const bug = await bugService.getById(bugId)
            res.send(bug)
        } catch (err) {
            console.log('err:', err)
            res.status(400).send(`Couldn't get bug`)
        }
}


export async function removeBug(req, res) {

    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
	// if (!loggedinUser) return res.status(401).send('Login first')


    const { bugId } = req.params
    try {
        await bugService.remove(bugId, loggedinUser)
        res.send('Bug Deleted')
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't get bug`)
    }
}


export async function addBug(req, res) {

    
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
	// if (!loggedinUser) return res.status(401).send('Login first')
   

    const { title, severity, description } = req.body
    const bugToSave = { title, severity: +severity, description, createdAt: Date.now() }
    try {
        const savedBug = await bugService.save(bugToSave, loggedinUser)
        res.send(savedBug)
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't save bug`)
    }
}


export async function updateBug(req, res) {

    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
	// if (!loggedinUser) return res.status(401).send('Login first')


    const { _id, title, severity, description } = req.body
    const bug = await bugService.getById(_id) //for a case client didnt send all fields
    const bugToSave = { _id, title, severity: +severity, description, createdAt: bug.createdAt, owner: bug.owner }

    
    
    try {
        const savedBug = await bugService.save(bugToSave, loggedinUser)
        res.send(savedBug)
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't save bug`)
    }
}
