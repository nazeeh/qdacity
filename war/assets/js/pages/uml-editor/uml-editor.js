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
	NONE: 0,
	GENERALIZATION: 1,
	DEPENDENCY: 2,
	AGREGATION: 3,
	CONTAINMENT: 4,
	ASSOCIATION: 5,
	DIRECTED_ASSOCIATION: 6,
	REALIZATION: 7
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

//	var v1 = view.addNode("1");
//	var v2 = view.addNode("2");
//	var v3 = view.addNode("3");
//	var v4 = view.addNode("4");
//	var v5 = view.addNode("5");
//	var v6 = view.addNode("6");
//	var v7 = view.addNode("7");
//	var v8 = view.addNode("8");
//	
//	view.addEdge(v1, v2, generialization);
//	view.addEdge(v2, v3, dependency);
//	view.addEdge(v3, v4, aggregation);
//	view.addEdge(v4, v5, containment);
//	view.addEdge(v5, v6, association);
//	view.addEdge(v6, v7, directed_association);
//	view.addEdge(v7, v8, realization);
//    
//    
	
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
		
		var mode = null;
		
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
				// ERROR?
				//alert("error??");
				mode = edgeTypes.ASSOCIATION;
				break;
			}
		}
		
		view.addEdge(start, end, mode);
	}

	
	view.applyLayout();
}
