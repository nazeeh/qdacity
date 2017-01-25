import Account from '../../common/Account.jsx';
import ReactLoading from '../../common/ReactLoading.jsx';
import BinaryDecider from '../../common/modals/BinaryDecider.js';
import 'script!../../../../components/bootstrap/bootstrap.min.js';
import 'script!../../../../components/Vex/js/vex.combined.min.js';
import loadGAPIs from '../../common/GAPI';


import $script from 'scriptjs';
$script('https://apis.google.com/js/platform.js', function() {
	$script('https://apis.google.com/js/client.js?onload=init','gapi');
	});

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
	
    loadGAPIs(setupUI).then(
			function(accountModule){
				account = accountModule;
				$('#signinGoogleBtn').click(signIn); 
			}
	);
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
			  if (value == 'optionA') account.changeAccount(redirect);
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
