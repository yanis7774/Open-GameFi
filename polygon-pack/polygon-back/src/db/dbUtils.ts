import { DI, connect } from "./database.config";
import { User } from "./entities/UserEntity";
const { exec } = require('child_process');
const fs = require('fs');

enum opType {
    findOne = "findOne",
    find = "find",
    findAll = "findAll",
    flush = "flush",
    count = "count"
}
async function repoOperation(repoType: any, operation: string, data: any = undefined, dataB: any = undefined) {
    const repo = DI.em.fork().getRepository(repoType);
    switch (operation) {
        case opType.findOne:
            return await repo.findOne(data);
        case opType.find:
            if (dataB != undefined)
                return await repo.find(data, dataB);
            return await repo.find(data);
        case opType.findAll:
            return await repo.findAll();
        case opType.flush:
            await repo.persist(data).flush();
            return data; // Return persisted data for operations that need it
        case opType.count:
            return repo.count(data);
        case 'custom':
            return await data(repo); // Execute custom operations
        case 'default':
            return undefined;
    }
}

export async function initUser(username: string, password: string, publicId: string, secretId: string, mnemonic: string) {
    const existingUser = await repoOperation(User, opType.findOne, {username: `${username}`});
    if (existingUser) {
        return existingUser;
    }
    const user = new User(username, publicId, password, secretId, mnemonic);
    await repoOperation(User, opType.flush, user);
    return user;
}

export async function saveUserToDb(user: User | User[]) {
    await repoOperation(User, opType.flush, user);
}

export async function getUser(username: string) {
    return await repoOperation(User,opType.findOne,{username: `${username}`});
}

export async function initDatabase() {
    await connect();
}