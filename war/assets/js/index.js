
var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';
	    
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

function signin(mode, callback) {
	  gapi.auth.authorize({client_id: client_id,scope: scopes, immediate: mode},callback);
}

function signout(){
	window.open("https://accounts.google.com/logout");
}

function init() {
	
	var isRegistered=getCookie("isRegistered");
    if (isRegistered == "true") {
    	window.location = "personal-dashboard.html";
    }
	
var apisToLoad;
var callback = function() {
  if (--apisToLoad == 0) {
	   signin(true,handleAuth);
    //Load project settings
  }
  
}
 
apisToLoad = 2;
gapi.client.load('qdacity', 'v1', callback, 'https://qdacity-app.appspot.com/_ah/api');
gapi.client.load('oauth2','v2',callback);
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