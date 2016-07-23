import sqlite3
import uuid
db = sqlite3.connect("database.db")

def registerUser(username, password):
    cursor = db.cursor()
    cursor.execute('INSERT INTO accounts (username, password) VALUES(?, ?)', (username, password))
    ID = cursor.lastrowid
    cursor.execute('INSERT INTO menu (account) VALUES(?)', (ID,))
    db.commit()    
    return { "ID" : ID }

def generateAuth(username):
    ID = int(checkUser(username))
    UUIDstr = str(uuid.uuid4())
    try:
        cursor = db.cursor()
        cursor.execute('INSERT INTO auth (user_id, auth) VALUES(?, ?)', (ID, UUIDstr))
        db.commit()
    except:
        return { "message" : "You somehow managed to create a duplicate UUID, great job, you were more likely to win the lottery. Should have spent that luck elsewhere"}  
    return { "auth" : UUIDstr}    

def checkAuth(auth):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM auth WHERE auth=?', (auth,))
    db.commit()
    response = cursor.fetchall()    
    if len(response) == 0:
        return 0
    return response[0][1] # Return User ID    

def checkUser(username):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM accounts WHERE username=?', (username,))
    response = cursor.fetchall()
    if len(response) == 0:
        return 0   
    return response[0][0] # Return User ID

def getUser(username):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM accounts WHERE username=?', (username,))
    response = cursor.fetchall()
    if len(response) == 0:
        return 0   
    return { "username" : response[0][1], "ID" : response[0][0] } # Return User object    

def correctPassword(username, password):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM accounts WHERE username=?', (username,))
    response = cursor.fetchall()
    if password == response[0][2]:
        return True
    return False


def setMenu(data, ID):
    cursor = db.cursor()
    cursor.execute('UPDATE menu SET data=? WHERE account=?', (data, ID))
    db.commit()   
    return { "message" : "stored" }

def getMenu(ID):
    print(ID)
    cursor = db.cursor()
    cursor.execute('SELECT * FROM menu WHERE account=?', (ID,))
    response = cursor.fetchall()
    if len(response) == 0:
        return 0
    return response[0][2]    
     

    