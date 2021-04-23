import express from "express";
import dotenv from "dotenv";
import path from "path";
import { Request, Response } from "express"
/* import simpleLogger from "./middleware/simpleLogger"; */
import { ApiError } from "./errors/apiError";
import friendsRoutesAuth from "./routes/FriendRoutesAuth";
import cors from "cors";

const app = express();

app.use(express.json()); 

app.use(cors());

dotenv.config();

//Winston logger
import logger, { stream } from "./middleware/winstonLogger";
const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
app.use(require("morgan")(morganFormat, { stream }));
app.set("logger", logger); //Sætter logger på global app. req.app.get("logger").log("info", "some message...")

//Simple logger
/* const debug = require("debug")("app") */
/* app.use(simpleLogger) */


//"Enable" static files
app.use(express.static(path.join(process.cwd(), "public")))


app.use("/api/friends", friendsRoutesAuth)


app.get("/demo", (req, res) => {
    res.send("Server is up");
})


import authMiddleware from "./middleware/basicAuth"
//app.use("/graphql", authMiddleware)

app.use("/graphql", (req, res, next) => {
    const body = req.body;
    if (body && body.query && body.query.includes("createFriend")) {
        console.log("Create")
        return next();
    }
    if (body && body.operationName && body.query.includes("IntrospectionQuery")) {
        return next();
    }
    if (body.query && (body.mutation || body.query)) {
        return authMiddleware(req, res, next)
    }
    next()
})


import { graphqlHTTP } from 'express-graphql';
import { schema } from './graphql/schema';

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));


//Errors for friend API handled - other errors are passed on
app.use((err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof (ApiError)) {
        res.status(err.errorCode).json({ errorCode: err.errorCode, msg: err.message })
    } else {
        next(err)
    }
})



export default app;