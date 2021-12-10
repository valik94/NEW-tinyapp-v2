const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID, 'these ids should be equal');
  });
  it('should return an undefined for user', function() {
    const user = getUserByEmail(testUsers, "newmail@email.com")
    assert.isUndefined(user, 'no user is defined');
  });
});