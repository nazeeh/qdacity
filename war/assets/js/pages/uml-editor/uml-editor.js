import MyEditorView from './MyEditorView.jsx';

import Account from '../../common/Account.jsx';
import loadGAPIs from '../../common/GAPI';

import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';
import MetaModelEntityEndpoint from '../../common/endpoints/MetaModelEntityEndpoint';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';

import 'script!../../../../components/URIjs/URI.min.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/platform.js', function () {
	$script('https://apis.google.com/js/client.js?onload=init', 'google-api');
});


var edgeTypes = {
	NONE: 'none',
	GENERALIZATION: 'generalization',
	DEPENDENCY: 'dependency',
	AGGREGATION: 'aggregation',
	CONTAINMENT: 'containment',
	ASSOCIATION: 'association',
	DIRECTED_ASSOCIATION: 'directed_association',
	REALIZATION: 'realization'
};

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


	view = ReactDOM.render(<MyEditorView projectId={project_id} edgeTypes={edgeTypes} />, document.getElementById('content'));
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
	CodesystemEndpoint.getCodeSystem(codesystem_id).then(function (resp) {
		var codes = resp.items || [];
		
		MetaModelEntityEndpoint.listEntities(1).then(function (resp) {
			var mmEntities = resp.items || [];
			
			initGraph(codes, mmEntities);
		});
	});	
}

function initGraph(codes, mmEntities) {
	var nodes = new Map();
	var relations = [];
	
	for (var i = 0; i < codes.length; i++) {
					
		var node = view.addNode(codes[i].name);
		nodes.set(codes[i].codeID, { 'code': codes[i], 'node': node });
		
		
		console.log('add ' + codes[i].codeID + ' - ' + codes[i].name);
		
		if (codes[i].relations != null) {
			for (var j = 0; j < codes[i].relations.length; j++) {
				console.log(codes[i].codeID + ' is connected to ' + codes[i].relations[j].codeId);
				
				relations.push({ 'start': codes[i].codeID, 'end': codes[i].relations[j].codeId, 'metaModelEntityId': codes[i].relations[j].mmElementId });
			}
		}
	}
	
	
	for (var i = 0; i < relations.length; i++) {
		var relation = relations[i];
		
		var start = nodes.get(relation.start).node;
		var end = nodes.get(relation.end).node;
		
		var metaModelEntity = mmEntities.find(function(mmEntity) { return mmEntity.id == relations[i].metaModelEntityId;});
		
		var edgeType = getEdgeType(metaModelEntity);		
		
		view.addEdge(start, end, edgeType);
	}

	
	view.applyLayout();
}


function getEdgeType(metaModelEntity) {
	let mode = null;
	
	switch (metaModelEntity.name) {
		case 'is a': {
			mode = edgeTypes.GENERALIZATION;
			break;
		}
		case 'is part of': {
			mode = edgeTypes.AGGREGATION;
			break;
		}
		case 'is related to': {
			mode = edgeTypes.DIRECTED_ASSOCIATION;
			break;
		}
		default: {
			// TODO ERROR?
			//alert("error??");
			mode = edgeTypes.ASSOCIATION;
			break;
		}
	}
	
	return mode;
}
