#$ pip install Flask
#$ pip install -U flask-cors

import threading

import lib.users
users = lib.users
import lib.projects
projects = lib.projects

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
@app.route("/auth", methods=['GET'])
@cross_origin()
def auth():
    try:
        auth = request.headers['x-auth']
    except:
         return jsonify({ "message" : "No Auth Header"})
    return jsonify(users.checkAuth(auth)) 

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
    data = request.get_json()
    auth = request.headers['x-auth']    
    return jsonify(projects.createProject(data, auth))

#register user for a project
@app.route("/u/<projectName>/register", methods=['POST'])
@cross_origin()
def projectRegister(projectName):
    data = request.get_json()
    return jsonify(projects.createUser(data, projectName)) 

#login user to a project
@app.route("/u/<projectName>/login", methods=['POST'])
@cross_origin()
def projectLogin(projectName):
    data = request.get_json()
    return jsonify(projects.loginUser(data, projectName))
 

if __name__ == "__main__":
    app.run()
