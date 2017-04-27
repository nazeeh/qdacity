import MyEditorView from './MyEditorView.jsx';

import Account from '../../common/Account.jsx';
import loadGAPIs from '../../common/GAPI';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';
import CodesEndpoint from '../../common/endpoints/CodesEndpoint';

import 'script!../../../../components/URIjs/URI.min.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/platform.js', function () {
	$script('https://apis.google.com/js/client.js?onload=init', 'google-api');
});


var project_id;
var project_type;

var account;

var view;


window.init = function () {

	var urlParams = URI(window.location.search).query(true);

	project_id = urlParams.project;
	project_type = urlParams.type;


	if (!mxClient.isBrowserSupported()) {
		// Displays an error message if the browser is not supported.
		mxUtils.error('Browser is not supported!', 200, false);
	}


	view = ReactDOM.render(<MyEditorView projectId={project_id} />, document.getElementById('content'));
	view.run();


	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);
}

function setupUI() {
	if (account.isSignedIn()) {
		var profile = account.getProfile();

		$('#navAccount').show();
		$('#navSignin').hide();
		ProjectEndpoint.getProject(project_id, project_type).then(function (resp) {
			loadCodes(resp.codesystemID);
		});
	} else {
		$('#navAccount').hide();
	}
}

function loadCodes(codesystem_id) {
	var codes = [];

	CodesystemEndpoint.getCodeSystem(codesystem_id).then(function (resp) {
		resp.items = resp.items || [];
		codes = resp.items;

		for (var i = 0; i < codes.length; i++) {
			console.log('add ' + codes[i].name);
			view.addNode(codes[i].name);
		}
	});
}