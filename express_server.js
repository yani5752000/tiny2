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

const users = {
    userRandomID: {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    },
    user2RandomID: {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk",
    },
  };

  const getUserByEmail = (email) => {
    for (let id in users) {
        if(users[id].email == email) {
            return users[id];
        }
    }
    return null;
  }

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
    if(!req.cookies.user_id) {
        return res.send("<p>You are not logged in.</p></br><a href='/login'>Please login or register here</a>");
    }
    const templateVars = {urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id]};
    console.log("/urls req.cookies.user_id: ", req.cookies.user_id);
    res.render("urls_index.ejs", templateVars);
})

app.get("/urls/new", (req, res) => {
    if(!req.cookies.user_id) {
        return res.redirect("/login");
    }
    const templateVars = {user: users[req.cookies.user_id]};
    res.render("urls_new.ejs", templateVars);
});

app.post("/urls", (req, res) => {
    if(!req.cookies.user_id) {
        return res.send("You can't add a new url because you are not logged in.");
    }
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {longUrl: req.body.longURL, userId: req.cookies.user_id};
    console.log("users: ", users);
    console.log("urlDatabase: ", urlDatabase);
    res.redirect(`/urls/${shortUrl}`);
});

app.get("/urls/:id", (req, res) => {
    if (!req.cookies.user_id) {
        return res.send("<p>You are not logged in.</p></br><a href='/login'>Please login or register here</a>");
    }
    if (urlDatabase[req.params.id].userId != req.cookies.user_id) {
        return res.send("Sorry! This url does not belong to you");
    }
    const templateVars = { 
        id: req.params.id, 
        longURL: urlDatabase[req.params.id].longUrl,
        user: users[req.cookies.user_id]
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
    console.log("req.cookies: ", req.cookies);
    console.log("/delete req.cookies.user_id: ", req.cookies.user_id);
    console.log("urlDatabase: ", urlDatabase);
    if(!req.cookies.user_id) {
        return res.send("Sorry! To delete, you must be logged in.")
    }
    if (urlDatabase[req.params.id].userId != req.cookies.user_id){
        return res.send("Sorry! To delete, the short url must be yours.")
    }
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
})

app.get("/edit/:id", (req, res) => {
    res.render("edit.ejs", 
    {shortUrl: req.params.id, user: users[req.cookies.user_id]});
})

app.post("/edit/:id", (req, res) => {
    if (!urlDatabase[req.params.id]) {
        return res.send("Sorry! The url does not exist.")
    }
    if(!req.cookies.user_id) {
        return res.send("Sorry! To edit, you must be logged in.")
    }
    if (urlDatabase[req.params.id].userId != req.cookies.user_id){
        return res.send("Sorry! To edit, the short url must be yours.")
    }
    urlDatabase[req.params.id].longURL = req.body.newLongUrl;
    res.redirect("/urls");
})

app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/login");
})

app.get("/register", (req, res) => {
    if(req.cookies.user_id) {
        return res.redirect("/urls");
    }
    const templateVars = {user: users[req.cookies.user_id]};
    res.render("register.ejs", templateVars);
})

app.post("/register", (req, res) => {
    console.log("first users: ", users);
    if (req.body.email == "" || req.body.password == "") {
        return res.send("400 Bad Request- email or password missing");
    }
    if(getUserByEmail(req.body.email)) {
        return res.send("400 Bad Request, this email is already registered");
    }
    const userId = generateRandomString();
    users[userId] = {
        id: userId,
        email: req.body.email,
        password: req.body.password
    }
    console.log("users: ", users);
    res.cookie("user_id", userId);
    res.redirect("/urls");
})

app.get("/login", (req, res) => {
    if(req.cookies.user_id) {
        return res.redirect("/urls");
    }
    const templateVars = {user: users[req.cookies.user_id]};
    res.render("login.ejs", templateVars);
})

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if(!getUserByEmail(email)) {
        return res.send("403 Forbidden. No such email has been registered");
    }
    if(getUserByEmail(email).password != password) {
        return res.send("403 Forbidden. Passwords do not match");
    }
    console.log("id: ", getUserByEmail(email).id);
    res.cookie("user_id", getUserByEmail(email).id);
    res.redirect("/urls");
})
