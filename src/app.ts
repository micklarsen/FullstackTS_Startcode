import express from "express";
import dotenv from "dotenv";
import path from "path";
import { Request, Response } from "express"
/* import simpleLogger from "./middleware/simpleLogger"; */
import { ApiError } from "./errors/apiError";
import friendsRoutesAuth from "./routes/FriendRoutesAuth";

const app = express();

dotenv.config();




//Winston logger
import logger, { stream } from "./middleware/winstonLogger";
const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
app.use(require("morgan")(morganFormat, { stream }));
app.set("logger", logger);

//Simple logger
/* const debug = require("debug")("app") */
/* app.use(simpleLogger) */


//"Enable" static files
app.use(express.static(path.join(process.cwd(), "public")))


app.get("/demo", (req, res) => {
    res.send("Server is up");
})


app.use("/api/friends", friendsRoutesAuth)


app.use("/api", (req: any, res: any, next) => {
    res.status(404).json({ errorCode: 404, msg: "not found" })
})


//Errors for friend API handled - other errors are passed on
app.use((err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof (ApiError)) {
        res.status(err.errorCode).json({ errorCode: err.errorCode, msg: err.message })
    } else {
        next(err)
    }
})
  


export default app;