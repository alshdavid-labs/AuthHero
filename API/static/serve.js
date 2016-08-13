domain = "http://localhost:5000"

function registerAccount(){
    username = $('#username').val()
    password = $('#password').val()
    data = [{
        'username' : username,
        'password' : password
    }]
    url = domain + "/register"
    request('POST', data, url, "")
};

function loginAccount(){
    username = $('#username').val()
    password = $('#password').val()
    data = [{
        'username' : username,
        'password' : password
    }]
    url = domain + "/login"
    request('POST', data, url, "", function(data){
        setCookie("auth", data.auth, 30)
        setCookie("username", data.username, 30)
        window.open ('mainmenu.html','_self',false)
    })
};

function loadMenu(){
    getCookie("username", function(res){
        url = domain + "/menu/" + res
        console.log(url)
        request('GET', '', url, '', function(res){
            console.log(res)
        })        
    })
}


function saveMenu(){
    
}

function request(type, data, url, auth, callback){
    $.ajax({		
        type: type,
        headers: {'AUTH' : auth},
        url: url,        
        crossDomain: true,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: "application/json",
        success: function(res) { callback(res)},
        error: function(data) {console.log(data);}        
    });

}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname, callback) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            callback(c.substring(name.length,c.length));
        }
    }
    return "";
}
