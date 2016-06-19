var auth = require('./modules/auth.js'); var auth = auth;
var express = require('express'); var app = express();
var bodyParser = require('body-parser'); app.use(bodyParser.json());
var PORT = 500;

app.get('/', function(req, res){
      res.status(200).sendFile(__dirname + '/html/login.html');    
});

app.post('/login', function(req, res)
{
    auth.login(req.body);
    res.status(200).send(req.body);
}); 

app.post('/register', function(req, res)
{
    auth.register(req.body);
    res.status(200).send(req.body);
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
