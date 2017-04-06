import Account from '../../common/Account.jsx';
import UserList from './UserList.jsx';
import loadGAPIs from '../../common/GAPI';
import UserEndpoint from '../../common/endpoints/UserEndpoint';

import 'script!../../../../components/bootstrap/bootstrap.min.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');

window.loadPlatform = function () {
	$script('https://apis.google.com/js/platform.js?onload=init', 'google-api');
}

var account;
var userList;

window.init = function () {

	$("#footer").hide();
	$('#navAccount').hide();

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);

	document.getElementById('navBtnSigninGoogle').onclick = function () {
		account.changeAccount(setupUI);
	};

	$("#userSearchFindBtn").click(function (event) {
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

function setupUI() {
	if (account.isSignedIn()) {
		$('#navAccount').show();
		$('#navSignin').hide();
		userList = ReactDOM.render(<UserList />, document.getElementById('userList'));
		// Setup for logged in user
	} else {
		$('#navAccount').hide();
	}
}

function findUsers(searchTerm) {
	UserEndpoint.findUsers(searchTerm).then(function (resp) {
		userList.setUsers(resp.items);
	}).catch(function (resp) {
		userList.setUsers(new []);
		window.alert(resp.code);
	});
}