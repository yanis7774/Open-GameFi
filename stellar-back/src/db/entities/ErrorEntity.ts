import {Entity, Property} from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class ErrorEntry extends BaseEntity {
    @Property({type: 'string'}) publicId: string | undefined;
    @Property({type: 'string'}) username: string | undefined;
    @Property({type: 'string'}) error: string | undefined;
    @Property({type: 'object'}) data: any;

    constructor(tgId: string | undefined,
                username: string | undefined,
                error: string | undefined,
                data: any
    ) {
        super();
        this.publicId = tgId;
        this.username = username;
        this.error = error;
        this.data = data;
    }
}