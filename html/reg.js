/* Whispr Registraion */
/* ------------------ */
/* This checks and sends off the correct registration data to the Whispr */ 
/* server for processing and creating new accounts                       */

/* Success Screen */
/* --------------- */
/* This changes the front page to the success screen page */ 
function successPanel(type){
    $('#signupForm').addClass("hidden");
    $('#signupSuccess').addClass("visible");
    $('#signupSuccess').removeClass("hidden");
}

/* Alert Above Form */
/* ---------------- */
/* Function takes a status and message paramter, status changes the colour to */ 
/* represent the status of the alert and the message is the body of text      */

/* Status : "success" and "faliure" */
/* Message : The message to display */
function regAlert(status, message){
    /* Remove old alert */
    $("#warning").remove();
    switch(status)
        {   
            case "failure":
                $("#alert").append("<div id='warning' class='fade-in' style='background-color: red; padding: 10px; margin-top: 10px; margin-bottom: 10px; border-radius: 2px;' class='boldtext'>" + message + "</div>");
                break;
            case "success":
                $("#alert").append("<div id='warning' class='fade-in' style='background-color: green; padding: 10px; margin-top: 10px; margin-bottom: 10px; border-radius: 2px;' class='boldtext'>" + message + "</div>");       
                break;
        }   
}

/* Age Calculator */
/* -------------- */
/* I don't know why or how this works and I don't want */
/* to try understanding. Thanks Ihsan for finding this */
function calculateAgeFromDate(birthDate) {
        var ageDifMills = Date.now() - birthDate.getTime();
        var ageDate = new Date(ageDifMills);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

/* Registration Form */
/* ----------------- */
/* This goes over the registration form, checks for correct inputs and */ 
/* either returns a JSON that is ready to send off to the server or    */
/* returns an error, representing it with a message on the             */
/* registration form                                                   */
function registration(type) {
    var $alias = $('#alias');
    var $email = $('#email'); var email = $email.val(); email = email.toLowerCase();
    var $password = $('#password');
    var $birthdate = $('#birthdate');
    var $gender = $('#gender');
    var $genderPrefMale = $('#genderPrefMale');
    var $genderPrefFemale = $('#genderPrefFemale');
    var $genderPrefTransexual = $('#genderPrefTransexual');
    var $termsAndConditions = $('#termsAndConditions');    
    var $confirmpassword = $('#confirmpassword');
    
	console.log(type);
	
    /* Checking Alias */
    /* -------------- */
    if ($alias.val() === "") {regAlert('failure', 'Please enter a vaild alias'); console.log('alias error'); return "false";}
    console.log($alias.val());
	
    /* Checking Email */
    /* -------------- */          
    /* Checking if email is empty */
    if (email === "") {regAlert('failure', 'Please enter a vaild email address'); console.log('email error'); return "false";}
    /* Checking if email has an @ in it */
    if (email.indexOf('@') === -1){regAlert('failure', 'Please enter a vaild email address'); console.log('email error'); return "false";}
    console.log(email);
	
    /* Checking Password */
    /* ----------------- */
    /* Checking if password empty (I want different errors for both states) */
    if ($password.val() === "") {regAlert('failure', 'Please enter a vaild password'); console.log('password empty'); return "false";} 
    /* Checking if password is less than 6 characters */
    if($password.val().length < 6){regAlert('failure', 'Please enter a password with 6 or more characters'); console.log('password short'); return "false";}
    console.log($password.val());
    if($password.val() != $confirmpassword.val()){regAlert('failure', 'Your passwords need to match'); console.log('password dont match'); return "false";}
    console.log($confirmpassword.val());
	
    /* Checking Date */  
    /* ------------- */
    if ($birthdate.val() === "") {regAlert('failure', 'Please enter your date of birth'); console.log('no birthdate'); return "false";};
	console.log($birthdate.val());
    var age = {
        /* Creating an array based on the input of the date of birth component. Splitting the values up into day, month, year */ 
        day: $birthdate.val().split("-")[2], 
        month: $birthdate.val().split("-")[1], 
        year: $birthdate.val().split("-")[0]
        }
    /* Creating date object with the data in the age aray (API requires birthdate in above birthdate array format) */ 
    var birthdateObj = new Date(age.year, age.month, age.day);
    /* Piping date object into the age calculator, it responds with a integer representing the person's age */
    var calculatedAge = calculateAgeFromDate(birthdateObj);
	console.log(calculatedAge);
    /* Testing date to see if it is less than 18 */
    if (age < 18) {regAlert('failure', 'You must be at least 18 years old'); console.log('too young'); return "false";}
    
    /* Checking Gender */
    /* --------------- */
    
	var gender = ""
    /* Setting gender variable based on the response of the gender picker */
	console.log($gender.val());
    switch($gender.val()) 
    {
        case "MALE":
            gender = "MALE"; 
			console.log('is a male');			
            break;
        case "FEMALE":
            gender = "FEMALE";
			console.log('is a female');
            break;
        case "TRANSEXUAL":
            gender="OTHER"; 
			console.log('is transexual');	
            break;    
        default:
    }    
    
    /* Gender Preferences  */
    /* ------------------- */
    /* Creating an array of gender preferences */
    var preferences = []
    if ($genderPrefMale.is(':checked')) { preferences.push ("MALE"); console.log('gp male');} 
    if ($genderPrefFemale.is(':checked')) {preferences.push ("FEMALE"); console.log('gp female')} 
    if ($genderPrefTransexual.is(':checked')) {preferences.push ("OTHER"); console.log('gp transexual');} 

    /* Terms and Conditions */
    /* -------------------- */
    /* Ensuring the terms and conditions are checked */
    if ($termsAndConditions.is(':checked')){}else
        { 
            regAlert('failure', 'You must agree to our terms and conditions');
			console.log('T&C not checked');
            return "false";
        }
    
    
    
    /* Creating the message for the server */
    /* -------------- */    
    /* populating array with the inputs */
	switch (type)
	{
		case "MERCHANT":
			var data = {
				alias: $alias.val(),
				email: $email.val(),
				password: $password.val(),
				age,
				gender: gender,            
				preferences
			}; 
		break;
		case "USER":
			var data = {
				alias: $alias.val(),
				email: email,
				plaintext_password: $password.val(),
				age,
				gender: gender,            
				preferences 
			}; 
		break;
	} 
		
	
    /* return the data array to send off to the server */
	console.log(data);
    return data;
} 

function registerAccount(data, url, type){     
    /* Send the package to the server */
    /* ------------------------------ */
    console.log('sending')
	$.ajax({		
        type: 'POST',
        url: url,        
        crossDomain: true,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: "application/json",
        success: function() {successPanel(type); console.log('worked')},
        error: function(data) {console.log(data); regAlert('failure',data.responseJSON.message);}        
    });
   
}

$('#registerUser').on('click', function(){ 
    var url = "https://www.whispr.online:8443/api/users/create"
    var data = registration('USER');
    if (data === "false"){} else {registerAccount(data, url, 'USER')} 
});

$('#registerMerchant').on('click', function(){ 
    var url = "https://www.whispr.online:8090/api/create"
    var data = registration('MERCHANT');
    if (data === "false"){} else {registerAccount(data, url, 'MERCHANT')}
});