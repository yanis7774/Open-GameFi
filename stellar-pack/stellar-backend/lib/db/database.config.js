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
exports.DI = void 0;
exports.connect = connect;
const core_1 = require("@mikro-orm/core");
const UserEntity_1 = require("./entities/UserEntity");
const ErrorEntity_1 = require("./entities/ErrorEntity");
const TransactionEntity_1 = require("./entities/TransactionEntity");
const ConfigEntity_1 = require("./entities/ConfigEntity");
exports.DI = {};
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // @ts-ignore
            exports.DI.orm = yield core_1.MikroORM.init({
                type: 'mongo',
                entities: [UserEntity_1.User, ErrorEntity_1.ErrorEntry, TransactionEntity_1.Transaction, ConfigEntity_1.ConfigSetting],
                dbName: process.env.DB_NAME,
                clientUrl: process.env.DB_URL
            });
            exports.DI.em = exports.DI.orm.em;
            console.log(`Connected db: ${process.env.DB_NAME} on ${process.env.DB_URL}`);
        }
        catch (e) {
            console.log(`Error connecting to db ${e}`);
        }
    });
}
