const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //set view engine to EJS
const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
const getUserByEmail = function (users, userEmail){
  for (let user in users){
    if (users[user].email === userEmail){
      return users[user];
    }
  }
  return null;
};

const urlsForUser = function (userid, urlDatabase) {
  const newObjectDatabase ={};
  for (let obj in urlDatabase){
    console.log("object in urldDatabase", urlDatabase)
    if(urlDatabase[obj].userID === userid){
      newObjectDatabase[obj] = urlDatabase[obj];
    }
  }
  return newObjectDatabase;
}


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
  const userId = req.cookies.user_id;
  console.log("USER ID IS: ", userId);
  console.log("URLSDATABASE: ", urlDatabase);
  if (userId){
    const urlUserObject = urlsForUser(userId, urlDatabase)
    const templateVars = { 
      urls: urlUserObject,
      user: users[req.cookies.user_id] //req.cookies.user_id fetches the cookie which is labelled user_id
    };
    console.log('this is req cookies',req.cookies.user_id);
    console.log(templateVars);
    return res.render("urls_index", templateVars);
  }
res.send("user is not logged in please login!")
//res.redirect('/login')

});
//hello page
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!'};
  res.render("hello_world", templateVars);
});
//get request to display/render /urls/new page
app.get("/urls/new", (req, res) => {
  const userwebid = req.cookies.user_id
  const userDBid = users[userwebid]
  const templateVars = {user: userDBid}
  if (users[userwebid]){
    res.render("urls_new",templateVars )
  }
  else{
    res.redirect('/login');
  }
});
// get request to display /urls/shortURL page
app.get("/urls/:shortURL", (req, res) =>{
  const userId = req.cookies.user_id;
  console.log("USER ID IS: ", userId);
  const shorturl = req.params.shortURL;
  if (userId && urlDatabase[shorturl].userID === userId){
  const longurl = urlDatabase[shorturl].longURL;
  const templateVars = { shortURL: shorturl, longURL: longurl,user: users[req.cookies.user_id] }
  res.render('urls_show',templateVars)
  }
  else{
    res.send("You are not allowed to access this page.")
  }
})

//post request to update urlDatabase and redirect us to the shorturl created
app.post("/urls", (req, res) => {
    const userId = req.cookies.user_id;
    const shorturl = generateRandomString();
    const longurl = req.body.longURL;
    urlDatabase[shorturl] = {longURL: longurl, userID: userId}
    console.log(req.body);  // Log the POST 
  res.redirect(`/urls/${shorturl}`);    // Respond with 'redirect'

});
//get request to display on URL bar the /u/shortURL (generated) and if pressed to redirect to longurl stored (i.e. http://www.google.com)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//REGISTER ROUTE 
app.get("/register" , (req, res ) =>{
  const email = req.body.email;
  const password = req.body.password;
  const user = users[req.cookies.user_id]
  let templateVars = {email: email, password: password, user: user, urls: urlDatabase }
  res.render('register', templateVars)
})

//LOGIN GET ROUTE Keep it simple - tell me who you are
app.get('/login', (req, res) =>{
  const user = users[req.cookies.user_id]
  let templateVars = {user}
    res.render('login', templateVars) 
})


//deleting line in /urls table
app.post("/urls/:shortURL/delete", (req,res) =>{
  const shortUrl = req.params.shortURL;
  const userId = req.cookies.user_id;
  if (userId && urlDatabase[shorturl].userID === userId){
  delete urlDatabase[shortUrl];
  return res.redirect("/urls");
  }
  res.status(401).send("This user is not allowed to delete this.")
})

//update New longurl in body
app.post("/urls/:shortURL", (req,res) =>{
  const userId = req.cookies.user_id;
  const shortUrl = req.params.shortURL;
  if (userId && urlDatabase[shorturl].userID === userId){
  const longUrl =req.body.updatedLongURL;
  urlDatabase[shortUrl].longURL = longUrl;
  return res.redirect("/urls");
  }
  res.status(401).send("Not allowed to access this shortURL.")
})

//Login route using (old: username), now user and cookie
app.post("/login", (req, res)=>{
  // const user  = req.cookies.user_id;
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFound = getUserByEmail(users, userEmail);
  //res.send("ok");

  if (!userFound) { //no user found
    return res.status(403).send("no user was found")
  }
  if (userPassword !== userFound.password){ //if email found and password does not match return 403 status code
    return res.status(403).send("email or password is incorrect")
    
  }
    //let templateVars = {email: userEmail, password: userPassword, user: user}
    res.cookie("user_id", userFound.id) //res.cookie(name, value [, options])
    res.redirect("/urls");
})

//Logout get route
app.post("/logout", (req, res) =>{
  console.log('logged out: ',req.cookies.user_id)
  const user = req.cookies.user_id;
  res.clearCookie("user_id", user);
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
console.log(users)
res.cookie("user_id", userID)
//let templateVar = {user: userValue}
res.redirect("/urls");
})

