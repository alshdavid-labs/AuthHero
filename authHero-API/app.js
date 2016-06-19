var auth = require('./modules/auth.js'); 
var express = require('express'); var app = express();
var bodyParser = require('body-parser'); app.use(bodyParser.json());
var PORT = 501;

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', function(req, res){
      res.status(200).sendFile(__dirname + '/html/login.html');    
});

app.post('/login', function(req, res)
{
    var number1
    var number2

    var loginPromise = new Promise(
        function(resolve, reject) {
            resolve(number1 = promiseTest())
        }

    );

    loginPromise.then(
        function(){
            number2 = promiseAdd(number1)
            console.log(number2)
        }
    );
    
    // auth.login(req.body)
    // res.status(200).send(req.body)
    
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
