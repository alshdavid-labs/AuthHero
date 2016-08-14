import lib.db
database = lib.db


# Check auth token
def checkAuth(auth):
    if auth == "":
        return { "message" : "Invalid Auth Token" }   
    if database.checkAuth(auth) == 0:
        return { "message" : "Invalid Auth Token" } 
    return { "message" : "Valid Auth Token" }  

# Register User
def adminRegistration(data):
    print('got this far')
    print(data)
    # Test inputs
    if checkInput("userInformation", data) == False:
        message = { "message" : "Invalid JSON" }
        return message
    # Assin tidy variables
    username = data[0]['username']
    password = data[0]['password']
    # Check to see if account exsists
    if checkAdmin(username) != 0:
        message = { "message" : "Admin already exsists" }
        return message
    # Create the account
    dbResult = registerAdmin(username, password)    
    # Generate a sucess message
    message = { "message" : "Admin account created"}
    message.update(dbResult)
    return message

# Login User
def adminLogin(data):    
    # Test inputs
    if checkInput("userInformation", data) == False:
        message = { "message" : "Invalid JSON" }
        return message
    # Assign tidy variables
    username = data[0]['username']
    password = data[0]['password']
    # Check to see if account exsists
    if checkAdmin(username) == 0:
        message = { "message" : "User does not exsist" }
        return message
    # Compare the account details
    if checkAdminPassword(username, password) == False:
        message = { "message" : "incorrect password" }
        return message    
    # Generate auth token
    authResponse = loginAdmin(username)
    #userObject = database.getUser(username)
    # Generate a sucess message
    message = { "message" : "User account logged in"}
    message.update(authResponse)
    #message.update(userObject)
    return message

# Check inputs
def checkInput(toCheck, data):
    if toCheck == "userInformation":
        try:
            username = data[0]['username']
            password = data[0]['password']
        except:
            return False 
        return True  
    elif toCheck == "auth":    
        try:
            auth = data[0]['auth']
        except:
            return False 
        return True  

# ---
# Passing things to the database
# ---

def checkAdmin(username):    
    return database.checkAdmin(username)

def checkAdminPassword(username, password):    
    return database.checkAdminPassword(username, password)    

def registerAdmin(username, password):    
    return database.registerAdmin(username, password)

def loginAdmin(username):    
    return database.loginAdmin(username)
   

       

    