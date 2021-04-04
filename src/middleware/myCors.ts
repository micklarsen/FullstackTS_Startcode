import { Request, Response } from "express";


const myCors = function (req: Request, res: Response, next: Function) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}


export default myCors;