import { Request, Response } from 'express';
const debug = require('debug')('app');


const simpleLogger = function (req: Request, res: Response, next: Function) {
    debug(new Date().toLocaleString(), req.method, req.originalUrl, req.ip)
    next();
}


export default simpleLogger;