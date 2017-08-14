import 'script!../../../../components/jQuery/jquery.js';
import 'script!../../../../components/bootstrap/bootstrap.min.js';
import 'script!../../../../components/Vex/js/vex.combined.min.js';

// Personal Dasboard Styles
import "../../../css/project-list.css";
import "../../../../components/AdminLTE/css/AdminLTE.min.css";
import "../../../css/dashboard.css";
import "../../../css/IntercoderAgreement.css";

// Common Styles
import "../../../css/common.css";
import "../../../css/navbar-account.css";
import "../../../css/landing-page.css";
import "../../../../components/Vex/css/vex.css";
import "../../../../components/Vex/css/vex-theme-os.css";
import "../../../../components/bootstrap/dist/bootstrap.min.css";


import App from '../App.jsx';
import Account from '../../common/Account.jsx';

import BinaryDecider from '../../common/modals/BinaryDecider.js';

import loadGAPIs from '../../common/GAPI';

import $script from 'scriptjs';

var chartScriptPromise = new Promise(
	function (resolve, reject) {
		$script('https://www.gstatic.com/charts/loader.js', () => {
			resolve();
		});
	}
);

var googleClientPromise = new Promise(
	function (resolve, reject) {
		window.resolveClient = resolve;
	}
);

$script('https://apis.google.com/js/client.js?onload=resolveClient', '');


var googlePlatformPromise = new Promise(
	function (resolve, reject) {
		$script('https://apis.google.com/js/platform.js', () => {
			resolve();
		});
	}
);

var mxGraphPromise = new Promise(
	function (resolve, reject) {
		$script('../../components/mxGraph/javascript/mxClient.min.js', () => {
			resolve();
		});
	}
);

var account = {
	isSignedIn: () => {
		return false;
	}
};

window.onload = function () {
	googleClientPromise.then(() => {
		googlePlatformPromise.then(() => {
			init();
		});
	});

}

const init = function () {

	loadGAPIs(() => {

	}).then((apiCfg) => {
		var account = {
			isSignedIn: () => {
				return false;
			}
		};
		ReactDOM.render(
			<App apiCfg={apiCfg} chartScriptPromise={chartScriptPromise}  mxGraphPromise={mxGraphPromise}/>, document.getElementById('indexContent'));

	});
}