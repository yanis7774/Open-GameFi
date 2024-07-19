import {Schema, MapSchema, type} from "@colyseus/schema";

export class Player extends Schema {
    @type('string') address: string;
    @type('string') name: string;
}

export class MainRoomState extends Schema {
    @type("number") countdown: number;
    @type({map: Player}) users = new MapSchema<Player>();
}
