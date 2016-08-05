import Account from './Account';
import 'script!../../components/bootstrap/bootstrap.min.js';
import 'script!../../components/Vex/js/vex.combined.min.js';


import $script from 'scriptjs';
$script('https://apis.google.com/js/client.js', function() {
	$script('https://apis.google.com/js/platform.js',init);
	});


var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';
var account;
	    
function handleAuth() {
		  var request = gapi.client.oauth2.userinfo.get().execute(function(resp) {

		    if (!resp.code) {
		    	
		    	setCookie("isRegistered", "true", 30);
		    	window.location = "personal-dashboard.html";
		     
		    }
		    else {
		    	$("#bodyCover").hide();
		    }
		  });
		}


function signout(){
	window.open("https://accounts.google.com/logout");
}

function init() {
	
	var isRegistered=getCookie("isRegistered");
    if (isRegistered == "true") {
    	//window.location = "personal-dashboard.html"; 
    }
	
var apisToLoad;
var callback = function() {
  if (--apisToLoad == 0) {
	  account = new Account(client_id, scopes);
	   account.signin(setupUI);
//	   signin(true,handleAuth);
    //Load project settings
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
		 vex.dialog.open({ 
			    message: 'Dear Sir or Madam, \nI see your google account, but it is not yet registered with QDAcity. What would you like me to do?',
			    contentCSS: { width: '500px' },
			    buttons: [
		         	$.extend({}, vex.dialog.buttons.NO, { className: 'deciderBtn vex-dialog-button-primary', text: 'Register Account', click: function($vexContent, event) {
			            $vexContent.data().vex.value = 'choiceA';
			            vex.close($vexContent.data().vex.id);
			        }}),
			        $.extend({}, vex.dialog.buttons.NO, { className: 'deciderBtn pull-left vex-dialog-button-primary ', text: 'Use Different Account', click: function($vexContent, event) {
			            $vexContent.data().vex.value = 'choiceB';
			            vex.close($vexContent.data().vex.id);
			        }}),
			       
			    ],
			    callback: function(value) {
			        switch (value) {
					case 'choiceA':
						registerAccount();
						break;
					case 'choiceB':
						account.changeAccount(redirect,client_id,scopes);
						break;

					default:
						break;
					}
			        
			    }
			});
		 
	 });
}

function registerAccount(){
	var googleProfile = account.getProfile();
	vex.dialog.open({
		  message: 'Please confirm:',
		  input: '<label for"firstName">First Name</label><input name="firstName" type="text" placeholder="First Name" value="'+googleProfile.Za+'" required />'+
		   		'<label for"lastName">Last Name</label><input name="lastName" type="text" placeholder="Last Name" value="'+googleProfile.Na+'" required />\n'
		   		+ '<label for"email">Email</label><input name="email" type="text" placeholder="Email" value="'+googleProfile.hg +'" required />\n\n',
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
	   if (account.isSignedIn()) {
		   redirect();
	    }
	    else {
	    	account.signin(redirect);
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

function addStartBtns(isLoggedIn){
	if (isLoggedIn) {
		addDashboardBtn();
	} else {
		addRegisterBtns();
	} 
}

function addRegisterBtns(){
	var html = '<ul class="list-inline intro-social-buttons">';
	html += '<li>';
	html += '<a href="index.html" class="btn btn-default btn-lg"><i class="fa fa-user-plus"></i> <span class="network-name">Sign up</span></a>';
	html += '</li>';
	html += '<li>';
	html += '<a href="index.html" class="btn btn-default btn-lg"><i class="fa fa-sign-in fa-fw"></i> <span class="network-name">Sign in</span></a>';
	html += '</li>';
	html += '</ul>';
	
	$('#startBtns').append(html);
}

function addDashboardBtn(){
	var html = '<a href="personal-dashboard.html" class="btn btn-default btn-lg"><i class="fa fa-sign-in fa-fw"></i> <span class="network-name">Sign in</span></a>';
	
	$('#startBtns').append(html);
}