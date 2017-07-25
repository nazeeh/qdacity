import Index from './Index.jsx';
import Account from '../../common/Account.jsx';

import BinaryDecider from '../../common/modals/BinaryDecider.js';
import 'script!../../../../components/bootstrap/bootstrap.min.js';
import 'script!../../../../components/Vex/js/vex.combined.min.js';
import loadGAPIs from '../../common/GAPI';


import $script from 'scriptjs';
$script('https://apis.google.com/js/platform.js', function () {
	$script('https://apis.google.com/js/client.js?onload=init', 'gapi');
});

var account;
var signInLoader;

function signout() {
	window.open("https://accounts.google.com/logout");
}

window.init = function () {
	//signInLoader = ReactDOM.render(<ReactLoading />, document.getElementById('loaderMount'));
	ReactDOM.render(<Index signIn={signIn} />, document.getElementById('indexContent'));

	loadGAPIs(() => {}).then(
		function (accountModule) {
			account = accountModule;
		}
	);
}

function redirect() {

	account.getCurrentUser().then(function (value) {
		window.location = "personal-dashboard.html";
	}, function (value) {
		var acc = account;
		var _this = this;
		var decider = new BinaryDecider('Your account does not seem to be registered with QDAcity. What would you like me to do?', 'Use Different Account', 'Register Account');
		decider.showModal().then(function (value) {
			if (value == 'optionA') account.changeAccount(redirect);
			else registerAccount();
		});
	});
}

function registerAccount() {
	var googleProfile = account.getProfile();
	vex.dialog.open({
		message: 'Please confirm:',
		input: '<label for"firstName">First Name</label><input name="firstName" type="text" placeholder="First Name" value="' + googleProfile.getGivenName() + '" required />'
			+ '<label for"lastName">Last Name</label><input name="lastName" type="text" placeholder="Last Name" value="' + googleProfile.getFamilyName() + '" required />\n'
			+ '<label for"email">Email</label><input name="email" type="text" placeholder="Email" value="' + googleProfile.getEmail() + '" required />\n\n',
		buttons: [
			$.extend({}, vex.dialog.buttons.YES, {
				text: 'Register'
			}), $.extend({}, vex.dialog.buttons.NO, {
				text: 'Cancel'
			})
		],
		callback: function (data) {
			if (data === false) {
				return console.log('Cancelled');
			}
			account.registerCurrentUser(data.firstName, data.lastName, data.email).then(redirect);
			return console.log('First', data.firstName, 'Last Name', data.lastName, 'Email', data.email);
		}
	});

}

function signIn(event) {
	$('#signinGoogleBtn').hide();
	$('.signin').css("display", "inline-block");

	if (account.isSignedIn()) {
		redirect();
	} else {
		account.changeAccount(redirect);
	}
}