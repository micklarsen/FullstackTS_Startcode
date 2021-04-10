import express from "express"
const app = express();
import fetch from "node-fetch";


app.get("/whattodo", async (req, res) =>{
    const whatToDo = await fetch("https://www.boredapi.com/api/activity").then(r => r.json())
    res.json(whatToDo)
});


export default app;