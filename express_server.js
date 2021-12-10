const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //set view engine to EJS
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const {generateRandomString, registerUser, getUserByEmail, urlsForUser} = require('./helpers');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_id',
  keys: ['publickey','privatekey']
}));

//URL DATABASE -- NEW
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  sgq3y6:{
    longURL: 'http://www.youtube.com',
    userID: 'sgq3y6'
  }
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
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/* GET ROUTES */

//home hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

//hello page
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});

//display all urls in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//urls page renders urls_Index table and passes urldatabase and users database to render
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const urlUserObject = urlsForUser(userId, urlDatabase);
    const templateVars = {
      urls: urlUserObject,
      user: users[req.session.user_id] //req.cookies.user_id fetches the cookie which is labelled user_id
    };
    return res.render("urls_index", templateVars);
  }
  res.redirect("/login");

});

//get request to display/render /urls/new page
app.get("/urls/new", (req, res) => {
  const userwebid = req.session.user_id;
  const userDBid = users[userwebid];
  const templateVars = {user: userDBid};
  if (users[userwebid]) {
    res.render("urls_new",templateVars);
  } else {
    res.redirect('/login');
  }
});
// get request to display /urls/shortURL page
app.get("/urls/:shortURL", (req, res) =>{
  const userId = req.session.user_id;
  const shorturl = req.params.shortURL;
  if (userId && urlDatabase[shorturl].userID === userId) {
    const longurl = urlDatabase[shorturl].longURL;
    const templateVars = { shortURL: shorturl, longURL: longurl,user: users[req.session.user_id] };
    res.render('urls_show',templateVars);
  } else {
    res.send("You are not allowed to access this page.");
  }
});

//get request to display on URL bar the /u/shortURL (generated) and if pressed to redirect to longurl stored (i.e. http://www.google.com)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//REGISTER GET ROUTE renders the register page
app.get("/register" , (req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  const user = users[req.session.user_id];
  let templateVars = {email: email, password: password, user: user, urls: urlDatabase };
  res.render('register', templateVars);
});

//LOGIN GET ROUTE Keep it simple - tell me who you are
app.get('/login', (req, res) =>{
  const user = users[req.session.user_id];
  let templateVars = {user};
  res.render('login', templateVars);
});


/* POST ROUTES */

//post request to update urlDatabase and redirect us to the shorturl created
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const shorturl = generateRandomString();
  const longurl = req.body.longURL;
  urlDatabase[shorturl] = {longURL: longurl, userID: userId};
  res.redirect(`/urls/${shorturl}`);    // Respond with 'redirect' to shorturl updating page

});

//POST Route to deleting line in /urls table
app.post("/urls/:shortURL/delete", (req,res) =>{
  const shortUrl = req.params.shortURL;
  const userId = req.session.user_id;
  if (userId && urlDatabase[shortUrl].userID === userId) {
    delete urlDatabase[shortUrl];
    return res.redirect("/urls");
  }
  res.status(401).send("This user is not allowed to delete this.");
});

//POST ROUTE FOR shortURL to update New longurl in body
app.post("/urls/:shortURL", (req,res) =>{
  const userId = req.session.user_id;
  const shortUrl = req.params.shortURL;
  if (userId && urlDatabase[shortUrl].userID === userId) {
    const longUrl = req.body.updatedLongURL;
    urlDatabase[shortUrl].longURL = longUrl;
    return res.redirect("/urls");
  }
  res.status(401).send("Not allowed to access this shortURL.");
});

//Login route using (old: username), now user and cookie
app.post("/login", (req, res)=>{
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFound = getUserByEmail(users, userEmail);

  if (!userFound) { //no user found
    return res.status(403).send("no user was found");
  }
  const passwordCheck = bcrypt.compareSync(userPassword, userFound.password);
  if (!passwordCheck) { //if email found and password does not match return 403 status code
    return res.status(403).send("email or password is incorrect");
    
  }
  //let templateVars = {email: userEmail, password: userPassword, user: user}
  req.session.user_id = userFound.id;
  res.redirect("/urls");
});

//POST ROUTE Logout to nullify session and redirect to /urls page
app.post("/logout", (req, res) =>{
  const user = req.session.user_id;
  req.session = null;
  res.redirect("/urls");
});

//REGISTER post route to check if user registered via email/password and encrypt password in storage
app.post('/register', (req, res) =>{
  let userID = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  let userValue = { id: userID, email: userEmail, password: hashedPassword};

  if (userEmail === "" || userPassword === "") { //initial check if username and password is empty
    res.status(400);
    return res.send("User's password and/or email is missing");
  }
 
  if (registerUser(users, userEmail)) { //check if user is already registered
    res.status(400);
    return res.send("Email is already registered to a user.");
  }
  users[userID] = userValue;
  req.session.user_id = userID;
  res.redirect("/urls");
});

