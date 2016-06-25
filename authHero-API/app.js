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
//   -- set the password to 'password'
//CREATE DATABASE authhero;
//CREATE SCHEMA authhero;
// \c authhero
//CREATE TABLE projects (ID SERIAL PRIMARY KEY, UUID VARCHAR(40), projectname VARCHAR(100), tags VARCHAR(1000));
//CREATE TABLE permissions (ID SERIAL PRIMARY KEY, admin INT, project INT);
//CREATE TABLE useraccounts (ID SERIAL PRIMARY KEY, UUID VARCHAR(40), username VARCHAR(100), password VARCHAR(30), project INT, type VARCHAR(20), tags VARCHAR(1000));
//INSERT INTO useraccounts(uuid, username, password, type, tags) VALUES ('d5009d0a-3a88-11e6-ac61-9e71128cae77', 'root', 'password', 'root', 'root account over all projects');
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


app.post('/api/:projectname/login', function(req, res){
    var POSTbody = req.body
    var projectName = req.params.projectname

    function loginUser(data, projectName, passwordTester, responder){
        
        if (projectName.length > 0){
            client.query("select * from projects where projectname=$1", [projectName], function(err, result){
                if (result.rowCount === 0) { 
                    //project doesn't exsist               
                    response = {'message' : 'project does not exsist'}
                    var status = "500"
                    responder(status, response)
                } else {
                    var project = {'id' : result.rows[0].id, 'uuid' : result.rows[0].uuid}
                   client.query("select * from useraccounts where project=$1 and username=$2", [project.id, data.username], function(err, result){
                        if (result.rowCount === 0) { 
                            response = {'message' : 'account does not exsist'}
                            var status = "500"
                            responder(status, response)
                        } else {
                            //Login
                            var account = result.rows[0]               
                            passwordTester(data, account, responder)                            
                        }
                    });                           
                }
            });

            
        } else { 
            response = {'message' : 'invalid project details'}; 
            responder('500', response)
        } 
    };
    
    function passwordTester(data, DBdata, responder){
        if (data.password === DBdata.password){
            //correct password
            var authToken = uuid.v4()
             pg.connect(conString, function(err, client, done){        
                client.query("insert into authtokens(userid, auth, expire) values ($1, $2, $3)", [DBdata.id, authToken, 30], function(err, result){})
             });
            response = {
                'message' : 'logged in',
                'ID' : String(DBdata.uuid),    
                'X-AUTH-TOKEN' : authToken
            }                
            responder('200', response)
        } else {
            //incorrect password
            response = {'message' : 'incorrect password'}                
            responder('500', response)

        }
        
    }

    function responder(status, response){
        res.status(status).send(response)
    }
    
    loginUser(POSTbody, projectName, passwordTester, responder);   
});

app.post('/api/:projectname/register', function(req, res){
    var POSTbody = req.body
    var projectName = req.params.projectname

    function checkAccount(data, projectName, createAccount, responder){
        
        if (projectName.length > 0){
            client.query("select * from projects where projectname=$1", [projectName], function(err, result){
                if (result.rowCount === 0) { 
                    //name already taken               
                    response = {'message' : 'project does not exsist'}
                    var status = "500"
                    responder(status, response)
                } else {
                    var project = {'id' : result.rows[0].id, 'uuid' : result.rows[0].uuid}
                   client.query("select * from useraccounts where project=$1 and username=$2", [project.id, data.username], function(err, result){
                        if (result.rowCount === 0) { 
                            //name is unique, create account
                            createAccount(data, project, responder)
                        } else {
                            //name already taken               
                            response = {'message' : 'username already taken'}
                            var status = "500"
                            responder(status, response)                          
                        }
                    });                           
                }
            });

            
        } else { 
            response = {'message' : 'invalid project details'}; 
            responder('500', response)
        } 
    };

    function createAccount(data, project, responder){
        pg.connect(conString, function(err, client, done){        
            client.query("insert into useraccounts(uuid, username, password, project, type, tags) values ($1, $2, $3, $4, $5, $6) returning uuid;", [uuid.v4(), data.username, data.password, project.id, 'user', data.tags], function(err, result){
                var DBresponse = result.rows[0].uuid;
                var response = {
                    'Message' : 'user created',
                    'User-ID' : String(DBresponse),
                    'Project-ID' : project.uuid
                }
                var status = "200"
                responder(status, response)
            })
        });
    }    

    function responder(status, response){
        res.status(status).send(response)
    }
    
    checkAccount(POSTbody, projectName, createAccount, responder);
});

