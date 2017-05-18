import MetaModelMapper from './MetaModelMapper.js';
import MyEditorView from './MyEditorView.js';

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

	let container = document.getElementById('graphContainer');
	view = new MyEditorView(container);

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

		let codeMMEntity = mmEntities.find(function (mmEntity) {
			return mmEntity.id == codes[i].mmElementID;
		});
		codes[i].mmElement = codeMMEntity;
		
		var node = view.addNode(codes[i].name);
		nodes.set(codes[i].codeID, {
			'code': codes[i],
			'node': node
		});


		console.log('add ' + codes[i].codeID + ' - ' + codes[i].name);

		if (codes[i].relations != null) {
			for (var j = 0; j < codes[i].relations.length; j++) {
				console.log(codes[i].codeID + ' is connected to ' + codes[i].relations[j].codeId);

				relations.push({
					'start': codes[i].codeID,
					'end': codes[i].relations[j].codeId,
					'metaModelEntityId': codes[i].relations[j].mmElementId
				});
			}
		}
	}


	for (var i = 0; i < relations.length; i++) {
		var relation = relations[i];

		let startCode = nodes.get(relation.start);
		let endCode = nodes.get(relation.end);
		
		var metaModelEntity = mmEntities.find(function (mmEntity) {
			return mmEntity.id == relations[i].metaModelEntityId;
		});

		var edgeType = MetaModelMapper.getEdgeType(metaModelEntity, startCode, endCode, view);
	}


	view.applyLayout();
}