import {Schema, MapSchema, type} from "@colyseus/schema";
import { User } from "../../db/entities/UserEntity";
import { Client } from "colyseus";

export class Player extends Schema {
    user: User | undefined;
    currency: number = 0;
    generators: number = 0;
    client: Client;

    constructor(client: Client) {
        super();
        this.client = client;
    }
}

export class MainRoomState extends Schema {
    @type({map: Player}) users = new MapSchema<Player>();
}
