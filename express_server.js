const express = require("express");
const PORT = 8080;
const app = express();

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
})

app.get("/", (req, res) => {
    res.send("Hi this is tiny2");
})