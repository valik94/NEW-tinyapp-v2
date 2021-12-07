const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //set view engine to EJS

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var string = '';
  for ( var i = 0; i < 6; i++ ) { //optimized
      string += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return string;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

// app.get("/hello", (req, res) => { //test hello get request
//   res.send("<html><body>Hello <b>World</b></body></html>\n"); //res.send HTML to display on page
// });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});
//get request to display/render /urls/new page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// get request to display /urls/shortURL page
app.get("/urls/:shortURL", (req, res) =>{
  const shorturl = req.params.shortURL;
  const longurl = urlDatabase[shorturl];
  const templateVars = {shortURL: shorturl, longURL: longurl}
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