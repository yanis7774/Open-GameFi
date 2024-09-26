"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@colyseus/tools");
// Import app config
const app_config_1 = __importDefault(require("./app.config"));
const dbUtils_1 = require("./db/dbUtils");
const open_gamefi_1 = require("open-gamefi");
const globals_1 = require("./globals");
// Create and listen on 2567 (or PORT environment variable.)
(0, tools_1.listen)(app_config_1.default, Number(process.env.PORT) || 3029);
(0, open_gamefi_1.setupPolygonOptions)(process.env.JSON_RPC, globals_1.contractABI, process.env.CONTRACT_ADDRESS, 50, 100000);
(0, dbUtils_1.initDatabase)();
