const express = require("express");
const PORT = 8080;
const app = express();
app.set("view engin", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
})

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hi this is tiny2");
})

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
})

app.get("/helloWorld", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.get("/urls", (req, res) => {
    const templateVars = {urls: urlDatabase};
    res.render("urls_index.ejs", templateVars);
})

app.get("/urls/new", (req, res) => {
    res.render("urls_new.ejs");
});

app.post("/urls", (req, res) => {
    console.log(req.body); // Log the POST request body to the console
    res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show.ejs", templateVars);
});