//Admin login endpoint
app.post('/api/login', function(req, res)
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
                'ID' : String(DBdata.uuid),    
                'X-AUTH-TOKEN' : authToken
            }                
            responder('200', response)
        } else {
            //incorrect password
            response = {'message' : 'incorrect password'}                
            responder('500', response)

        }
        
    }

    function POSTresponder(status, response){
        res.status(status).send(response)
    }
    
    loginUser(POSTbody, passwordTester, POSTresponder);   
}); 



app.post('/api/register', function(req, res)
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
            client.query("insert into useraccounts(uuid, username, password, type, tags) values ($1, $2, $3, $4, $5) returning uuid;", [uuid.v4(), data.username, data.password, 'admin', data.tags], function(err, result){
                var DBresponse = result.rows[0].uuid;
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


app.post('/api/createproject', function(req, res)
{    
    var POSTbody = req.body

    function checkAuth(data, checkProject, createProject, responder){
        client.query("SELECT * FROM authtokens WHERE auth=$1", [data.auth], function(err, result){
            if (result.rowCount === 0) { 
                response = {'message' : 'authtoken invalid'}
                var status = "500"
                responder(status, response)  
            } else {     
                var userID = result.rows[0].userid
                client.query("SELECT * FROM useraccounts WHERE id=$1", [userID], function(err, result){
                    if (result.rows[0].type === 'admin'){
                        client.query("UPDATE authtokens SET expire=$1 WHERE userid=$2", [30, userID], function(err, result){});        
                        checkProject(data, userID, createProject, responder)
                    } else {
                        response = {'message' : 'invalid account type'}
                        var status = "500"
                        responder(status, response)  
                    }
                })
            }
        });
    }

    function checkProject(data, userID, createProject, responder){
        client.query("SELECT * FROM projects WHERE projectname=$1", [data.projectname], function(err, result){
            if (result.rowCount > 0) { 
                response = {'message' : 'Project name taken'}
                var status = "500"
                responder(status, response)  
            } else {       
                createProject(data, userID, responder)                          
            }
        });
    }

    function createProject(data, userID, responder){
        pg.connect(conString, function(err, client, done){
            client.query("insert into projects(uuid, projectname, tags) values ($1, $2, $3) returning *;", [uuid.v4(), data.projectname, data.tags], function(err, result){
                client.query("insert into permissions(admin, project) values ($1, $2);", [userID, result.rows[0].id], function(err, result){})
                client.query("insert into permissions(admin, project) values ($1, $2);", [1, result.rows[0].id], function(err, result){})
                console.log(result.rows[0])
                var DBresponse = result.rows[0].uuid;
                var response = {
                    'message' : 'project created',
                    'projectname' : data.projectname,
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
    
    checkAuth(POSTbody, checkProject, createProject, responder);
});   

app.post('/api/myprojects', function(req, res){
     var POSTbody = req.body
     var projects = []

     client.query("SELECT * FROM authtokens WHERE auth=$1", [POSTbody.auth], function(err, result){
        if (result.rowCount === 0) { 
            response = {'message' : 'invalid token'}
            var status = "500"
            res.status(status).send(response) 
        } else {     
            var userID = result.rows[0].userid
            client.query("select * from permissions where admin=$1;", [userID], function(err, result){
                
                var lol 
                var results = result.rows 
                for (i = 0; i < results.length; i++) { 
                    client.query("select * from projects where id=$1;", [results[i].project], function(err, result){
                        tempProject = {
                            'UUID' : result.rows[0].uuid,
                            'projectname' : result.rows[0].projectname,
                            'tags' : result.rows[0].tags
                        }

                        projects.push(tempProject)
                        

                        if (projects.length === results.length){
                            projectData(projects);
                        }

                    }); 
                    
                   
                }
                
                //res.status(200).send('ok')
            });        
                                 
        }
    });

    function projectData(data){
        res.status(200).send(data)
    }

}); 

app.post('/api/myusers/:projectname', function(req, res){
    var POSTbody = req.body
    var projectName = req.params.projectname
});

app.post('/api/useauth', function(req, res)
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
