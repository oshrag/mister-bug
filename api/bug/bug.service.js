import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import { loggerService } from "../../services/logger.service.js";




const PAGE_SIZE = 3


export const bugService = {
    query,
    getById,
    remove,
    update,
    add
}

async function query(filterBy = { txt: '' }) {
    try {
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)

		const collection = await dbService.getCollection('bug')
		var bugCursor = await collection.find(criteria, { sort })

		if (filterBy.pageIdx !== undefined) {
			bugCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
		}

		const bugs = bugCursor.toArray()
		return bugs
	} catch (err) {
		loggerService .error('cannot find bugs', err)
		throw err
	}
}

async function getById(bugId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(bugId) }

		const collection = await dbService.getCollection('bug')
		const bug = await collection.findOne(criteria)
        
		bug.createdAt = bug._id.getTimestamp()
		return bug
	} catch (err) {
		loggerService .error(`while finding bug ${bugId}`, err)
		throw err
	}
}

async function remove(bugId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

	try {
        const criteria = { 
            _id: ObjectId.createFromHexString(bugId), 
        }
        if(!isAdmin) criteria['owner._id'] = ownerId
        
		const collection = await dbService.getCollection('bug')
		const res = await collection.deleteOne(criteria)

        if(res.deletedCount === 0) throw('Not your bug')
		return bugId
	} catch (err) {
		loggerService .error(`cannot remove bug ${bugId}`, err)
		throw err
	}
}

async function update(bug) {

    const bugToSave = { title: bug.title, severity: bug.severity }

    try {
        const criteria = { _id: ObjectId.createFromHexString(bug._id) }

		const collection = await dbService.getCollection('bug')
		await collection.updateOne(criteria, { $set: bugToSave })

		return bug
	} catch (err) {
		loggerService .error(`cannot update bug ${bug._id}`, err)
		throw err
	}
    
}

async function add(bug) {
    try {
        const collection = await dbService.getCollection('bug')
        await collection.insertOne(bug)

        return bug
    } catch (err) {
        console.log(`ERROR: cannot insert bug`)
        throw err
    }
}


function _buildCriteria(filterBy) {

    // if (filterBy.severity) {
    //     // bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.severity)
    //      criteria.severity = { '$gte': filterBy.severity }
    //  }
    //  if (filterBy.txt) {
    //      const regExp = new RegExp(filterBy.txt, 'i')
    //      criteria.title = { $regex: regExp }
    //  }


    const criteria = {
        title: { $regex: filterBy.txt, $options: 'i' },
        severity: { $gte: filterBy.severity }
    }

    return criteria
}

function _buildSort(filterBy) {
    if(!filterBy.sortBy) return {}
    return { [filterBy.sortBy]: filterBy.sortDir }
}