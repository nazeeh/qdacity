import Account from './Account.jsx';
import ReactLoading from './ReactLoading.jsx';
import BinaryDecider from './modals/BinaryDecider.js';
import 'script!../../components/bootstrap/bootstrap.min.js';
import 'script!../../components/Vex/js/vex.combined.min.js';


import $script from 'scriptjs';
$script('https://apis.google.com/js/platform.js', function() {
	$script('https://apis.google.com/js/client.js?onload=init','gapi');
	});


var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';
var account; 
var signInLoader;

function signout(){
	window.open("https://accounts.google.com/logout");
}

window.init = function() {
	signInLoader = ReactDOM.render(<ReactLoading />, document.getElementById('loaderMount'));
	
	var isRegistered=getCookie("isRegistered");
    if (isRegistered == "true") {
    	//window.location = "personal-dashboard.html"; 
    }
	
var apisToLoad;
var callback = function() {
  if (--apisToLoad == 0) {
	  account = ReactDOM.render(<Account  client_id={client_id} scopes={scopes} callback={setupUI}/>, document.getElementById('accountView')); 
  }
  vex.defaultOptions.className = 'vex-theme-os';
  
}
 
apisToLoad = 2;
gapi.client.load('qdacity', 'v1', callback, 'https://qdacity-app.appspot.com/_ah/api');
gapi.load('auth2', callback);

$('#signinGoogleBtn').click(signIn);
}

function setupUI(){
	
}

function redirect(){
	
	account.getCurrentUser().then(function(value) {
		window.location = "personal-dashboard.html";
	 }, function(value) {
		 var acc = account;
		 var _this = this;
		  var decider = new BinaryDecider('Your account does not seem to be registered with QDAcity. What would you like me to do?', 'Use Different Account', 'Register Account' );
		  decider.showModal().then(function(value){
			  if (value == 'optionA') account.changeAccount(redirect,client_id,scopes);
			  else registerAccount();
		  });
	 });
}
function registerAccount(){
	var googleProfile = account.getProfile();
	vex.dialog.open({
		  message: 'Please confirm:',
		  input: '<label for"firstName">First Name</label><input name="firstName" type="text" placeholder="First Name" value="'+googleProfile.getGivenName()+'" required />'+
		   		'<label for"lastName">Last Name</label><input name="lastName" type="text" placeholder="Last Name" value="'+googleProfile.getFamilyName()+'" required />\n'
		   		+ '<label for"email">Email</label><input name="email" type="text" placeholder="Email" value="'+googleProfile.getEmail() +'" required />\n\n',
		  buttons: [
		    $.extend({}, vex.dialog.buttons.YES, {
		      text: 'Register'
		    }), $.extend({}, vex.dialog.buttons.NO, {
		      text: 'Cancel'
		    })
		  ],
		  callback: function(data) {
		    if (data === false) {
		      return console.log('Cancelled');
		    }
		    account.registerCurrentUser(data.firstName, data.lastName, data.email).then(redirect);
		    return console.log('First', data.firstName, 'Last Name', data.lastName, 'Email', data.email);
		  }
		});

}

function signIn(event){
	event.preventDefault();
	$('#signinGoogleBtn').hide();
	$('.signin').css( "display", "inline-block" );
	//signInLoader.show();
	
	   if (account.isSignedIn()) {
		   redirect();
	    }
	    else {
	    	account.changeAccount(redirect);
	    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
} 

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
} 
