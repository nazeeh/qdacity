import loadGAPIs from '../../common/GAPI';

import Account from '../../common/Account.jsx';
import ProjectList from "./ProjectList.jsx"
import NotificationList from "./NotificationList.jsx"

import $script from 'scriptjs';
$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');
window.loadPlatform = function () {
	$script('https://apis.google.com/js/platform.js?onload=init', 'google-api');
}

var account;
var projectList;
var notificationList;

function setupUI() {
	if (account.isSignedIn()) {
		$('#navAccount').show();
		$('#navSignin').hide();
		$('#welcomeName').html(account.getProfile().getGivenName());
		$('#welcome').removeClass('hidden');

		projectList.init();
		notificationList.init();
	} else {
		$('#navAccount').hide();
	}
}

window.init = function () {

	$("#footer").hide();
	$('#navAccount').hide();

	projectList = ReactDOM.render(<ProjectList />, document.getElementById('projectList'));
	notificationList = ReactDOM.render(<NotificationList projectList={projectList} />, document.getElementById('notificationList'));

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);

	document.getElementById('navBtnSigninGoogle').onclick = function () {
		account.changeAccount(setupUI);
	};

}