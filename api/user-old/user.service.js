import fs from "fs";

import { loggerService } from "../../services/logger.service.js";
import { makeId, readJsonFile } from "../../services/util.service.js";


const users = readJsonFile('data/users.json')
const PAGE_SIZE = 3


export const userService = {
    query,
    save,
    getById,
    remove,
    getByUsername
}


async function query() {
    let usersToDisplay = users
    try {
        return usersToDisplay
    } catch (err) {
        loggerService.error(`Couldn't get users`, err);
        throw err
    }
}



async function getById(userId) {
    try {
        const user  = users.find(user => user._id === userId)
        if (!user) throw `Couldn't find user with _id ${userId}`
        return user
    } catch (err) {
        loggerService.error(`Couldn't get user`, err);
        throw err
    }
}



async function remove(userId) {
    try {
        const userIdx = users.findIndex(user => user._id === userId)
        if (userIdx === -1) throw `Couldn't remove user with _id ${userId}`
        users.splice(userIdx, 1)
        return _saveUsersToFile()
    } catch (err) {
        loggerService.error(`Couldn't get user`, err);
        throw err
    }
}


async function save(userToSave) {
    try {
        if (userToSave._id) {
            const idx = users.findIndex(user => user._id === userToSave._id)
            if (idx === -1) throw `Couldn't update user with _id ${userToSave._id}`
            users[idx] = userToSave
        } else {
            userToSave._id = makeId()
            users.push(userToSave)
           
        }
        await _saveUsersToFile()
        return userToSave
    } catch (err) {
        loggerService.error(`Couldn't get user`, err);
        throw err
    }
}


function _saveUsersToFile(path = './data/users.json') {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(users, null, 4)
        fs.writeFile(path, data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}


async function getByUsername(username) {
    try {
        const user = users.find(user => user.username === username)
        // if (!user) throw `User not found by username : ${username}`
        return user
    } catch (err) {
        loggerService.error('userService[getByUsername] : ', err)
        throw err
    }
}