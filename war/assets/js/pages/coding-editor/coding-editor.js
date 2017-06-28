import DocumentsView from './Documents/DocumentsView.jsx';

import MetaModel from './CodeView/MetaModel.jsx';
//import CodeRelationsView from './CodeView/CodeRelationsView.jsx';
//import CodingsView from './CodeView/CodingsView.jsx';
import CodeProperties from './CodeView/CodeProperties.jsx';
//import MetaModelView from './CodeView/MetaModelView.jsx';
import CodeMemo from './CodeView/CodeMemo.jsx';
import CodeBookEntry from './CodeView/CodeBookEntry.jsx';
import CodeView from './CodeView/CodeView.jsx';
import Account from '../../common/Account.jsx';
import ReactLoading from '../../common/ReactLoading.jsx';
import EditorCtrl from './EditorCtrl';
import loadGAPIs from '../../common/GAPI';
import Codesystem from './Codesystem/Codesystem.jsx';

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

var codeMemoEditor;
var cbEditor = {
	def: {},
	when: {},
	whenNot: {}
};

var account;
var codingsView;
var codeProperties;

var metaModelView;
var metaModel;
var codeMemo;
var codeBookEntry;
var codeView;

var codeRelationsView

var documentsView;

var codesystemView

var editorCtrl = {};

window.init = function () {
	$("#codeTabs").easytabs({
		animate: true,
		animationSpeed: 100,
		panelActiveClass: "active-content-div",
		defaultTab: "span#defaultCodeTab",
		tabs: "> div > span",
		updateHash: false
	});

	ReactDOM.render(<ReactLoading />, document.getElementById('documentsLoaderMount'));
	ReactDOM.render(<ReactLoading />, document.getElementById('codesystemLoaderMount'));

	editorCtrl = new EditorCtrl(getCodeByCodeID);


	//createCodeMemoEditor();

	// createCodeBookEditor();

	$('.tooltips').tooltipster();


	$("#codePropColor").colorpicker();


	$("#footer").hide();
	$('#navAccount').hide();

	var urlParams = URI(window.location.search).query(true);

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
		//		React.render(<ReactSlider defaultValue={[0, 100]} withBars />, document.body);
		$(".projectDashboardLink").attr('href', 'project-dashboard.html?project=' + urlParams.parentproject + '&type=' + urlParams.parentprojecttype);
	} else {
		$(".projectDashboardLink").attr('href', 'project-dashboard.html?project=' + project_id + '&type=' + project_type);
	}


	loadGAPIs(setupUI).then(
		function (accountModule) {
			account = accountModule;
		}
	);



	$('#document-section').on('hidden.bs.collapse', resizeElements);
	$('#document-section').on('shown.bs.collapse', resizeElements);

	document.getElementById('btnHideFooter').onclick = function () {
		hideCodingView();
	}

	// document.getElementById('btnCodeMemoSave').onclick = function () {
	// 	var code = codesystemView.getSelected();
	// 	code.memo = codeMemoEditor.getHTML();
	// 	updateCode(code);
	// }

	// document.getElementById('btnSaveMetaModelAttr').onclick = function () {
	// 	var code = codesystemView.getSelected();
	// 	code.mmElementIDs = metaModelView.getActiveElementIds()
	// 	updateCode(code);
	// }

	// FIXME possibly move to CodingsView
	// document.getElementById('btnCodeBookEntrySave').onclick = function () {
	// 	var codeBookEntry = {
	// 		definition: cbEditor.def.getHTML(),
	// 		whenToUse: cbEditor.when.getHTML(),
	// 		whenNotToUse: cbEditor.whenNot.getHTML()
	// 	};
	// 	updateCodeBookEntry(codeBookEntry);
	// }

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

function createCodeMemoEditor() {
	var codeMemoIFrame = document.getElementById('codeMemoEditor');
	codeMemoIFrame.onload = function (event) {
		var codeMemoIFrame = document.getElementById('codeMemoEditor');
		var doc = codeMemoIFrame.contentDocument;

		// Create Squire instance
		codeMemoEditor = new Squire(doc);

		var memo = getSelectedCode().memo;
		codeMemoEditor.setHTML(memo ? memo : '');
	}
}

// function createCodeBookEditor() {
//
// 	initializeCodeBookEditor('cbEditorDef', cbEditor, 'def', 'definition');
//
// 	initializeCodeBookEditor('cbEditorWhen', cbEditor, 'when', 'whenToUse');
//
// 	initializeCodeBookEditor('cbEditorWhenNot', cbEditor, 'whenNot', 'whenNotToUse');
//
// }

//
// function initializeCodeBookEditor(pEditorId, pEditor, pEditorProp, pEntryProp) {
// 	var cbWhenNotFrame = document.getElementById(pEditorId);
// 	cbWhenNotFrame.onload = function (event) {
// 		var codeBookEntry = getSelectedCode().codeBookEntry;
//
// 		var cbWhenNotFrame = document.getElementById(pEditorId);
// 		var doc = cbWhenNotFrame.contentDocument;
//
// 		// Create Squire instance
// 		pEditor[pEditorProp] = new Squire(doc);
// 		if (typeof codeBookEntry != 'undefined') {
// 			pEditor[pEditorProp].setHTML(codeBookEntry[pEntryProp]);
// 		}
// 	}
// }

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
	$("#editor").css({
		height: $(window).height() - 52 - offsetFooter - offsetEditMenu
	});

	var codesystemTreeOffset = 0;
	var offset = $("#codesystemTree").offset();
	if ($("#codesystemTree").offset()) codesystemTreeOffset = offset.top;
	codesystemView.setHeight($(window).height() - codesystemTreeOffset - offsetFooter);

	editorCtrl.addCodingBrackets();
}

