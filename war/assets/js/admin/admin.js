import Account from '../Account.jsx';
import UserList from './UserList.jsx';
import 'script!../../../components/bootstrap/bootstrap.min.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');

window.loadPlatform = function (){
	$script('https://apis.google.com/js/platform.js?onload=init','google-api');
}


var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';

var account;
var userList;

window.init = function () {
 
	$("#footer").hide();
	$('#navAccount').hide();

	var apisToLoad;
	var callback = function callback() {
		if (--apisToLoad == 0) {
			account = ReactDOM.render(<Account  client_id={client_id} scopes={scopes} callback={setupUI}/>, document.getElementById('accountView'));
		}
	};

	apisToLoad = 2;
	gapi.client.load('qdacity', 'v1', callback, 'https://qdacity-app.appspot.com/_ah/api');
	gapi.load('auth2', callback);


	document.getElementById('navBtnSigninGoogle').onclick = function () {
		account.changeAccount(setupUI);
	};
	
	$( "#userSearchFindBtn" ).click( function(event) {
		event.preventDefault();
		var serachTerm = $('#userSearchTerm').val();
		findUsers(serachTerm);
		//window.alert($('#userSearchTerm').val());
      });
	
	

	$("#userSearchTerm").on('keyup', function (e) {
	    if (e.keyCode == 13) {
	    	var serachTerm = $('#userSearchTerm').val();
			findUsers(serachTerm);
	    }
	});


	
}

function setupUI(){
	if (account.isSignedIn()){
		$('#navAccount').show();
		$('#navSignin').hide();
		userList = ReactDOM.render(<UserList />, document.getElementById('userList'));
		// Setup for logged in user
	}
	else{
		$('#navAccount').hide();
	}
}
function findUsers(searchTerm){
	gapi.client.qdacity.user.findUsers({'searchTerm': searchTerm}).execute(function (resp) {
		if (!resp.code) {
			if (typeof resp.items != 'undefined'){
				userList.setUsers(resp.items);
			}
			else userList.setUsers([]);
			
//			resp.items = resp.items || [];
//
//            for (var i=0;i<resp.items.length;i++) {
//            	userList.addUser(resp.items[i])
//            }
			console.log(resp.code);
		} else {
			userList.setUsers(new []);
			window.alert(resp.code);
		}
	});
}