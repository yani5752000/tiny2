const express = require("express");
const cookieParser = require("cookie-parser");
const PORT = 8080;
const app = express();
app.use(cookieParser());
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
    const templateVars = {urls: urlDatabase, username: req.cookies.username};
    res.render("urls_index.ejs", templateVars);
})

app.get("/urls/new", (req, res) => {
    const templateVars = {username: req.cookies.username};
    res.render("urls_new.ejs", templateVars);
});

app.post("/urls", (req, res) => {
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = req.body.longURL;
    res.redirect(`/urls/${shortUrl}`);
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { 
        id: req.params.id, 
        longURL: urlDatabase[req.params.id],
        username: req.cookies.username
     };
    res.render("urls_show.ejs", templateVars);
});

app.get("/u/:id", (req, res) => {
    res.redirect(urlDatabase[req.params.id]);
})

app.post("/delete/:id", (req,res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
})

app.get("/edit/:id", (req, res) => {
    res.render("edit.ejs", 
    {shortUrl: req.params.id, username: req.cookies.username});
})

app.post("/edit/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body.newLongUrl;
    res.redirect("/urls");
})

app.post("/login", (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect("/urls")
})

app.post("/logout", (req, res) => {
    res.clearCookie("username");
    res.redirect("/urls");
})

app.get("/register", (req, res) => {
    res.render("register.ejs");
})
