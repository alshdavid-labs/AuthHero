import lib.db
database = lib.db

def setMenu(data, auth, username):
    ID = database.checkUser(username)
    authID = database.checkAuth(auth)
    print(authID)
    print(ID)
    if ID == 0:
        return { "message" : "Account Doesn't Exsist" }
    if authID == 0:
        return { "message" : "Invalid Auth Token" }
    if authID != ID:
        return { "message" : "Invalid Auth Token" }     
    database.setMenu(data, ID)    
    return { "message" : "Modified"}

def getMenu(username):
    ID = database.checkUser(username)
    print(ID)
    if ID == 0:
        return { "message" : "Account Doesn't Exsist" }
    return database.getMenu(ID)

