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
    const templateVars = {urls: urlDatabase, user: users[req.cookies.user_id]};
    res.render("urls_index.ejs", templateVars);
})

app.get("/urls/new", (req, res) => {
    const templateVars = {user: users[req.cookies.user_id]};
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
        user: users[req.cookies.user_id]
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
    {shortUrl: req.params.id, user: users[req.cookies.user_id]});
})

app.post("/edit/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body.newLongUrl;
    res.redirect("/urls");
})

// app.post("/login", (req, res) => {
//     res.cookie("username", req.body.username);
//     res.redirect("/urls")
// })

app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/login");
})

app.get("/register", (req, res) => {
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
