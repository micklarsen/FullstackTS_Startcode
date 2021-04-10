import app from "./nameInfo";
import chai from "chai";
const expect = chai.expect;
const request = require("supertest")(app);
import nock from "nock";


describe("While attempting to get Mick", async function () {
    beforeEach(function () {
        nock.cleanAll()
    })


    it("Should provide country 'IE'", async function () {
        nock('https://api.nationalize.io')
            .get("/?name=mick")
            .reply(200, {
                "name": "mick",
                "country": [
                    {
                        "country_id": "IE",
                        "probability": 0.2916296388847609
                    },
                    {
                        "country_id": "GB",
                        "probability": 0.16370394848431505
                    },
                    {
                        "country_id": "AU",
                        "probability": 0.10057815204728375
                    }
                ]
            })

        const result = await request.get("/nameinfo/mick")
        expect(result.body.country).to.be.equal("IE");

    })


    it("Should provide gender 'male'", async function () {
        nock('https://api.genderize.io')
            .get("/?name=mick")
            .reply(200, {
                "name": "mick",
                "gender": "male",
                "probability": 0.98,
                "count": 12059
            })

        const result = await request.get("/nameinfo/mick")
        expect(result.body.gender).to.be.equal("male");

    })


    it("Should provide age '59'", async function () {
        nock('https://api.agify.io')
            .get("/?name=mick")
            .reply(200, {
                "name": "mick",
                "age": 58,
                "count": 12206
            })

        const result = await request.get("/nameinfo/mick")
        expect(result.body.age).to.be.equal(58);

    })
})