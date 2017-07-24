import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import Index from './Index.jsx';
import PersonalDashboard from "../personal-dashboard/PersonalDashboard.jsx"

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

	loadGAPIs(() => {
		if (account.isSignedIn()) {
		ReactDOM.render(
			<Router>
				<div>
					<Route path="/PersonalDashboard" render={()=><PersonalDashboard account={account} />}/>
					<Route exact path="/" render={()=><Index account={account}/>}/>
				</div>
			</Router>
			, document.getElementById('indexContent'));
		}
	}).then(

		function (accountModule) {

			account = accountModule;

		}
	);
}