function setupUI() {
	if (account.isSignedIn()) {
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
				umlEditorEnabled={resp.umlEditorEnabled}
				showFooter={showFooter}
				updateCodeView={updateCodeView}
			/>, document.getElementById('codesystemView')).child; // codesystem is wrapped in DnD components, therefore assign child

			var codesystemLoaded = codesystemView.init();

			documentsLoaded.then(() => {
				codesystemLoaded.then(() => {
					// Initialize coding count bubbles after both codesystem and documents are available
					codesystemView.initCodingCount();
					resizeElements();
				});
			});
			if (resp.umlEditorEnabled) {
				$('#btnOpenUMLEditor').show();
			}
		});
	} else {
		$('#navAccount').hide();
	}
}

function showCodingView() {
	showFooter();
	var activeCode = codesystemView.getSelected();

	//codingsView.updateTable(activeCode);
	codeView.updateCode(activeCode);
	codeProperties.updateData(activeCode);
	codeMemo.updateData(activeCode);
	codeBookEntry.updateData(activeCode)
	fillCodeRelationsView();
	resizeHandler();
}

function showFooter() {
	$("#footer").show("clip", {}, 200, resizeElements);
}

function hideCodingView() {
	$("#footer").hide("clip", {}, 200, resizeElements);

}

function fillCodeRelationsView() {
	var code = codesystemView.getSelected();

	codeRelationsView.setRelations(code.relations, code.id);
}

function getSelectedCode() {
	return codesystemView.getSelected();
}

function updateSelectedCode(code) {
	codesystemView.updateSelected(code);
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

		document.getElementById('documentsToggleBtn').onclick = function () {
			documentsView.toggleIsExpanded();
		}
		//codingsView = ReactDOM.render(<CodingsView editorCtrl={editorCtrl} documentsView={documentsView}/>, document.getElementById('codingtable'));
		codeProperties = ReactDOM.render(<CodeProperties editorCtrl={editorCtrl} documentsView={documentsView} updateCode={updateCode}/>, document.getElementById('codeProperties'));

		metaModel = ReactDOM.render(<MetaModel getSelectedCode={getSelectedCode} updateSelectedCode={updateSelectedCode}  updateCode={updateCode} getCodeByCodeID={getCodeByCodeID} getCodeSystem={getCodeSystem}/>, document.getElementById('metaModelAttributes'));
		codeMemo = ReactDOM.render(<CodeMemo  updateCode={updateCode} />, document.getElementById('codeMemo'));
		codeBookEntry = ReactDOM.render(<CodeBookEntry  updateSelectedCode={updateSelectedCode} />, document.getElementById('codeBookEntry'));
		codeView = ReactDOM.render(<CodeView editorCtrl={editorCtrl} documentsView={documentsView}/>, document.getElementById('codeView'));
		// metaModelView = ReactDOM.render(<MetaModelView filter={"PROPERTY"}/>, document.getElementById('metaModelAttrSelector'));
		//codeRelationsView = ReactDOM.render(<CodeRelationsView metaModelView={metaModelView} getSelectedCode={getSelectedCode} updateSelectedCode={updateSelectedCode} getCodeByCodeID={getCodeByCodeID} getCodeSystem={getCodeSystem}/>, document.getElementById('codeRelationsView'));


	}

	return documentsView.setupView(project_id, project_type, report);
}


// Update Code function
function updateCode(code) {
	CodesEndpoint.updateCode(code).then(function (resp) {
		codesystemView.updateSelected(resp);
	});
}

// function updateCodeBookEntry(codeBookEntry) {
// 	CodesEndpoint.setCodeBookEntry(codesystemView.getSelected().id, codeBookEntry).then(function (resp) {
// 		codesystemView.updateSelected(resp);
// 	});
// }


function updateCodeView(code) {
	if ($("#footer").is(":visible")) {
		//codingsView.updateTable(code);
		codeView.updateCode(code);
		codeProperties.updateData(code);
		codeMemo.updateData(code);
		codeBookEntry.updateData(code);
		metaModel.setCode(code);
		//metaModelView.setActiveIds(code.mmElementIDs);
		//codeRelationsView.setRelations(code.relations, code.id);
		// if (codeMemoEditor != undefined) {
		// 	codeMemoEditor.setHTML(code.memo ? code.memo : '');
		// }
		// if (cbEditor.def != undefined) {
		// 	var codeBookEntry = code.codeBookEntry
		// 	cbEditor.def.setHTML(codeBookEntry.definition);
		// 	cbEditor.when.setHTML(codeBookEntry.whenToUse);
		// 	cbEditor.whenNot.setHTML(codeBookEntry.whenNotToUse);
		// }
	}
}