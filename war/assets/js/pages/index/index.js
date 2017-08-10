import 'script!../../../../components/jQuery/jquery.js';
import 'script!../../../../components/bootstrap/bootstrap.min.js';
import 'script!../../../../components/Vex/js/vex.combined.min.js';

import App from '../App.jsx';
import Account from '../../common/Account.jsx';

import BinaryDecider from '../../common/modals/BinaryDecider.js';

import loadGAPIs from '../../common/GAPI';

import $script from 'scriptjs';

var chartScriptPromise = new Promise(
	function (resolve, reject) {
		$script('https://www.gstatic.com/charts/loader.js', ()=>{
			resolve();
		});
	}
);

var googleClientPromise = new Promise(
	function (resolve, reject) {
		$script('https://apis.google.com/js/client.js', ()=>{
			resolve();
		});
	}
);

var googlePlatformPromise = new Promise(
	function (resolve, reject) {
		$script('https://apis.google.com/js/platform.js', ()=>{
			resolve();
		});
	}
);

var account = {
	isSignedIn: () => {
		return false;
	}
};

window.onload = function(){
	googleClientPromise.then(()=>{
		googlePlatformPromise.then(()=>{
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
			<App apiCfg={apiCfg} chartScriptPromise={chartScriptPromise}/>, document.getElementById('indexContent'));

	});
}