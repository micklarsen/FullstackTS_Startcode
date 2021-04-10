const expect = require("chai").expect;
import app from "./whattodo";
const request = require("supertest")(app);
import nock from "nock";

describe("What to do endpoint", function () {
    before(() => {
        nock('https://www.boredapi.com')
            .get("/api/activity")
            .reply(200, {
                "activity": "Write a song",
                "type": "music",
                "participants": 1,
                "price": 0,
                "link": "",
                "key": "5188388",
                "accessibility": 0
            })
    })

    it("Should eventually provide 'Write a song'", async function () {
        const response = await request.get("/whattodo")
        expect(response.body.activity).to.be.equal("Write a song");
    })
})