import lib.db
database = lib.db

import lib.users
users = lib.users

def createProject(data, auth):
    ID = database.checkAuth(auth)
    if ID == 0:
        return { "message" : "Invalid auth token" } 

    #TODO if project already exsists     
    database.createProject(data[0]['projectname'], ID)    
    return { "message" : "Project Created Successfully", "projectName" : data[0]['projectname'] } 


def createUser(data, projectName):
    try:
        username = data[0]['username']
        password = data[0]['password']
    except:
        return { "message" : "Invalid JSON" } 
    if projectName == "":
        return { "message" : "Invalid JSON" }     

    project_id = database.checkProject(projectName)
    if project_id == 0:
        return { "message" : "Project Doesn't Exsists" }

    if database.checkUser(username) != 0:
        return { "message" : "User Already Exsists"}    
    ID = database.registerUser(project_id, username, password)    
    
    return { "message" : "Account Created Successfully", "ID" : ID, "username" : username, "project" : projectName }


def loginUser(data, projectName):    
    try:
        username = data[0]['username']
        password = data[0]['password']
    except:
        return { "message" : "Invalid JSON" } 
    if projectName == "":
        return { "message" : "Invalid JSON" }
    
    project_id = database.checkProject(projectName)
    if project_id == 0:
        return { "message" : "Project Doesn't Exsists" }

    user_id = database.checkUser(username, project_id)    
    if user_id == 0:
        return { "message" : "User Does Not Exsist"}    

    if database.checkUserPassword(username, password, project_id) == False:
        return { "message" : "incorrect password" }    
    
    authResponse = database.loginUser(username, user_id)
    
    message = { "message" : "User account logged in"}
    message.update(authResponse)
    message.update( {"username" : username} )
    #message.update(userObject)
    return message    