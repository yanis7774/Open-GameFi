import { listen } from "@colyseus/tools";

// Import app config
import appConfig from "./app.config";
import { initDatabase } from "./db/dbUtils";

// Create and listen on 2567 (or PORT environment variable.)
listen(appConfig, Number(process.env.PORT) || 3029);
initDatabase();