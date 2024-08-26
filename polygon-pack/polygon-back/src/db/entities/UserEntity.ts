import {Entity, Property} from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class User extends BaseEntity {
    @Property({type: 'string'}) username: string;
    @Property({type: 'string'}) password: string;
    @Property({type: 'string'}) publicId: string;
    @Property({type: 'string'}) secretId: string;
    @Property({type: 'string'}) mnemonic: string;
    @Property({type: 'date'}) lastPresence: Date = new Date();
    @Property({type: 'number'}) currency: number = 0;
    @Property({type: 'number'}) generators: number = 0;
    @Property({type: 'number'}) reward: number = 0;
    @Property({type: 'boolean'}) nft: boolean = false;

    constructor(username: string | undefined,
        publicId: string,
        password: string,
        secretId: string,
        mnemonic: string
    ) {
        super();
        this.publicId = publicId;
        this.username = username;
        this.password = password;
        this.secretId = secretId;
        this.mnemonic = mnemonic;
    }

}