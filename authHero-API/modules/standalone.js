// Useage node app.js URL PORT
// eg. node app.js http://localhost.com 501

//---IMPORTS----
var uuid = require('node-uuid');
var schedule = require('node-schedule');
//Database Setup
var pg = require('pg');
var conString = "postgres://postgres:password@localhost:5432/authhero";
var client = new pg.Client(conString); client.connect();
//Express Setup
var express = require('express'); 
var app = express();
var exphbs  = require('express-handlebars');
app.engine('handlebars', 
            exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var bodyParser = require('body-parser'); app.use(bodyParser.json());
if (process.argv[3]){var PORT = process.argv[3];} else {var PORT = 501}
if (process.argv[2]){var URL = process.argv[2];} else {var URL = 'http://localhost'}
serviceLocation = String(URL) + ':' + String(PORT) + '/' ;

//--------------

//---DB-Setup---
//
// sudo -u postgres psql postgres
// \password postgres
//CREATE DATABASE authhero;
//CREATE SCHEMA authhero;
// \c authhero
//CREATE TABLE useraccounts (ID SERIAL PRIMARY KEY, UID VARCHAR(40), username VARCHAR(30), password VARCHAR(30));
//CREATE TABLE authtokens (ID SERIAL PRIMARY KEY, userID INT, auth VARCHAR(40), expire INT);
//SELECT * FROM useraccounts;
//-------------

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

//Serve basic page to test endpoints
app.get('/', function(req, res){
    //pass the URL entered as the CMD argument
    res.render('main', { url : serviceLocation})
});

//Login endpoint
app.post('/login', function(req, res)
{
    var POSTbody = req.body

    function loginUser(data, passwordTester, responder){
        client.query("SELECT * FROM useraccounts WHERE username=$1", [data.username], function(err, result){
            if (result.rowCount === 0) {
                response = {'message':'account does not exsist'}
                responder('500', response)
            } else {
                passwordTester(data, result.rows[0], responder)             
            }
        });
    };
    
    function passwordTester(data, DBdata , responder){
        if (data.password === DBdata.password){
            //correct password
            var authToken = uuid.v4()
             pg.connect(conString, function(err, client, done){        
                client.query("insert into authtokens(userid, auth, expire) values ($1, $2, $3)", [DBdata.id, authToken, 30], function(err, result){})
            });
            response = {
                'message' : 'logged in',
                'ID' : String(DBdata.uid),    
                'X-AUTH-TOKEN' : authToken
            }                
            responder('200', response)
        } else {
            //incorrect password
            response = {'message' : 'incorrect password'}                
            responder('500', response)

        }
        console.log(data)
        
    }

    function POSTresponder(status, response){
        res.status(status).send(response)
    }
    
    loginUser(POSTbody, passwordTester, POSTresponder);   
}); 



app.post('/register', function(req, res)
{    
    var POSTbody = req.body

    function checkAccount(data, createAccount, responder){
        if (data.username.length > 0 && data.password.length > 0){
            client.query("SELECT * FROM useraccounts WHERE username=$1", [data.username], function(err, result){
                if (result.rowCount === 0) { 
                    //name is unique, create account
                    createAccount(data, responder)
                } else {
                    //name already taken               
                    response = {'message' : 'username already taken'}
                    var status = "500"
                    responder(status, response)                          
                }
            });
        } else { 
            response = {'message' : 'invalid account details'}; 
            responder('500', response)
        } 
    };

    function createAccount(data, responder){
        pg.connect(conString, function(err, client, done){        
            client.query("insert into useraccounts(uid, username, password) values ($1, $2, $3) returning uid;", [uuid.v4(), data.username, data.password], function(err, result){
                var DBresponse = result.rows[0].uid;
                var response = {
                    'message' : 'user created',
                    'ID' : String(DBresponse)
                }
                var status = "200"
                responder(status, response)
            })
        });
    }    

    function responder(status, response){
        res.status(status).send(response)
    }
    
    checkAccount(POSTbody, createAccount, responder);
});   

app.post('/useauth', function(req, res)
{
    var POSTbody = req.body
    function checkAuth(data, responder){      
        client.query("SELECT * FROM authtokens WHERE auth=$1", [data.auth], function(err, result){
            if (result.rowCount === 0) { 
                response = {'message' : 'invalid token'}
                var status = "500"
                responder(status, response)  
            } else {     
                var userID = result.rows[0].userid
                client.query("UPDATE authtokens SET expire=$1 WHERE userid=$2", [30, userID], function(err, result){});        
                response = {'message' : 'valid token'}
                var status = "200"
                responder(status, response)                          
            }
        });        
    };

    function responder(status, response){
        res.status(status).send(response)
    }

    checkAuth(POSTbody, responder)
}); 

//go through database at midnight and remove auth tokens that have expired
var chronos_the_father_of_time = schedule.scheduleJob({hour: 00, minute: 00}, function(){
    scythe();
});

function scythe(){
    client.query("SELECT * FROM authtokens", function(err, result){
       var authList = result.rows
       for (i = 0; i < authList.length; i++) { 
           var dbCursor = authList[i].id
           var expirationDate = authList[i].expire - 1
           if (expirationDate < 0){
               client.query("DELETE FROM authtokens WHERE id=$1", [dbCursor], function(err, result){});
           } else {
               client.query("UPDATE authtokens SET expire=$1 WHERE id=$2", [expirationDate, dbCursor], function(err, result){});
           }
       }
    });
}

var serve = function(){
    app.listen(PORT);
    console.log('serving @ ' + serviceLocation);
}

serve();
