import App from '../App.jsx';

import Account from '../../common/Account.jsx';

import BinaryDecider from '../../common/modals/BinaryDecider.js';
import 'script!../../../../components/bootstrap/bootstrap.min.js';
import 'script!../../../../components/Vex/js/vex.combined.min.js';
import loadGAPIs from '../../common/GAPI';


import $script from 'scriptjs';
$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');

window.loadPlatform = function () {
	$script('https://www.gstatic.com/charts/loader.js', function () { //load charts loader for google charts
		$script('https://apis.google.com/js/platform.js?onload=init', 'google-api');
	});
}

var account = {
	isSignedIn: () => {
		return false;
	}
};

window.init = function () {

	loadGAPIs(() => {

	}).then((apiCfg) => {
		var account = {
			isSignedIn: () => {
				return false;
			}
		};
		ReactDOM.render(
			<App apiCfg={apiCfg}/>, document.getElementById('indexContent'));

	});
}