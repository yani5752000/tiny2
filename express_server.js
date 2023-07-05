const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers");
const PORT = 8080;
const app = express();
app.use(cookieParser());
app.use(cookieSession({
    nsme: "session",
    keys: ["secret"],
    maxAge: 24 * 60 * 60 * 1000
}));
app.set("view engin", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
    // userRandomID: {
    //   id: "userRandomID",
    //   email: "user@example.com",
    //   password: "purple-monkey-dinosaur",
    // },
    // user2RandomID: {
    //   id: "user2RandomID",
    //   email: "user2@example.com",
    //   password: "dishwasher-funk",
    // },
  };

  const urlsForUser = (userId) => {
    const userUrls = {};
    for(const id in urlDatabase) {
        if (urlDatabase[id].userId == userId) {
            userUrls[id] = urlDatabase[id];
        }
    }
    return userUrls;
  }

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
    console.log("users: ", users);
    console.log("urlDatabase: ", urlDatabase);
    if(!req.session.user_id) {
        return res.send("<p>You are not logged in.</p></br><a href='/login'>Please login or register here</a>");
    }
    const templateVars = {urls: urlsForUser(req.session.user_id), user: users[req.session.user_id]};
    res.render("urls_index.ejs", templateVars);
})

app.get("/urls/new", (req, res) => {
    if(!req.session.user_id) {
        return res.redirect("/login");
    }
    const templateVars = {user: users[req.session.user_id]};
    res.render("urls_new.ejs", templateVars);
});

app.post("/urls", (req, res) => {
    if(!req.session.user_id) {
        return res.send("You can't add a new url because you are not logged in.");
    }
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {longUrl: req.body.longURL, userId: req.session.user_id};
    res.redirect(`/urls/${shortUrl}`);
});

app.get("/urls/:id", (req, res) => {
    if (!req.session.user_id) {
        return res.send("<p>You are not logged in.</p></br><a href='/login'>Please login or register here</a>");
    }
    if (urlDatabase[req.params.id].userId != req.session.user_id) {
        return res.send("Sorry! This url does not belong to you");
    }
    const templateVars = { 
        id: req.params.id, 
        longURL: urlDatabase[req.params.id].longUrl,
        user: users[req.session.user_id]
     };
    res.render("urls_show.ejs", templateVars);
});

app.get("/u/:id", (req, res) => {
    if(!urlDatabase[req.params.id]) {
        return res.send("This short url does not exist");
    }
    res.redirect(urlDatabase[req.params.id].longURL);
})

app.post("/delete/:id", (req,res) => {
    if (!urlDatabase[req.params.id]) {
        return res.send("Sorry! The url does not exist.")
    }
    if(!req.session.user_id) {
        return res.send("Sorry! To delete, you must be logged in.")
    }
    if (urlDatabase[req.params.id].userId != req.session.user_id){
        return res.send("Sorry! To delete, the short url must be yours.")
    }
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
})

app.get("/edit/:id", (req, res) => {
    res.render("edit.ejs", 
    {shortUrl: req.params.id, user: users[req.session.user_id]});
})

app.post("/edit/:id", (req, res) => {
    if (!urlDatabase[req.params.id]) {
        return res.send("Sorry! The url does not exist.")
    }
    if(!req.session.user_id) {
        return res.send("Sorry! To edit, you must be logged in.")
    }
    if (urlDatabase[req.params.id].userId != req.session.user_id){
        return res.send("Sorry! To edit, the short url must be yours.")
    }
    urlDatabase[req.params.id].longUrl = req.body.newLongUrl;
    res.redirect("/urls");
})

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
})

app.get("/register", (req, res) => {
    if(req.session.user_id) {
        return res.redirect("/urls");
    }
    const templateVars = {user: req.session.user_id};
    res.render("register.ejs", templateVars);
})

app.post("/register", (req, res) => {
    if (req.body.email == "" || req.body.password == "") {
        return res.send("400 Bad Request- email or password missing");
    }
    if(getUserByEmail(req.body.email, users)) {
        return res.send("400 Bad Request, this email is already registered");
    }
    const userId = generateRandomString();
    users[userId] = {
        id: userId,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    }
    req.session.user_id = userId;
    res.redirect("/urls");
})

app.get("/login", (req, res) => {
    if(req.session.user_id) {
        return res.redirect("/urls");
    }
    const templateVars = {user: req.session.user_id};
    res.render("login.ejs", templateVars);
})

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if(!getUserByEmail(email, users)) {
        return res.send("403 Forbidden. No such email has been registered");
    }
    if(!bcrypt.compareSync(password, getUserByEmail(email, users).password)) {
        return res.send("403 Forbidden. Passwords do not match");
    }
    req.session.user_id = getUserByEmail(email, users).id;
    res.redirect("/urls");
})
