import Project from './Project';
import loadGAPIs from '../../common/GAPI';

import ProjectDashboard from "./ProjectDashboard.jsx"

import 'script!../../../../components/bootstrap/bootstrap.min.js';
import 'script!../../../../components/URIjs/URI.min.js';
import 'script!../../../../components/alertify/alertify-0.3.js';
import 'script!../../../../components/AdminLTE/js/app.min.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js?onload=loadPlatform', 'client');

window.loadPlatform = function () {
	$script('https://www.gstatic.com/charts/loader.js', function () { //load charts loader for google charts
		$script('https://apis.google.com/js/platform.js?onload=init', 'google-api');
	});

}

var account;
var project;
var projectDashboard;

function setupUI() {
	if (account.isSignedIn()) {

		$('#navAccount').show();
		$('#navSignin').hide();

		projectDashboard = ReactDOM.render(<ProjectDashboard project={project}  account={account}/>, document.getElementById('projectDashboard'));
		projectDashboard.init();

	} else {
		$('#navAccount').hide();
		handleError(resp.code);
	}
}

window.init = function () {
	var urlParams = URI(window.location.search).query(true);
	var projectType = (urlParams.type ? urlParams.type : 'PROJECT');

	project = new Project(urlParams.project, projectType);

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);
}