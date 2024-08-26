import {EntityRepository, MikroORM} from '@mikro-orm/core';
import type {MongoDriver} from '@mikro-orm/mongodb';
import {MongoEntityManager} from '@mikro-orm/mongodb';
import { User } from './entities/UserEntity';
import { ErrorEntry } from './entities/ErrorEntity';
import { Transaction } from './entities/TransactionEntity';
import { ConfigSetting } from './entities/ConfigEntity';

export const DI = {} as {
    orm: MikroORM,
    em: MongoEntityManager,
    userRepository: EntityRepository<User>,
    errorRepository: EntityRepository<ErrorEntry>,
    transactionRepository: EntityRepository<Transaction>,
    configRepository: EntityRepository<ConfigSetting>,
};

export async function connect() {
    try {
        // @ts-ignore
        DI.orm = await MikroORM.init<MongoDriver>({
            type: 'mongo',
            entities: [User,ErrorEntry,Transaction,ConfigSetting],
            dbName: process.env.DB_NAME,
            clientUrl: process.env.DB_URL
        });
        DI.em = DI.orm.em as MongoEntityManager;

        console.log(`Connected db: ${process.env.DB_NAME} on ${process.env.DB_URL}`);
    } catch(e) {
        console.log(`Error connecting to db ${e}`)
    }
}