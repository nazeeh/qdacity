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


		// if (account.isSignedIn()) {
		// 	ReactDOM.render(
		// 		<Router>
		// 		<div>
		// 			<Route path="/" render={(props)=><Index ref={(c) => this.account = c} {...props}/>}/>
		// 			<Route path="/PersonalDashboard" render={(props)=><PersonalDashboard account={account}  {...props}/>}/>
		// 			<Route path="/ProjectDashboard" render={(props)=><ProjectDashboard account={account} {...props} />}/>
		// 			<Route path="/Admin" render={()=><Admin account={account} />}/>
		// 			<Route path="/CodingEditor" render={(props)=><CodingEditor account={account} {...props}/>}/>
		// 			<Route exact path="/" render={(props)=><Index account={account}  {...props}/>}/>
		// 		</div>
		// 	</Router>, document.getElementById('indexContent'));
		// } else {
		// 	ReactDOM.render(
		// 		<Router>
		// 		<div>
		// 			<Route path="/" render={(props)=><Index ref={(c) => this.account = c} {...props}/>}/>
		// 			<Route exact path="/" render={(props)=><Index account={account}  {...props}/>}/>
		// 		</div>
		// 	</Router>, document.getElementById('indexContent'));
		// }
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