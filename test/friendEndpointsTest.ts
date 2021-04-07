import path from "path";
import { expect } from "chai"
import app from "../src/app"

import supertest from "supertest"
const request = supertest(app)

import bcryptjs from "bcryptjs"
import * as mongo from "mongodb"
import { InMemoryDbConnector } from "../src/config/dbConnector"
import { ApiError } from "../src/errors/apiError";

let friendCollection: mongo.Collection;


describe("### Describe the Friend Endpoints (/api/friends) ###", function () {

    let URL: string;


    before(async function () {
        const connection = await InMemoryDbConnector.connect();
        const db = connection.db();
        app.set("db", db)
        app.set("db-type", "TEST-DB")
        friendCollection = db.collection("friends")
    })


    beforeEach(async function () {
        const hashedPW = await bcryptjs.hash("secret", 8)
        await friendCollection.deleteMany({})
        await friendCollection.insertMany([
            { firstName: "Peter", lastName: "Pan", email: "pp@b.dk", password: hashedPW, role: "user" },
            { firstName: "Donald", lastName: "Duck", email: "dd@b.dk", password: hashedPW, role: "user" },
            { firstName: "Ad", lastName: "Admin", email: "aa@a.dk", password: hashedPW, role: "admin" },
        ])
    })


    describe("While attempting to get all users", function () {
        it("It should get three users when authenticated", async () => {
            const response = await request
                .get('/api/friends/all')
                .auth("pp@b.dk", "secret")
            expect(response.status).to.equal(200)
            expect(response.body.length).to.equal(3)
        })

        it("It should get a 401 when NOT authenticated", async () => {
            const response = await request.get('/api/friends/all')
            expect(response.status).to.be.equal(401);
        })
    })


    describe("While attempting to add a user", function () {
        it("It should Add the user Jan Olsen", async () => {
            const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret" }
            const response = await request.post('/api/friends').send(newFriend)
            expect(response.status).to.equal(200)
            expect(response.body.id).to.be.not.null
        })

        it("It should fail to Add user due to wrong password length", async () => {
            const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "x" }
            const response = await request.post('/api/friends').send(newFriend)
            expect(response.status).to.equal(400)
        })
    })


    describe("While logged in as a user", function () {
        it("It should return the logged in user", async () => {
            const response = await request
                .get('/api/friends/me')
                .auth("pp@b.dk", "secret")
            expect(response.body.firstName).to.equal("Peter");
        })

        it("It should edit the logged in user", async () => {
            const edited = { firstName: "Kaptajn", lastName: "Klo", email: "pp@b.dk", password: "secret" };
            const response = await request
                .put('/api/friends/edit')
                .send(edited)
                .auth("pp@b.dk", "secret")
            expect(response.body.firstName).to.equal("Kaptajn");
        })
    })


    describe("While verifying the get any user, given a userId (email)", function () {
        it("It should allow an admin user to find Donald Duck", async () => {
            const search = "dd@b.dk"
            const response = await request
                .get('/api/friends/' + search)
                .auth("aa@a.dk", "secret")
            expect(response.body.firstName).to.equal("Donald");
        })

        it("It should not, allow admin-users to find a non-existing user", async () => {
            const search = "dd@b.dk"
            const response = await request
                .get('/api/friends/' + search)
                .auth("does_not@exist.com", "secret")
            expect(response.body).to.be.empty;
        })

        it("It should not let a non-admin user find Donald Duck", async () => {
            const search = "dd@b.dk"
            const response = await request
                .get('/api/friends/' + search)
                .auth("pp@b.dk", "secret")
            expect(response.status).to.equal(200);
        })
    })


    describe("While verifying the 'edit any user', given a userId (email)", function () {
        it("It should allow an admin-user to edit Peter Pan", async () => {
            const reqBody = { firstName: "Kaptajn", lastName: "Klo", email: "pp@b.dk", password: "secret" };
            const search = "pp@b.dk";
            const response = await request
                .put('/api/friends/' + search)
                .send(reqBody)
                .auth("aa@a.dk", "secret")
            expect(response.body.firstName).to.equal("Kaptajn");
        })

        it("It should NOT allow a non-admin user to edit Peter Pan", async () => {
            const reqBody = { firstName: "Kaptajn", lastName: "Klo", email: "pp@b.dk", password: "secret" };
            const search = "pp@b.dk";
            const response = await request
                .put('/api/friends/' + search)
                .send(reqBody)
                .auth("dd@b.dk", "secret")
            expect(response.status).to.equal(200);
        })
    })


    describe("While verifying the delete any user, given a userId (email)", function () {
        it("It should allow an admin user to delete Donald Duck", async () => {
            const search = "dd@b.dk";
            const response = await request
                .delete('/api/friends/' + search)
                .auth("aa@a.dk", "secret")
            expect(response.body).to.equal("User deleted");
        })

        it("It should NOT allow a non-admin user to delete Donald Duck", async () => {
            const search = "dd@b.dk";
            const response = await request
                .delete('/api/friends/' + search)
            expect(response.status).to.equal(401);
        })
    })
})