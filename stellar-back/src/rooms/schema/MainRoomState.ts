import {Schema, MapSchema, type} from "@colyseus/schema";
import { User } from "../../db/entities/UserEntity";
import { Client } from "colyseus";

export class Player extends Schema {
    @type('string') user: User | undefined;
    @type('number') currency: number = 0;
    @type('number') generators: number = 0;
    client: Client;

    constructor(client: Client) {
        super();
        client = client;
    }
}

export class MainRoomState extends Schema {
    @type({map: Player}) users = new MapSchema<Player>();
}
