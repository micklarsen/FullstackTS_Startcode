import app from "../app";
const debug = require("debug")("wwww")

import { DBConnector } from "../config/DBConnector";
import { setupFacade } from "../graphql/resolvers";

const PORT = process.env.PORT || 3333;


async function connectToDB() {
    const connection = await DBConnector.connect();
    const db = connection.db(process.env.DB_NAME)
    app.set("db", db) //Make database available to the rest of the application
    app.set("db-type", "REAL") //So relevant places can log the DB Used
   
    //Winston
    app.listen(PORT, () => app.get("logger").info(`Server starter on port ${PORT}`))
    setupFacade(db)
    //app.listen(PORT, () => debug(`Server started, listening on port ${PORT}`)) //Homemade logger
}
connectToDB();


