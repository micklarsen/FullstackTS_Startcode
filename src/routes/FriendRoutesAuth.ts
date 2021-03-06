import express from "express"
import Router from "express"
const router = Router();
import { ApiError } from "../errors/apiError"
import FriendFacade from "../facades/friendFacade"
const debug = require("debug")("FriendRoutesAuth")
import base64 from "base-64";

let facade: FriendFacade;

router.use(express.json());


// Initialize facade using the database set on the application object
router.use(async (req, res, next) => {
    if (!facade) {
        const db = req.app.get("db")
        req.app.get("logger").log("info", `Database used: ${req.app.get("db-type")}`);
        //debug("Database used: " + req.app.get("db-type"))
        facade = new FriendFacade(db)
    }
    next()
})


// Does not require authentication
router.post('/', async function (req, res, next) {
    try {
        const status = await facade.addFriendV2(req.body)
        res.json({ status })
    } catch (err) {
        debug(err)
        if (err instanceof ApiError) {
            next(err)
        } else {
            next(new ApiError(err.message, 400));
        }
    }
})


router.post("/login", async (req, res, next) => {
    const { userName, password } = req.body;
    const user = await facade.getVerifiedUser(userName, password)
    if (!user) {
        return next(new ApiError("Failded to login", 400))
    }
    const base64AuthString = "Basic " + base64.encode(userName + ":" + password)
    res.json({ base64AuthString, user: user.email, role: user.role })
})

/* ALL ENDPOINTS BELOW REQUIRES AUTHENTICATION DUE TO THE MIDDLEWARE*/

import authMiddleware from "../middleware/basicAuth"
const USE_AUTHENTICATION = !process.env["SKIP_AUTHENTICATION"];

if (USE_AUTHENTICATION) {
    router.use(authMiddleware);
}


router.get("/all", async (req: any, res) => {
    const friends = await facade.getAllFriendsV2();
    const friendsDTO = friends.map(friend => {
        const { firstName, lastName, email } = friend
        return { firstName, lastName, email }
    })
    res.json(friendsDTO);
})



/* Authenticated users can edit themselves */

router.put('/edit', async function (req: any, res, next) {
    try {
        if (!USE_AUTHENTICATION) {
            throw new ApiError("This endpoint requires authentication", 500)
        }
        const email = req.credentials.userName;
        const friend = await facade.editFriendV2(email, req.body)
        res.json(friend)
    } catch (err) {
        debug(err)
        if (err instanceof ApiError) {
            return next(err)
        }
        next(new ApiError(err.message, 400));
    }
})

router.get("/me", async (req: any, res, next) => {
    try {
        if (!USE_AUTHENTICATION) {
            throw new ApiError("This endpoint requires authentication", 500)
        }
        const emailId = req.credentials.userName;
        const friend = await facade.getFriendFromEmail(emailId);

        const { firstName, lastName, email, role } = friend;
        const friendDTO = { firstName, lastName, email, role }
        res.json(friendDTO);

    } catch (err) {
        next(err)
    }
})


/* Admin role can fetch everyone */
router.get("/:email", async (req: any, res, next) => {
    if (USE_AUTHENTICATION && !req.credentials.role && req.credentials.role !== "admin") {
        throw new ApiError("Not Authorized", 401)
    }
    const userId = req.params.email;
    try {
        const friend = await facade.getFriend(userId);
        if (friend == null) {
            throw new ApiError("user not found", 404)
        }
        const { firstName, lastName, email, role } = friend;
        const friendDTO = { firstName, lastName, email, role }
        res.json(friendDTO);
    } catch (err) {
        next(err)
    }
})


/* Admin rolecan edit everyone */
router.put("/:email", async function (req: any, res, next) {
    try {
        if (USE_AUTHENTICATION && !req.credentials.role && req.credentials.role !== "admin") {
            throw new ApiError("Not Authorized", 401)
        }
        const email = req.params.email;
        const f = await facade.getFriendFromEmail(email);
        if (f == null) {
            throw new ApiError("user not found", 404)
        }
        let newFriend = req.body;
        const friend = await facade.editFriendV2(email, newFriend)
        res.json(friend)
    } catch (err) {
        debug(err)
        if (err instanceof ApiError) {
            return next(err)
        }
        next(new ApiError(err.message, 400));
    }
})


/* Admin role can delete everyone */
router.delete('/:email', async function (req: any, res, next) {

    try {
        if (USE_AUTHENTICATION && !req.credentials.role && req.credentials.role !== "admin") {
            throw new ApiError("Not Authorized", 401)
        }
        const userId = req.params.email;
        const friend = await facade.deleteFriend(userId);

        if (friend == null) {
            throw new ApiError("user not found", 404)
        }
        res.json("User deleted");
    } catch (err) {
        debug(err)
        if (err instanceof ApiError) {
            return next(err)
        }
        next(new ApiError(err.message, 400));
    }
})


export default router