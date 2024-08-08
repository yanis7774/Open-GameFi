import { listen } from "@colyseus/tools";

// Import app config
import appConfig from "./app.config";
import { initDatabase } from "./db/dbUtils";
import { Asset, BASE_FEE, Horizon, Networks, Operation, TransactionBuilder } from "stellar-sdk";

// Create and listen on 2567 (or PORT environment variable.)
listen(appConfig, Number(process.env.PORT) || 3029);
initDatabase();

async function issueAsset() {
    const astroDollar = new Asset(
        "AstroDollar",
        "GCINXWZRNVSJXOFYGKVKWBAWZ2QQUI62ZWR6HHWVNXQJDBFML4KBDGKU", // issuer public key
    );

    const server = new Horizon.Server(
        "https://horizon-testnet.stellar.org", // testnet url
    );
    const issueAccount = await server.loadAccount("GCINXWZRNVSJXOFYGKVKWBAWZ2QQUI62ZWR6HHWVNXQJDBFML4KBDGKU"); // issuer public key
    const account = await server.loadAccount("GDL5WPFX2XMOBT3MVM3TLQY3PYRRYKPIXYZVC6ETAIR3JOH2KJ3EWLW6"); // distributor public key
    
    const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        // The `changeTrust` operation creates (or alters) a trustline
        .addOperation(
        Operation.changeTrust({
            asset: astroDollar,
            limit: "1000", // optional
            source: "GDL5WPFX2XMOBT3MVM3TLQY3PYRRYKPIXYZVC6ETAIR3JOH2KJ3EWLW6", // distributor public key
        }),
        )
        .setTimeout(100)
        .build();

    const transaction2 = new TransactionBuilder(issueAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
    .addOperation(Operation.payment({
        destination: "GDL5WPFX2XMOBT3MVM3TLQY3PYRRYKPIXYZVC6ETAIR3JOH2KJ3EWLW6",
        asset: astroDollar,
        amount: '1',
        source: "GCINXWZRNVSJXOFYGKVKWBAWZ2QQUI62ZWR6HHWVNXQJDBFML4KBDGKU"
    }))
}

issueAsset();