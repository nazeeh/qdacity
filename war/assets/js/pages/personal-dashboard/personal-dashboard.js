import loadGAPIs from '../../common/GAPI';

import Account from '../../common/Account.jsx';
import PersonalDashboard from "./PersonalDashboard.jsx"
import $script from 'scriptjs';
$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');
window.loadPlatform = function () {
	$script('https://apis.google.com/js/platform.js?onload=init', 'google-api');
}

var account;

function setupUI() {
	if (account.isSignedIn()) {
		$('#navAccount').show();
		$('#navSignin').hide();
		ReactDOM.render(<PersonalDashboard account={account} />, document.getElementById('personalDashboard'));
	} else {
		$('#navAccount').hide();
	}
}

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

}