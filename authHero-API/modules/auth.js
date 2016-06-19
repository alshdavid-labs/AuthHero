var db = require('./db_commands.js');
var uuid = require('node-uuid');
var pg = require('pg');
var conString = "postgres://postgres:password@localhost:5432/test";
var registeredID

module.exports = {  
  register: function (data) 
  {
     console.log(accountRegistartion(data));
  },    
  login: function (data) 
  {
     accountLogin(data);
  },
  validAuth: function (data) 
  {
     authValidityChecker(data);
  },
  userID: function (data) 
  {
     userID(data);
  }
}


function userID(id){
       registeredID = id;
  }

function accountRegistartion(data){
    return pg.connect(conString, function(err, client, done){        
        client.query("insert into useraccounts(username, password) values ($1, $2) returning id;", [data.username, data.password], function(err, result){
            return result.rows[0].id;
        })
    });
};

function accountLogin(data){
  console.log('user does dasdasa not exsist')
}

function authValidityChecker(data){
    console.log(data);
}


function dbRegistartion(data){      
    return pg.connect(conString, function(err, client, done){        
        client.query("insert into useraccounts(username, password) values ($1, $2) returning id;", [data.username, data.password], function(err, result){
            return result.rows[0].id;
        })
    });
};