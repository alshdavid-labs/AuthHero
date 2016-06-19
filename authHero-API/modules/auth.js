var db = require('./db_commands.js');
var uuid = require('node-uuid');
var pg = require('pg');
var conString = "postgres://postgres:password@localhost:5432/authhero";
var registeredID
var client = new pg.Client(conString);
client.connect();

// \password postgres
//CREATE DATABASE authhero;
//CREATE SCHEMA authhero;
// \c authhero
//CREATE TABLE useraccounts (ID SERIAL PRIMARY KEY, username VARCHAR(30), password VARCHAR(30));
//SELECT * FROM useraccounts;


module.exports = {  
  register: function (data) 
  {
     return accountRegistartion(data);
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


function checkAccount(data){
    
    var isUnique = false
    client.query("select distinct on (username) username from useraccounts", function(err, result){

        var DBitem = result.rows
        var DATAusername = JSON.stringify(data.username)
        
        var userNamePackage = result.rows
        for (i = 0; i < userNamePackage.length; i++){
            DBitem = JSON.stringify(userNamePackage[i].username);

            if (DATAusername === DBitem){
                console.log('problem')
                isUnique = false
                return
            }
        }
        isUnique = true
    });

    console.log(isUnique)
    return isUnique
    
    
    
  }

  function registerAccount(data){
      console.log(data)
       return client.query("insert into useraccounts(username, password) values ($1, $2) returning id;", [data.username, data.password], function(err, result){});
  }

function accountRegistartion(data){
    var isUnique
    var registerPromise = new Promise(
        function(resolve, reject) { 
            resolve(
                client.query("select distinct on (username) username from useraccounts", function(err, result){

                    var DBitem = result.rows
                    var DATAusername = JSON.stringify(data.username)
                    
                    var userNamePackage = result.rows
                    for (i = 0; i < userNamePackage.length; i++){
                        DBitem = JSON.stringify(userNamePackage[i].username);

                        if (DATAusername === DBitem){
                            return isUnique = false
                        }
                    }
                    isUnique = true
                })
            );
        }
    );

    registerPromise.then(
        function(){
             if (isUnique === true){
                 console.log('unique')
                 //registerAccount(data)
             } else {return 'not unique'}
        }    
    );
    //console.log(lol._result.rows[1])
    //return client.query("insert into useraccounts(username, password) values ($1, $2) returning id;", [data.username, data.password], function(err, result){}); 
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