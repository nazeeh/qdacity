import MyEditorView from './MyEditorView.jsx';

import Account from '../../common/Account.jsx';
import loadGAPIs from '../../common/GAPI';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';

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

		var nodes = new Map();
		var relations = [];
		
		for (var i = 0; i < codes.length; i++) {
						
			var node = view.addNode(codes[i].name);
			nodes.set(codes[i].codeID, { 'code': codes[i], 'node': node });
			
			
			console.log('add ' + codes[i].codeID + ' - ' + codes[i].name);
			
			if (codes[i].relations != null) {
				for (var j = 0; j < codes[i].relations.length; j++) {
					console.log(codes[i].codeID + ' is connected to ' + codes[i].relations[j].codeId);
					
					relations.push({ 'start': codes[i].codeID, 'end': codes[i].relations[j].codeId });
				}
			}
		}
		
		
		
		
		for (var i = 0; i < relations.length; i++) {
			var relation = relations[i];
			
			var start = nodes.get(relation.start).node;
			var end = nodes.get(relation.end).node;
			
			view.addEdge(start, end);
		}

		
		view.applyLayout();
		
	});	
}
