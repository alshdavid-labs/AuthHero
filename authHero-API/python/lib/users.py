import lib.db
database = lib.db

# Register User
def userRegistration(data):
    # Test inputs
    if checkInput("userInformation", data) == False:
        message = { "message" : "Invalid JSON" }
        return message
    # Assin tidy variables
    username = data[0]['username']
    password = data[0]['password']
    # Check to see if account exsists
    if checkUser(username) != 0:
        message = { "message" : "User already exsists" }
        return message
    # Create the account
    dbResult = registerUser(username, password)    
    # Generate a sucess message
    message = { "message" : "User account created"}
    message.update(dbResult)
    return message

# Login User
def userLogin(data):    
    # Test inputs
    if checkInput("userInformation", data) == False:
        message = { "message" : "Invalid JSON" }
        return message
    # Assign tidy variables
    username = data[0]['username']
    password = data[0]['password']
    # Check to see if account exsists
    if checkUser(username) == 0:
        message = { "message" : "User does not exsist" }
        return message
    # Compare the account details
    if correctPassword(username, password) == False:
        message = { "message" : "incorrect password" }
        return message    
    # Generate auth token
    authResponse = generateAuth(username)
    userObject = database.getUser(username)
    # Generate a sucess message
    message = { "message" : "User account logged in"}
    message.update(authResponse)
    message.update(userObject)
    return message

# Check auth token
def checkAuth(data):
    if checkInput("auth", data) == False:
        message = { "message" : "Invalid JSON" }
        return message   
    auth = data[0]['auth']
    if validAuth(auth) == False:
        message = { "message" : "Invalid auth token" }
        return message 
    message = { "message" : "Valid auth token" }
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

def checkUser(username):    
    return database.checkUser(username)

def correctPassword(username, password):    
    return database.correctPassword(username, password)    

def registerUser(username, password):    
    return database.registerUser(username, password)

def generateAuth(username):    
    return database.generateAuth(username)

def validAuth(auth):    
    return database.checkAuth(auth)    

       

    