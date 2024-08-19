import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import { loggerService } from "../../services/logger.service.js";


export const msgService = {
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

		const collection = await dbService.getCollection('msg')
		//var msgCursor = await collection.find(criteria, { sort })

		// if (filterBy.pageIdx !== undefined) {
		// 	bugCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
		// }
        const pipeline = await buildAggregate(criteria);
        var msgs = await collection.aggregate(pipeline).toArray();

        // var msgs = await collection.aggregate([
        //     {
        //         $match: criteria,
        //     },
        //     {
        //         $lookup: {
        //             localField: 'aboutBugId',
        //             from: 'bug',
        //             foreignField: '_id',
        //             as: 'aboutBug',
        //         },
        //     },
        //     {
        //         $unwind: '$aboutBug',
        //     },
        //     {
        //         $lookup: {
        //             localField: 'byUserId',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'byUser',
        //         },
        //     },
        //     {
        //         $unwind: '$byUser',
        //     },
        // ]).toArray()



		msgs = msgs.map(msg => {
			msg.aboutBug = { 
                _id: msg.aboutBug._id, 
                title: msg.aboutBug.title
            }
			msg.byUser = { 
                _id: msg.byUser._id, 
                fullname: msg.byUser.fullname 
            }
			delete msg.aboutBugId
			delete msg.byUserId
			return msg
		})




		
		return msgs
	} catch (err) {
		loggerService.error('cannot find msgs', err)
		throw err
	}
}

async function getById(msgId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(msgId) }

		const collection = await dbService.getCollection('msg')
		//const msg = await collection.findOne(criteria)
        const pipeline = await buildAggregate(criteria);
        const msgs = await collection.aggregate(pipeline).toArray();

        var msg = msgs.shift() // מחזיר את המסמך היחיד ומסיר אותו מהמערך
        msg.aboutBug = {
            _id: msg.aboutBug._id,
            title: msg.aboutBug.title
        }
        msg.byUser = {
            _id: msg.byUser._id,
            fullname: msg.byUser.fullname
        }
        delete msg.aboutBugId
        delete msg.byUserId

       

		// bug.createdAt = bug._id.getTimestamp()
		return msg
	} catch (err) {
		loggerService.error(`while finding msg ${msgId}`, err)
		throw err
	}
}

async function remove(msgId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

	try {
        const criteria = { 
            _id: ObjectId.createFromHexString(msgId), 
        }
      //  if(!isAdmin) criteria['byUserId'] = ownerId
        if(!isAdmin) throw "only addmin can delete msg"

        
		const collection = await dbService.getCollection('msg')
		const res = await collection.deleteOne(criteria)

        if(res.deletedCount === 0) throw('Not your msg')
		return msgId
	} catch (err) {
		loggerService .error(`cannot remove msg ${msgId}`, err)
		throw err
	}
}

async function update(msg) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

    const msgToSave = { txt: msg.txt }

    try {
        const criteria = { _id: ObjectId.createFromHexString(msg._id) }

        if ((!isAdmin)  && (msg.byUserId !== ownerId))  {
            throw('Not your msg')
        } 


		const collection = await dbService.getCollection('msg')
		await collection.updateOne(criteria, { $set: msgToSave })

		return msg
	} catch (err) {
		loggerService .error(`cannot update msg ${msg._id}`, err)
		throw err
	}
    
}

async function add(msg) {
    try {
        const collection = await dbService.getCollection('msg');
        const result = await collection.insertOne(msg);
        
        const criteria =  { _id: result.insertedId }
        const pipeline = await buildAggregate(criteria);
        const addedMsg = await collection.aggregate(pipeline).toArray();

        
        var msg = addedMsg.shift() // מחזיר את המסמך היחיד ומסיר אותו מהמערך
        msg.aboutBug = {
            _id: msg.aboutBug._id,
            title: msg.aboutBug.title
        }
        msg.byUser = {
            _id: msg.byUser._id,
            fullname: msg.byUser.fullname
        }
        delete msg.aboutBugId
        delete msg.byUserId



        return msg;
    } catch (err) {
        console.log(`ERROR: cannot insert msg`, err);
        throw err;
    }
}


async function buildAggregate(criteria) {
    return [
        { $match: criteria },
        {
            $lookup: {
                localField: 'aboutBugId',
                from: 'bug',
                foreignField: '_id',
                as: 'aboutBug',
            },
        },
        { $unwind: '$aboutBug' },
        {
            $lookup: {
                localField: 'byUserId',
                from: 'user',
                foreignField: '_id',
                as: 'byUser',
            },
        },
        { $unwind: '$byUser' },
    ];
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
        // title: { $regex: filterBy.txt, $options: 'i' },
        // severity: { $gte: filterBy.severity }
    }

    return criteria
}

function _buildSort(filterBy) {
    if(!filterBy.sortBy) return {}
    return { [filterBy.sortBy]: filterBy.sortDir }
}