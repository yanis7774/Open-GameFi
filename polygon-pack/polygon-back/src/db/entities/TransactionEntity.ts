import {Entity, Property} from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Transaction extends BaseEntity {
    @Property({type: 'string'}) transactionId: string;
    @Property({type: 'string'}) publicId: string;
    @Property({type: 'string'}) username: string;
    @Property({type: 'number'}) amount: number;
    @Property({type: 'boolean'}) pending: boolean = true;
    @Property({type: 'boolean'}) success: boolean = false;
    @Property({type: 'string'}) errorLog: string = "";
    @Property({type: 'string'}) to: string = "";

    constructor(transactionId: string,
                publicId: string,
                username: string | undefined,
                amount: number,
    ) {
        super();
        this.transactionId = transactionId
        this.publicId = publicId
        this.amount = amount;
        this.username = username;
    }

}