import Account from '../../common/Account.jsx';
import Admin from './Admin.jsx';
import loadGAPIs from '../../common/GAPI';

import 'script!../../../../components/bootstrap/bootstrap.min.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');

window.loadPlatform = function () {
	$script('https://apis.google.com/js/platform.js?onload=init', 'google-api');
}

var account;
var userList;
var adminStats;

window.init = function () {

	$("#footer").hide();
	$('#navAccount').hide();

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);
}

function setupUI() {
	if (account.isSignedIn()) {
		$('#navAccount').show();
		$('#navSignin').hide();

		ReactDOM.render(<Admin />, document.getElementById('adminPage'));

		// Setup for logged in user
	} else {
		$('#navAccount').hide();
	}
}