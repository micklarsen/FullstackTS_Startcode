import { Router } from "express"
import { IFriend } from "../interfaces/IFriend";
import friendsFacade from "../facades/DummyDB-Facade"
import express from "express";
import { ApiError } from "../errors/apiError";
import authMiddleware from "../middleware/basicAuth";


const router = Router();
const cors = require("cors");
const Joi = require('joi');

router.use(express.json());
router.use(authMiddleware)


var corsOptions = {
    origin: 'http://localhost:3001',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


/* GET ALL FRIENDS */
router.get("/all", cors(corsOptions), async (req, res) => {
    const allFriends = await friendsFacade.getAllFriends();
    const allFriendsDTO = allFriends.map(friend => {
        const { firstName, lastName } = friend
        return { firstName: firstName, lastName }; //If prop name is the same as the value, only one is needed - this is an example.
    })
    res.json(allFriendsDTO);
})


/* GET 1 FRIEND BY ID */
router.get("/:id", async (req, res, next) => {
    try {
        const friend = await friendsFacade.getFriend(req.params.id)
        if (friend == null) {
            throw new ApiError("No friend found", 404)
        }
        const { firstName, lastName, email } = friend;
        const friendDTO = { firstName, lastName, email }
        res.json(friendDTO)
    } catch (err) {
        next(err)
    }
});


/* POST FRIEND */
router.post("/", async (req, res) => {
    const friends = await friendsFacade.getAllFriends();

    const { error } = validateFriend(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const friend = {
        id: "id" + (friends.length + 1),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    };
    const f = await friendsFacade.addFriend(friend);
    res.json(f);
});


/* UPDATE FRIEND */
router.put("/:id", async (req, res) => {
    const friend = await friendsFacade.updateFriend(req.params.id);
    if (!friend) return res.status(404).send('The friend with the given ID was not found');

    const { error } = validateFriend(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    friend.firstName = req.body.firstName;
    friend.lastName = req.body.lastName;
    friend.email = req.body.email;
    friend.password = req.body.password;
    res.send(friend);
});


/* DELETE FRIEND BY ID */
router.delete("/:email", async (req, res) => {
    const friends = await friendsFacade.getAllFriends();
    const friend = await friendsFacade.deleteFriend(req.params.email);
    if (!friend) return res.status(404).send('The friend with the given EMAIL was not found');

    const index = friends.indexOf(friend);
    friends.splice(index, 1);

    res.json(friend);
});


// Validating POST and PUT
function validateFriend(friend: IFriend) {
    const schema = Joi.object({
        firstName: Joi.string()
            .required(),
        lastName: Joi.string()
            .required(),
        email: Joi.string()
            .email({ minDomainSegments: 2 })
            .required(),
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    })
    return schema.validate(friend);
}


export default router