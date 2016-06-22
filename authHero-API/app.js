var uuid = require('node-uuid');
var pg = require('pg');
var conString = "postgres://postgres:password@localhost:5432/authhero";
var client = new pg.Client(conString); client.connect();
var express = require('express'); var app = express();
var bodyParser = require('body-parser'); app.use(bodyParser.json());
var PORT = 501;

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', function(req, res){
      res.status(200).sendFile(__dirname + '/html/login.html');    
});

app.post('/login', function(req, res)
{
    var POSTbody = req.body
    var number1
    var number2

    function dbCall(data, funUnique){
        client.query("select distinct on (username) username from useraccounts", function(err, result){

            var DBitem = result.rows
            var DATAusername = JSON.stringify(data.username)
            
            var userNamePackage = result.rows
            for (i = 0; i < userNamePackage.length; i++){
                DBitem = JSON.stringify(userNamePackage[i].username);

                if (DATAusername === DBitem){
                    isUnique = false
                    break                    
                } else {isUnique = true}
            }
            
            funUnique(data, isUnique)
        });
    };

    function funTime(postShit, isUni){
        console.log(isUni)
        res.status(200).send(postShit)
        
    }

    
    
    dbCall(POSTbody, funTime);
    // auth.login(req.body)
    
}); 


function promiseTest(){
    return 500;
}

function promiseAdd(n1){
    return n1 + 10;
}



app.post('/register', function(req, res)
{    
    var POSTresponse
    var POSTbody = req.body

    var registerPromise = new Promise(
        function(resolve, reject) {
            resolve(POSTresponse = auth.register(POSTbody))
        }
    );

    registerPromise.then(
        function(){
            console.log(POSTresponse)
            majorResponseAlert = {
                'userID': JSON.stringify(POSTresponse._result.rows[0].id)
            }
            res.status(200).send(JSON.stringify(majorResponseAlert))
            console.log(majorResponseAlert)
        }
    );
});   

app.post('/validAuth', function(req, res)
{
    auth.validAuth(req.body);
    res.status(200).send(req.body);
}); 

var serve = function(){
    app.listen(PORT);
    console.log('on port: ' + PORT);
}

serve();
