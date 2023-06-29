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
    console.log("cookies: ", req.cookies);
    console.log("username is ", req.cookies.username);
})

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
})

app.get("/helloWorld", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.get("/urls", (req, res) => {
    console.log("????username is ", req.cookies.username);
    let value;
    if(req.cookies.username) {
        value = req.cookies.username;
    } else {
        value = null;
    }
    const templateVars = {urls: urlDatabase, username: req.cookies.username};
    res.render("urls_index.ejs", templateVars);
})

app.get("/urls/new", (req, res) => {
    res.render("urls_new.ejs");
});

app.post("/urls", (req, res) => {
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = req.body.longURL;
    res.redirect(`/urls/${shortUrl}`);
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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
    {shortUrl: req.params.id});
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
    console.log("<<<in post/logout");
    res.clearCookie("username");
    res.redirect("/urls");
})
