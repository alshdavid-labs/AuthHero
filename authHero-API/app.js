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
    auth.login(req.body)
    res.status(200).send(req.body)
    
}); 

app.post('/register', function(req, res)
{    
    res.status(200).send(returnValue, function(){
        returnValue = auth.register(req.body)
    })    
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
