"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUser = initUser;
exports.saveUserToDb = saveUserToDb;
exports.getUser = getUser;
exports.getUserByAddress = getUserByAddress;
exports.initDatabase = initDatabase;
const database_config_1 = require("./database.config");
const UserEntity_1 = require("./entities/UserEntity");
const { exec } = require('child_process');
const fs = require('fs');
var opType;
(function (opType) {
    opType["findOne"] = "findOne";
    opType["find"] = "find";
    opType["findAll"] = "findAll";
    opType["flush"] = "flush";
    opType["count"] = "count";
})(opType || (opType = {}));
function repoOperation(repoType_1, operation_1) {
    return __awaiter(this, arguments, void 0, function* (repoType, operation, data = undefined, dataB = undefined) {
        const repo = database_config_1.DI.em.fork().getRepository(repoType);
        switch (operation) {
            case opType.findOne:
                return yield repo.findOne(data);
            case opType.find:
                if (dataB != undefined)
                    return yield repo.find(data, dataB);
                return yield repo.find(data);
            case opType.findAll:
                return yield repo.findAll();
            case opType.flush:
                yield repo.persist(data).flush();
                return data; // Return persisted data for operations that need it
            case opType.count:
                return repo.count(data);
            case 'custom':
                return yield data(repo); // Execute custom operations
            case 'default':
                return undefined;
        }
    });
}
function initUser(username_1, password_1, publicId_1, secretId_1, mnemonic_1) {
    return __awaiter(this, arguments, void 0, function* (username, password, publicId, secretId, mnemonic, accType = "basic") {
        const existingUser = yield repoOperation(UserEntity_1.User, opType.findOne, { publicId: `${publicId}` });
        if (existingUser) {
            return existingUser;
        }
        const user = new UserEntity_1.User(username, publicId, password, secretId, mnemonic, accType);
        yield repoOperation(UserEntity_1.User, opType.flush, user);
        return user;
    });
}
function saveUserToDb(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield repoOperation(UserEntity_1.User, opType.flush, user);
    });
}
function getUser(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield repoOperation(UserEntity_1.User, opType.findOne, { username: `${username}` });
    });
}
function getUserByAddress(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield repoOperation(UserEntity_1.User, opType.findOne, { publicId: `${address}` });
        if (user)
            return user;
        else
            return yield initUser("", "", address, "", "", "freighter");
    });
}
function initDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, database_config_1.connect)();
    });
}
