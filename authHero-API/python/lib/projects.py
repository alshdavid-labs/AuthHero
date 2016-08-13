import lib.db
database = lib.db

import lib.users
users = lib.users

def createProject(data, auth):
    #print(data)
    #print(auth)
    ID = users.checkAuth(auth)
    if ID == 0:
        return { "message" : "Invalid auth token" } 

    database.createProject(data[0]['projectname'], ID)    
    return { "message" : "all g" } 