var uuid = require('node-uuid');
var users = [];
var tokens = [];

module.exports = {  
  register: function (data) 
  {
     accountRegistartion(data);
  },    
  login: function (data) 
  {
     accountLogin(data);
  },
  validAuth: function (data) 
  {
     authValidityChecker(data);
  }
}

function accountRegistartion(data){
    var userID = 'userID'
    var idValue = users.length + 1
    console.log(data);
    users.push(data)
    data[userID] = idValue
    console.log(users)
}

function accountLogin(data){

  for (i = 0; i < users.length; i++) { 
      console.log(users[i].username);
      if (users[i].username === data.username){
        if (users[i].password === data.password){
          var generatedToken = uuid.v4();
          console.log(generatedToken);
          session = {
            'userID':'',
            'X-AUTH-TOKEN': generatedToken
          }
        } else {console.log('incorrect password')}
        return
      }
  }
  console.log('user does not exsist')
}

function authValidityChecker(data){
    console.log(data);
}