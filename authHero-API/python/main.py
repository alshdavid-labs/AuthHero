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


@app.route("/")
def root():
    return 'lol'  


@app.route("/register", methods=['POST'])
@cross_origin()
def register():
    return jsonify(users.userRegistration(request.get_json()))

@app.route("/login", methods=['POST'])
@cross_origin()
def login():
    return jsonify(users.userLogin(request.get_json()))        

@app.route("/auth", methods=['POST'])
@cross_origin()
def auth():
    return jsonify(users.checkAuth(request.get_json())) 

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
