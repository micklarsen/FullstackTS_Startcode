import { IFriend } from '../interfaces/IFriend';
import { Db, Collection } from "mongodb";
import bcrypt from "bcryptjs";
import { ApiError } from '../errors/apiError';
import Joi, { ValidationError } from "joi"

const BCRYPT_ROUNDS = 10;

const USER_INPUT_SCHEMA = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(40)
        .required(),
    lastName: Joi.string()
        .min(2)
        .max(50)
        .required(),
    email: Joi.string()
        .email()
        .required(),
    password: Joi.string()
        .min(4)
        .max(30)
        .required()
})


class FriendsFacade {
    db: Db
    friendCollection: Collection

    constructor(db: Db) {
        this.db = db;
        this.friendCollection = db.collection("friends");
    }


    /**
     * Add a new friend
     * @param friend 
     * @throws ApiError if validation fails
     */
    async addFriend(friend: IFriend): Promise<{ id: string }> {
        const status = USER_INPUT_SCHEMA.validate(friend);
        if (status.error) {
            throw new ApiError(status.error.message, 400)
        }

        try {
            const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
            const f = { ...friend, password: hashedpw }

            await this.friendCollection.insertOne(
                {
                    firstName: f.firstName,
                    lastName: f.lastName,
                    email: f.email,
                    password: f.password,
                    role: "user"
                }
            )
            return this.friendCollection.findOne({ email: f.email })
        } catch (error) {
            throw new ApiError(error);
        }
    }


    /**
     * Edit a single friend
     * @param email 
     * @param friend 
     * @throws ApiError if validation fails or friend was not found
     */
    async editFriend(email: string, friend: IFriend): Promise<{ modifiedCount: number }> {
        const status = USER_INPUT_SCHEMA.validate(friend);
        if (status.error) {
            throw new ApiError(status.error.message, 400)
        }

        try {
            const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
            const f = { ...friend, password: hashedpw }

            await this.friendCollection.updateOne(
                { email: email },
                {
                    $set: {
                        firstName: f.firstName,
                        lastName: f.lastName,
                        email: f.email,
                        password: f.password,
                        role: "user"
                    },
                    $currentDate: { lastModified: true },
                }
            )
            return this.friendCollection.findOne({ email: f.email })
        } catch (error) {
            throw new ApiError(error);
        }

    }


    /**
     * Delete a single friend
     * @param friendEmail 
     * @returns true if deleted otherwise false
     */
    async deleteFriend(friendEmail: string): Promise<boolean> {
        try {
            const friend = await this.friendCollection.findOne({ email: friendEmail });
            if (!friend) return false;
            await this.friendCollection.deleteOne(friend);
            return true;

        } catch (error) {
            throw new ApiError(error);
        }
    }


    /**
     * Return a list of all friends
     * @param  
     * @returns JSON List
     * @throws ApiError if not found
     */
    async getAllFriends(): Promise<Array<IFriend>> {
        try {
            const users: unknown = await this.friendCollection.find({}).toArray();
            return users as Array<IFriend>

        } catch (error) {
            throw new ApiError(error);
        }
    }


    /**
     * Return a single friend
     * @param friendEmail 
     * @returns 
     * @throws ApiError if not found
     */
    async getFriend(friendEmail: string): Promise<IFriend> {
        try {
            const friend: IFriend = await this.friendCollection.findOne({ email: friendEmail });
            return friend;

        } catch (error) {
            throw new ApiError(error);
        }
    }


    /**
     * Use this method for authentication
     * @param friendEmail 
     * @param password 
     * @returns the user if he could be authenticated, otherwise null
     */
    async getVerifiedUser(friendEmail: string, password: string): Promise<IFriend | null> {
        const friend: IFriend = await this.friendCollection.findOne({ email: friendEmail })
        if (friend && await bcrypt.compare(password, friend.password)) {
            return friend
        }
        return Promise.resolve(null)
    }


}


export default FriendsFacade;