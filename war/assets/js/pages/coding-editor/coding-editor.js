import DocumentsView from './Documents/DocumentsView.jsx';

import {
	PageView
} from './View/PageView.js';

import CodeView from './CodeView/CodeView.jsx';
import Account from '../../common/Account.jsx';
import ReactLoading from '../../common/ReactLoading.jsx';
import EditorCtrl from './EditorCtrl';
import loadGAPIs from '../../common/GAPI';
import Codesystem from './Codesystem/Codesystem.jsx';
import PageViewChooser from './View/PageViewChooser.jsx';
import UmlEditor from '../uml-editor/UmlEditor.jsx';
import ProjectDashboardButton from './Settings/ProjectDashboardButton.jsx';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesEndpoint from '../../common/endpoints/CodesEndpoint';

import $script from 'scriptjs';

import 'script!../../../../components/tooltipster/js/jquery.tooltipster.js';
import 'script!../../../../components/URIjs/URI.min.js';

import 'script!../../../../assets/js/common/ErrorHandler.js'


$script('https://apis.google.com/js/platform.js', function () {
	$script('https://apis.google.com/js/client.js?onload=init', 'google-api');
});

var codesystem_id;
var project_id;
var project_type;
var report;
var urlParams;

var account;

var codeView;
var documentsView;
var codesystemView
var umlEditor;
var pageViewChooser;

var editorCtrl = {};

window.init = function () {

	ReactDOM.render(<ReactLoading color="#555"/>, document.getElementById('documentsLoaderMount'));
	ReactDOM.render(<ReactLoading color="#555"/>, document.getElementById('codesystemLoaderMount'));

	editorCtrl = new EditorCtrl(getCodeByCodeID);


	$('.tooltips').tooltipster();
	$("#footer").hide();
	$('#navAccount').hide();

	urlParams = URI(window.location.search).query(true);

	project_id = urlParams.project;
	project_type = urlParams.type;
	report = urlParams.report;
	if (typeof project_type == 'undefined') {
		project_type = "PROJECT";
	}
	if (project_type == "PROJECT") {
		$('#settings').show();
		$('.projectsOnly').removeClass('projectsOnly');
	}

	if (typeof report != 'undefined') {
		editorCtrl.showsAgreementMap(true);
	}


	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);
	$('#document-section').on('hidden.bs.collapse', resizeElements);
	$('#document-section').on('shown.bs.collapse', resizeElements);

	document.getElementById('btnTxtSave').onclick = function () {
		documentsView.updateCurrentDocument(editorCtrl.getHTML());
	}

	$('#textdocument-menu').on('shown.bs.collapse', function () {
		editorCtrl.setReadOnly(false);
		resizeElements();
	})

	$('#textdocument-menu').on('hidden.bs.collapse', function () {
		editorCtrl.setReadOnly(true);
		resizeElements();
	})

}

function toggleCodingView() {
	if ($("#footer").is(":visible")) {
		hideCodingView();
	} else {
		showCodingView();
	}
}

window.onresize = resizeHandler;

function resizeHandler() {
	var filteredParagraphs = $('p').filter(function () {
		return $(this).attr("falsenegcount") > 0;
	}).css("backgroundColor", "yellow");
	setTimeout(function () {
		resizeElements();
	}, 250);
}

function resizeElements() {
	var offsetFooter = 0;
	if ($("#footer").is(":visible")) {
		offsetFooter += 341;
	}

	var offsetEditMenu = 0;
	if ($("#textdocument-menu").is(":visible")) {
		offsetEditMenu += 45;
	}
	var editorHeight = $(window).height() - 52 - offsetFooter - offsetEditMenu;
	$("#editor").css({
		height: editorHeight
	});
	$("#umlEditorContainer").css({
		height: editorHeight
	});

	var codesystemTreeOffset = 0;
	var offset = $("#codesystemTree").offset();
	if ($("#codesystemTree").offset()) codesystemTreeOffset = offset.top;
	if (codesystemView != null) codesystemView.setHeight($(window).height() - codesystemTreeOffset - offsetFooter);

	editorCtrl.addCodingBrackets();
}

