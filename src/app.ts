import express from "express";
import dotenv from "dotenv";
import path from "path";
import friendsRoutes from "./routes/FriendRoutes";
import { Request, Response } from "express"
import logger, { stream } from "./middleware/winstonLogger";
import simpleLogger from "./middleware/simpleLogger";
import { ApiError } from "./errors/apiError";
/* import myCors from "./middleware/myCors"; */

dotenv.config();


const app = express();


/* const debug = require("debug")("app") */


//Winston logger
const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
app.use(require("morgan")(morganFormat, { stream }));
logger.log("info", "Server started");


//Simple logger
/* app.use(simpleLogger) */


//"Enable" static files
app.use(express.static(path.join(process.cwd(), "public")))


//Use homemade CORS middleware - Proper one implemented in FriendRoutes
/* const myCors = require("cors");
app.use(myCors()); */


app.use("/api/friends", friendsRoutes)


app.use("/api", (req: any, res: any, next) => {
    res.status(404).json({ errorCode: 404, msg: "not found" })
})


//Errors for friend API handled - other errors are passed on
app.use((err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof (ApiError)) {
        const errorCode = err.errorCode ? err.errorCode : 500;
        res.status(errorCode).json({ errorCode: 404, msg: "not found" })
    } else {
        next(err)
    }
})

app.get("/demo", (req, res) => {
    res.send("Server is up");
})


export default app;