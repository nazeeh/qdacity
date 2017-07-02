import MetaModelMapper from './MetaModelMapper.js';
import UmlEditorView from './UmlEditorView.js';

import Account from '../../common/Account.jsx';
import loadGAPIs from '../../common/GAPI';

import Toolbar from './toolbar/Toolbar.jsx';
import UnmappedCodesView from './sidebar/UnmappedCodesView.jsx';

import UmlCodePositionEndpoint from '../../common/endpoints/UmlCodePositionEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';
import MetaModelEntityEndpoint from '../../common/endpoints/MetaModelEntityEndpoint';
import MetaModelRelationEndpoint from '../../common/endpoints/MetaModelRelationEndpoint';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';

import 'script!../../../../components/URIjs/URI.min.js';

import $script from 'scriptjs';

$script('https://apis.google.com/js/platform.js', function () {
	$script('https://apis.google.com/js/client.js?onload=init', 'google-api');
});

var page_loaded;

var project_id;
var project_type;

var account;

var umlEditorView;
var metaModelMapper;
var toolbar;
var unmappedCodesView;

window.init = function () {

	var urlParams = URI(window.location.search).query(true);

	page_loaded = false;
	
	project_id = urlParams.project;
	project_type = urlParams.type;


	if (!mxClient.isBrowserSupported()) {
		// Displays an error message if the browser is not supported.
		mxUtils.error('Browser is not supported!', 200, false);
	}

	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);
}

function setupUI() {
	if (page_loaded) {
		return;
	}
	page_loaded = true;	
	
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

			MetaModelRelationEndpoint.listRelations(1).then(function (resp) {
				var mmRelations = resp.items || [];

				init(codes, mmEntities, mmRelations, codesystem_id);
			});
		});
	});
}

function init(codes, mmEntities, mmRelations, codesystem_id) {
	let container = document.getElementById('graphContainer');
	umlEditorView = new UmlEditorView(codesystem_id, container);

	metaModelMapper = new MetaModelMapper(umlEditorView, mmEntities);

	toolbar = ReactDOM.render(<Toolbar umlEditorView={umlEditorView} />, document.getElementById('toolbar'));

	unmappedCodesView = ReactDOM.render(<UnmappedCodesView umlEditorView={umlEditorView} />, document.getElementById('sidebar'));

	umlEditorView.initGraph(codes, mmEntities, mmRelations, metaModelMapper, unmappedCodesView);
}