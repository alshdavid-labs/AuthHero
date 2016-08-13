#$ pip install Flask
#$ pip install -U flask-cors

import threading

import lib.users
users = lib.users
import lib.menus
menus = lib.menus

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
app = Flask(__name__, static_url_path='')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

#api redirect
@app.route("/")
def root():
    return "<body style='margin:50px; text-align: center'><p>The authHero API</p><br><p>Go to authHero.com for usage instructions</p></body>"

#test if auth token is registered
@app.route("/auth", methods=['POST'])
@cross_origin()
def auth():
    return jsonify(users.checkAuth(request.get_json())) 

#register admin account
@app.route("/a/register", methods=['POST'])
@cross_origin()
def register():
    return jsonify(users.adminRegistration(request.get_json()))

#login admin account
@app.route("/a/login", methods=['POST'])
@cross_origin()
def login():
    return jsonify(users.adminLogin(request.get_json()))        

#Modify project POST GET DELETE PUT
@app.route("/a/project", methods=['POST'])
@cross_origin()
def project():
    return 'soon'  

#register user for a project
@app.route("/u/<projectName>/register", methods=['POST'])
@cross_origin()
def projectRegister(projectName):
    return projectName 

#login user to a project
@app.route("/u/<projectName>/login", methods=['POST'])
@cross_origin()
def projectLogin(projectName):
    return projectName 


@app.route("/menu/<username>", methods=['GET', 'PUT'])
@cross_origin()
def menu(username):
    if request.method == 'PUT':
        data = str(request.get_json())
        auth = request.headers['Auth']        
        return jsonify(menus.setMenu(data, auth, username)) 
    if request.method == 'GET':
        return jsonify(menus.getMenu(username))     

if __name__ == "__main__":
    app.run()
