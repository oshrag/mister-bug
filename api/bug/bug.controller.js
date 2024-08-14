
import { bugService } from "./bug.service.js"
import { authService } from "../auth/auth.service.js"
import { loggerService } from "../../services/logger.service.js";



export async function getBugs(req, res){

    // const { pageIdx, txt, severity, labels, sortBy, sortDir , owner} = req.query
    // const filterBy = { pageIdx, txt, severity: +severity, labels, sortBy, sortDir , owner }

    const filterBy = {
        txt: req.query.txt || '',
        severity: +req.query.severity || 0,
        sortField: req.query.sortField || '',
        sortDir: req.query.sortDir || 1,
        pageIdx: req.query.pageIdx,
    }

   
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
        await bugService.remove(bugId)
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
    const bugToSave = { title, severity: +severity, description, owner: loggedinUser  }
    try {
        const savedBug = await bugService.add(bugToSave)
        res.send(savedBug)
    } catch (err) {
        console.log('err:', err)
        res.status(400).send(`Couldn't save bug`)
    }
}


export async function updateBug(req, res) {

    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
	// if (!loggedinUser) return res.status(401).send('Login first')






    // const { _id, title, severity, description } = req.body
    // const bug = await bugService.getById(_id) //for a case client didnt send all fields
    // const bugToSave = { _id, title, severity: +severity, description, createdAt: bug.createdAt, owner: bug.owner }

    // try {
    //     const savedBug = await bugService.save(bugToSave, loggedinUser)
    //     res.send(savedBug)
    // } catch (err) {
    //     console.log('err:', err)
    //     res.status(400).send(`Couldn't save bug`)
    // }



    const { loggedinUser, body: bug } = req
    const { _id: userId, isAdmin } = loggedinUser

    if(!isAdmin && bug.owner._id !== userId) {
        res.status(403).send('Not your bug...')
        return
    }

	try {
		const updatedBug = await bugService.update(bug)
		res.json(updatedBug)
	} catch (err) {
		logger.error('Failed to update bug', err)
		res.status(400).send({ err: 'Failed to update bug' })
	}


}
