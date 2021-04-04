import auth from 'basic-auth'
import compare from 'tsscmp'
import { Request, Response } from "express"
import facade from "../facades/DummyDB-Facade"


const authMiddleware = async function (req: Request, res: Response, next: Function) {
    var credentials = auth(req)

    if (credentials && await check(credentials.name, credentials.pass, req)) {
        next()
    } else {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        res.end('Access denied')
    }
}


async function check(email: string, pass: string, req: any) {
    const user = await facade.getFriend(email);
    if (user && compare(pass, user.password)) {
        req.credentials = { userName: user.email }
        return true
    }
    return false

}


export default authMiddleware;