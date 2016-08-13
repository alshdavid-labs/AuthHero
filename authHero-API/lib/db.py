import sqlite3
import uuid
db = sqlite3.connect("database.db")

def checkAuth(auth):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM authtokens WHERE token=?', (auth,))
    db.commit()
    response = cursor.fetchall()    
    if len(response) == 0:
        return 0
    return response[0][1] # Return User ID    

def registerAdmin(username, password):
    UUIDstr = str(uuid.uuid4())
    cursor = db.cursor()
    cursor.execute('INSERT INTO adminAccounts (uuid, username, password) VALUES(?, ?, ?)', (UUIDstr, username, password))
    db.commit()    
    return { "ID" : UUIDstr }

def loginAdmin(username):
    ID = getAdmin(username)
    print(ID)
    UUIDtoken = str(uuid.uuid4())
    cursor = db.cursor()
    cursor.execute('INSERT INTO authtokens (id, token) VALUES(?, ?)', (ID['interal_id'], UUIDtoken))
    db.commit() 
    return { "auth" : UUIDtoken, "ID" : ID['external_id'], "username" : ID['username']}    

def checkAdmin(username):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM adminAccounts WHERE username=?', (username,))
    response = cursor.fetchall()
    if len(response) == 0:
        return 0   
    return response[0][0] # Return User ID   

def checkAdminPassword(username, password):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM adminAccounts WHERE username=?', (username,))
    response = cursor.fetchall()
    if password == response[0][3]:
        return True
    return False

def getAdmin(username):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM adminAccounts WHERE username=?', (username,))
    response = cursor.fetchall()
    if len(response) == 0:
        return 0                 
    return { "username" : response[0][2], "interal_id" : response[0][0], "external_id": response[0][1] } # Return User object 

def createProject(projectname, ID):
    UUIDstr = str(uuid.uuid4())
    cursor = db.cursor()
    cursor.execute('INSERT INTO projects (uuid, projectname) VALUES(?, ?)', (UUIDstr, projectname))
    cursor.execute('INSERT INTO adminKey (id, project) VALUES(?, ?)', (ID, projectname))
    db.commit()
    return

    