const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //set view engine to EJS
const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//USERS DATABASE
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
///FUNCTIONS SECTION
///
//Random userID Generator
function generateRandomString() {
  let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  for ( let i = 0; i < 6; i++ ) { //optimized
      string += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return string;
}
//CHECK IF USER IS REGISTERED
const registerUser = function registerUser(users, userEmail){
  for (let user in users){
    if (users[user].email === userEmail){
      return true;
    }
  }
  return false;
};


//home hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//display all urls in JSON format
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
//urls page renders urls_Index table and passes urldatabase and users database to render
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id] //req.cookies.user_id fetches the cookie which is labelled user_id
    //users[req.cookies.user_id] takes the value of user[req.cookies.user_id] from the users database
  };
  console.log('this is req cookies',req.cookies.user_id);
  console.log(templateVars);
  res.render("urls_index", templateVars);
});
//hello page
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});
//get request to display/render /urls/new page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]}
  res.render("urls_new",templateVars );
});
// get request to display /urls/shortURL page
app.get("/urls/:shortURL", (req, res) =>{
  const shorturl = req.params.shortURL;
  const longurl = urlDatabase[shorturl];
  const templateVars = {
    shortURL: shorturl,
    longURL: longurl,
    user: users[req.cookies.user_id]
  }
  res.render('urls_show',templateVars)
})
//post request to update urlDatabase and redirect us to the shorturl created
app.post("/urls", (req, res) => {
  const shorturl = generateRandomString();
  const longurl = req.body.longURL;
  urlDatabase[shorturl] = longurl;
 
  console.log(req.body);  // Log the POST 
  res.redirect(`/urls/${shorturl}`);    // Respond with 'redirect'
});
//get request to display on URL bar the /u/shortURL (generated) and if pressed to redirect to longurl stored (i.e. http://www.google.com)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//REGISTER ROUTE 
app.get("/register" , (req, res ) =>{
  const email = req.body.email;
  const password = req.body.password;
  const user = users[req.cookies.user_id]
  let templateVars = {email: email, password: password, user: user, urls: urlDatabase }
  res.render('urls_index', templateVars)
})

//deleting line in /urls table
app.post("/urls/:shortURL/delete", (req,res) =>{
  const shortUrl = req.params.shortURL;
  // const longurl = req.body.longURL;
  // urlDatabase[shorturl] = longurl;
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
})

//update New longurl in body
app.post("/urls/:shortURL", (req,res) =>{
  const shortUrl = req.params.shortURL;
  const longUrl =req.body.updatedLongURL;
  // const longurl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;
  res.redirect("/urls");
})
//Login route using (old: username), now user and cookie
app.post("/login", (req, res)=>{
  const user  = req.cookies.user_id;
  res.cookie("user_id", user ) //res.cookie(name, value [, options])
  res.redirect("/urls");
})
//Login get route
app.post("/logout", (req, res) =>{
  console.log('logged out: ',req.cookies.user_id)
  const user = req.cookies.user_id;
  res.clearCookie("user", user);
  res.redirect("/urls");
})

//REGISTER post route
app.post('/register', (req, res) =>{
let userID = generateRandomString()
let userEmail = req.body.email;
let userPassword = req.body.password;
let userValue = { id: userID, email: userEmail, password: userPassword}

if (userEmail === "" || userPassword === ""){
  res.status(400)
  return res.send("User's password and/or email is missing")
}
console.log('DATABASE user email is!!! ', users[userID.email])
console.log('userEMAIL INPUT user email is!!! ', userEmail)
if (registerUser(users, userEmail)){
  res.status(400)
  return res.send("Email is already registered to a user.")
}
users[userID] = userValue;
res.cookie("user_id", userID)
//let templateVar = {user: userValue}
res.redirect("/urls");
})

