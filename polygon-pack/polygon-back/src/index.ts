import { listen } from "@colyseus/tools";

// Import app config
import appConfig from "./app.config";
import { initDatabase } from "./db/dbUtils";
import { setupPolygonOptions } from "open-gamefi";
import { contractABI } from "./globals";

// Create and listen on 2567 (or PORT environment variable.)
listen(appConfig, Number(process.env.PORT) || 3029);
setupPolygonOptions(process.env.JSON_RPC, contractABI, process.env.CONTRACT_ADDRESS, 50, 100000);
initDatabase();