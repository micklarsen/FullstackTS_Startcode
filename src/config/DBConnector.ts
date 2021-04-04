import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server"

/**
 *  Connector which you should use for developement and production
 *  Connection String must be given via process.env.CONNECTION
 */
export class DBConnector {
    private static client: MongoClient | null

    public static async connect(): Promise<MongoClient> {
        if (DBConnector.client) {
            return DBConnector.client;
        }

        const uri = process.env.CONNECTION

        if (uri === undefined) {
            throw new Error("No Database Connection available")
        }

        DBConnector.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, })
        await DBConnector.client.connect();
        return DBConnector.client;
    }


    public static close() {
        if (DBConnector.client) {
            DBConnector.client.close()
            DBConnector.client = null;
        }
    }
}

/**
 * In-memory MongoDB which you should use for testing
 */
export class InMemoryDbConnector {
    private static client: MongoClient | null
    public static async connect(): Promise<MongoClient> {
        if (InMemoryDbConnector.client) {
            return InMemoryDbConnector.client;
        }
        const mongod = new MongoMemoryServer();
        const uri = await mongod.getUri();
        InMemoryDbConnector.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, })
        await InMemoryDbConnector.client.connect()
        return InMemoryDbConnector.client
    }
}
