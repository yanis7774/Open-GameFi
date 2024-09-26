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
    @Property({type: 'array'}) generators: number[] = [0,0,0];
    @Property({type: 'array'}) paidGenerators: number[] = [0,0,0];
    @Property({type: 'boolean'}) nft: boolean = false;
    @Property({type: 'string'}) accountType: string = "basic";

    constructor(username: string | undefined,
        publicId: string,
        password: string,
        secretId: string,
        mnemonic: string,
        accType: string = "basic"
    ) {
        super();
        this.publicId = publicId;
        this.username = username;
        this.password = password;
        this.secretId = secretId;
        this.mnemonic = mnemonic;
        this.accountType = accType;
    }

}