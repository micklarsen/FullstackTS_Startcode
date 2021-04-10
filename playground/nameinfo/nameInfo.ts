import express from "express"
import fetch from 'node-fetch'
const app = express();


app.get("/nameinfo/:name", async (req, res) => {
    const name = req.params.name
    const promises = [
        fetch(`https://api.genderize.io?name=${name}`).then(r => r.json()),
        fetch(`https://api.nationalize.io?name=${name}`).then(r => r.json()),
        fetch(`https://api.agify.io?name=${name}`).then(r => r.json()),
    ]
    const result = await Promise.all(promises)
    const response = { country: result[1].country[0].country_id, gender: result[0].gender, age: result[2].age }
    res.json(response)
})


export default app;

app.listen(4444, () => console.log("server started on port 4444"))