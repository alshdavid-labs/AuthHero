var auth = require('./auth.js');
var pg = require('pg');
var conString = "postgres://postgres:password@localhost:5432/test";

module.exports = {
    loginAccount: function(data)
    {
        loginAccount()
    },
    accountRegistartion: function(data)
    {
        accountRegistartion(data)
    }
}


function loginAccount(){     
    pg.connect(conString, function(err, client, done){        
        client.query("SELECT * FROM userAccounts", function(err, result){
            console.log(result.rows);
        })
    });
};

function accountRegistartion(data){ 
      
    pg.connect(conString, function(err, client, done){        
        client.query("insert into useraccounts(username, password) values ($1, $2) returning id;", [data.username, data.password], function(err, result){
            auth.userID(result.rows[0].id);
        })
    });
};



