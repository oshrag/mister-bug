import fs from "fs";

import { loggerService } from "../../services/logger.service.js";

import { makeId, readJsonFile } from "../../services/util.service.js";


const bugs = readJsonFile('data/bugs.json')
const PAGE_SIZE = 3


export const bugService = {
    query,
    save,
    getById,
    remove
}


async function query(filterBy) {
    let bugsToDisplay = bugs

    loggerService.info(`query filterBy`, filterBy);

    try {
        if (filterBy.owner) {
            bugsToDisplay =  bugsToDisplay.filter(bug => bug.owner._id === filterBy.owner)
        }

        if (filterBy.txt) {
            const regExp = new RegExp(filterBy.txt, 'i')
            bugsToDisplay =  bugsToDisplay.filter(bug => regExp.test(bug.title))
        }

        if (filterBy.severity) {
            bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.severity)
        }

   
        if (filterBy.labels) {
            const filterLabelsArray = filterBy.labels.split(',');
            // loggerService.info(`filterBy.labels`, filterBy.labels);
            bugsToDisplay = bugsToDisplay.filter(bug => { return bug.labels.some(label => filterLabelsArray.includes(label))})
        }


        if (filterBy.pageIdx) {
            loggerService.info(`slice filterBy`, filterBy);

            const startIdx = filterBy.pageIdx * PAGE_SIZE
            bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
        }

        if (filterBy.sortBy) {

            return  bugsToDisplay.sort((a, b) => {
                if (filterBy.sortBy === 'title') {
                    if ( filterBy.sortDir === '-1' ) {
                        return a.title.localeCompare(b.title) * filterBy.sortDir;
                    } else {
                        return a.title.localeCompare(b.title)
                    }
                    
                } else if (filterBy.sortBy === 'createdAt') {
                    if ( filterBy.sortDir === '-1' ) {
                        return new Date(a.createdAt) - new Date(b.createdAt) * filterBy.sortDir;
                    } else {
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    }
                } else if (filterBy.sortBy === 'severity') {
                    if ( filterBy.sortDir === '-1' ) {
                        return (a.severity - b.severity) * filterBy.sortDir;
                    } else {
                        return (a.severity - b.severity);
                    }
                } 
            });


        }


        return bugsToDisplay
    } catch (err) {
        loggerService.error(`Couldn't get bugs`, err);
        throw err
    }
}



async function getById(bugId) {
    try {
        const bug  = bugs.find(bug => bug._id === bugId)
        if (!bug) throw `Couldn't find bug with _id ${bugId}`
        return bug
    } catch (err) {
        loggerService.error(`Couldn't get bug`, err);
        throw err
    }
}



async function remove(bugId, loggedinUser) {
    try {

        const bugToRemove = await bugService.getById(bugId) //for a case client didnt send all fields
        if ( !loggedinUser.isAdmin && bugToRemove?.owner?._id !== loggedinUser._id ) throw 'Cant remove bug'

        const bugIdx = bugs.findIndex(bug => bug._id === bugId)
        if (bugIdx === -1) throw `Couldn't remove bug with _id ${bugId}`
        bugs.splice(bugIdx, 1)
        return _saveBugsToFile()
    } catch (err) {
        loggerService.error(`Couldn't get bug`, err);
        throw err
    }
}


async function save(bugToSave, loggedinUser) {
    try {
        if (bugToSave._id) {
            
            if ( bugToSave?.owner?._id !== loggedinUser._id) throw 'Cant update bug'

            const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
            if (idx === -1) throw `Couldn't update bug with _id ${bugToSave._id}`
            bugs[idx] = bugToSave
        } else {
            bugToSave._id = makeId()
            bugToSave.owner = loggedinUser
            bugs.push(bugToSave)
           
        }
        await _saveBugsToFile()
        return bugToSave
    } catch (err) {
        loggerService.error(`Couldn't get bug`, err);
        throw err
    }
}


function _saveBugsToFile(path = './data/bugs.json') {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile(path, data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}
