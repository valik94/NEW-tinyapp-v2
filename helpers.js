///HELPER FUNCTIONS SECTION
//Random userID Generator
function generateRandomString() {
  let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  for (let i = 0; i < 6; i++) { //optimized
    string += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return string;
}

//CHECK IF USER IS REGISTERED

const registerUser = function registerUser(users, userEmail) {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return true;
    }
  }
  return false;
};

const getUserByEmail = function(users, userEmail) {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return users[user];
    }
  }
  return undefined;
};

const urlsForUser = function(userid, urlDatabase) {
  const newObjectDatabase = {};
  for (let obj in urlDatabase) {
    console.log("object in urldDatabase", urlDatabase);
    if (urlDatabase[obj].userID === userid) {
      newObjectDatabase[obj] = urlDatabase[obj];
    }
  }
  return newObjectDatabase;
};

module.exports = { generateRandomString, registerUser, getUserByEmail, urlsForUser }