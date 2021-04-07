import * as mongo from "mongodb"
import FriendFacade from '../src/facades/friendFacade';
import chai from "chai";

const expect = chai.expect;

//use these two lines for more streamlined tests of promise operations
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import bcryptjs, { hash } from "bcryptjs"
import { InMemoryDbConnector } from "../src/config/dbConnector"
import { ApiError } from "../src/errors/apiError";

let friendCollection: mongo.Collection;
let facade: FriendFacade;


describe("## VERIFY FRIENDS FACADE ##", () => {

    before(async function () {
        const client = await InMemoryDbConnector.connect();
        const db = client.db();
        friendCollection = db.collection("friends");
        facade = new FriendFacade(db);
    })


    beforeEach(async () => {
        const hashedPW = await bcryptjs.hash("secret", 4)
        await friendCollection.deleteMany({})
        await friendCollection.insertMany([
            { firstName: "Donald", lastName: "Trump", email: "dt@example.com", password: hashedPW, role: "user" },
            { firstName: "Frodo", lastName: "Baggins", email: "fb@michaeldelving.sh", password: hashedPW, role: "user" }
        ])
    })


    describe("Verify the addFriend method", () => {
        it("It should Add the user Jan", async () => {
            const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret" }
            const status = await facade.addFriend(newFriend);
            expect(status).to.be.not.null
            const jan = await friendCollection.findOne({ email: "jan@b.dk" })
            expect(jan.firstName).to.be.equal("Jan")
        })

        it("It should not add a user with a role (validation fails)", async () => {
            const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret", role: "admin" }
            await expect(facade.addFriend(newFriend)).to.be.rejectedWith(ApiError)
        })
    })


    describe("Verify the editFriend method", () => {
        it("It should change lastName to Duck", async () => {
            const editedFriend = { firstName: "Donald", lastName: "Duck", email: "dt@example.com", password: "secret" };
            const status = await facade.editFriend("dt@example.com", editedFriend);
            expect(status).to.be.not.null;
            const friend = await friendCollection.findOne({ email: "dt@example.com" });
            expect(friend.lastName).to.be.equal("Duck");
        })
    })


    describe("Verify the deleteFriend method", () => {
        it("It should remove the user Frodo", async () => {
            const status = await facade.deleteFriend("fb@michaeldelving.sh");
            expect(status).to.be.not.null;
            expect(status).to.be.true;
        })
        
        it("It should return false, for a user that does not exist", async () => {
            const status = await facade.deleteFriend("does_not@exist.com");
            expect(status).to.be.not.null;
            expect(status).to.be.false;
        })
    })


    describe("Verify the getAllFriends method", () => {
        it("It should get two friends", async () => {
            const status = await facade.getAllFriends();
            expect(status).to.be.not.null;
            expect(status).to.be.length(2);
        })

        it("Should not be more than two friends in the list", async () => {
            const status = await facade.getAllFriends();
            expect(status).to.be.not.null;
            expect(status).to.be.not.length(3);
        })
    })


    describe("Verify the getFriend method", () => {
        it("It should find Donald Trump", async () => {
            const status = await facade.getFriend("dt@example.com");
            expect(status).to.be.not.null;
            expect(status.firstName).to.be.equal("Donald");
        })

        it("It should not find xxx.@b.dk", async () => {
            const status = await facade.getFriend("xxx.@b.dk");
            expect(status).to.be.null;
        })
    })

    
    describe("Verify the getVerifiedUser method", () => {
        it("It should correctly validate Frodo Baggins credential,s", async () => {
            const verifiedFrodo = await facade.getVerifiedUser("fb@michaeldelving.sh", "secret")
            expect(verifiedFrodo).to.be.not.null;
        })

        it("It should NOT validate Peter Pan's credential,s", async () => {
            const verifiedFrodo = await facade.getVerifiedUser("fb@michaeldelving.sh", "wrong_password")
            expect(verifiedFrodo).to.be.null;
        })

        it("It should NOT validate a non-existing users credentials", async () => {
            const nonExistingUser = await facade.getVerifiedUser("does_not@exist.com", "wrong_password")
            expect(nonExistingUser).to.be.null;
        })
    })
})