function setupUI() {
	if (account.isSignedIn()) {

		// Is mxGraph supported?
		if (!mxClient.isBrowserSupported()) {
			mxUtils.error('Browser is not supported!', 200, false);
		}

		var profile = account.getProfile();

		$('#navAccount').show();
		$('#navSignin').hide();
		ProjectEndpoint.getProject(project_id, project_type).then(function (resp) {
			codesystem_id = resp.codesystemID;

			var documentsLoaded = setDocumentList(project_id);

			codesystemView = ReactDOM.render(<Codesystem
				projectID={project_id}
				projectType={project_type}
				account={account}
				codesystemId={codesystem_id}
				toggleCodingView={toggleCodingView}
				editorCtrl={editorCtrl}
				documentsView={documentsView}
				showFooter={showFooter}
				selectionChanged={selectionChanged}
				insertCode={insertCode}
				removeCode={removeCode}
				umlEditor={umlEditor}
			/>, document.getElementById('codesystemView')).child; // codesystem is wrapped in DnD components, therefore assign child

			umlEditor = ReactDOM.render(<UmlEditor 
				codesystemId={codesystem_id} 
				codesystemView={codesystemView} 
				updateCode={updateSelectedCode} 
				refreshCodeView={refreshCodeView} 
			/>, document.getElementById('umlEditorContainer'));
			codesystemView.setUmlEditor(umlEditor);

			pageViewChooser = ReactDOM.render(<PageViewChooser 
				viewChanged={viewChanged}
				umlEditorEnabled={resp.umlEditorEnabled} 
			/>, document.getElementById('pageViewChooser-ui'));


			let projId = project_id;
			let projType = project_type;

			if (typeof report != 'undefined') {
				projId = urlParams.parentproject;
				projType = urlParams.parentprojecttype;
			}

			ReactDOM.render(<ProjectDashboardButton 
					projectId={projId}
					projectType={projType} 
				/>, document.getElementById('projectDashboardButton-ui'));


			var codesystemLoaded = codesystemView.init();

			documentsLoaded.then(() => {
				codesystemLoaded.then(() => {
					umlEditor.codesystemFinishedLoading();

					// Initialize coding count bubbles after both codesystem and documents are available
					codesystemView.initCodingCount();
					resizeElements();
				});
			});
		});
	} else {
		$('#navAccount').hide();
	}
}

function viewChanged(view) {
	if (view == PageView.TEXT) {
		$('#project-ui').show();
		$('#documents-ui').show();
		$('#editor').show();
		$('#umlEditorContainer').hide();
	} else if (view == PageView.UML) {
		$('#project-ui').hide();
		$('#documents-ui').hide();
		$('#editor').hide();
		$('#umlEditorContainer').show();
	}

	codesystemView.pageViewChanged(view);

	resizeHandler();
}

function showCodingView() {
	showFooter();
	var activeCode = codesystemView.getSelected();

	codeView.updateCode(activeCode);
	resizeHandler();
}

function showFooter() {
	$("#footer").show("clip", {}, 200, resizeElements);
}

function hideCodingView() {
	$("#footer").hide("clip", {}, 200, resizeElements);

}

function updateSelectedCode(code, persist) {
	codesystemView.updateSelected(code, persist);
	umlEditor.codeUpdated(code);
}

function refreshCodeView(code) {
	codeView.updateCode(code);
}

function insertCode(code) {
	umlEditor.codeUpdated(code);
}

function removeCode(code) {
	umlEditor.codeRemoved(code);
}

function getCodeByCodeID(codeID) {
	return codesystemView.getCodeByCodeID(codeID);
}

function getCodeSystem() {
	return codesystemView.getCodesystem();
}

function setDocumentList(projectID) {
	if (typeof documentsView == 'undefined') {
		documentsView = ReactDOM.render(<DocumentsView editorCtrl={editorCtrl} projectID={project_id} projectType={project_type}/>, document.getElementById('documentView'));

		codeView = ReactDOM.render(<CodeView editorCtrl={editorCtrl} documentsView={documentsView} updateSelectedCode={updateSelectedCode} getCodeByCodeID={getCodeByCodeID} getCodeSystem={getCodeSystem} hideCodingView={hideCodingView}/>, document.getElementById('codeView'));
	}

	return documentsView.setupView(project_id, project_type, report);
}

function selectionChanged(code) {
	if ($("#footer").is(":visible")) {
		codeView.updateCode(code);
	}

	umlEditor.codesystemSelectionChanged(code);
}