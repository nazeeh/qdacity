import DocumentsView from './DocumentsView.jsx';
import CodeRelationsView from './CodeRelationsView.jsx';
import CodingsView from './CodingsView.js';
import MetaModelView from './MetaModelView.jsx';

import Account from '../../common/Account.jsx';
import ReactLoading from '../../common/ReactLoading.jsx';
import EditorCtrl from './EditorCtrl';
import Prompt from '../../common/modals/Prompt';
import loadGAPIs from '../../common/GAPI';
import Codesystem from './Codesystem/Codesystem.jsx';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';
import CodesEndpoint from '../../common/endpoints/CodesEndpoint';

import $script from 'scriptjs';

import Slider from 'bootstrap-slider';

import 'script!../../../../components/tooltipster/js/jquery.tooltipster.js';
import 'script!../../../../components/filer/js/jquery.filer.min.js';
import 'script!../../../../components/colorpicker/evol.colorpicker.js';
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

var metaModelView;

var codeRelationsView

var documentsView;

var codesystemView

var editorCtrl = {};

window.init = function () {

	ReactDOM.render(<ReactLoading />, document.getElementById('documentsLoaderMount'));
	ReactDOM.render(<ReactLoading />, document.getElementById('codesystemLoaderMount'));

	editorCtrl = new EditorCtrl(getCodeByCodeID);


	createCodeMemoEditor();

	createCodeBookEditor();

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
	document.getElementById('btnCodeSave').onclick = function () {
		var code = codesystemView.child.getSelected();
		code.author = $('#codePropAuthor').val();
		code.name = $('#codePropName').val();
		code.color = $('#codePropColor').val();
		updateCode(code);

	}

	document.getElementById('btnCodeMemoSave').onclick = function () {
		var code = codesystemView.child.getSelected();
		code.memo = codeMemoEditor.getHTML();
		updateCode(code);
	}

	document.getElementById('btnSaveMetaModelAttr').onclick = function () {
		var code = codesystemView.child.getSelected();
		code.mmElementID = metaModelView.getActiveElementId()
		updateCode(code);
	}

	// FIXME possibly move to CodingsView
	document.getElementById('btnCodeBookEntrySave').onclick = function () {
		var codeBookEntry = {
				definition: cbEditor.def.getHTML(),
				whenToUse: cbEditor.when.getHTML(),
				whenNotToUse: cbEditor.whenNot.getHTML()
		};
		updateCodeBookEntry(codeBookEntry);
	}

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

function toggleCodingView(){
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

		codeMemoEditor.setHTML(getSelectedCode().memo);
	}
}

function createCodeBookEditor() {

	initializeCodeBookEditor('cbEditorDef', cbEditor, 'def', 'definition');

	initializeCodeBookEditor('cbEditorWhen', cbEditor, 'when', 'whenToUse');

	initializeCodeBookEditor('cbEditorWhenNot', cbEditor, 'whenNot', 'whenNotToUse');

}


function initializeCodeBookEditor(pEditorId, pEditor, pEditorProp, pEntryProp) {
	var cbWhenNotFrame = document.getElementById(pEditorId);
	cbWhenNotFrame.onload = function (event) {
		var codeBookEntry = getSelectedCode().codeBookEntry;

		var cbWhenNotFrame = document.getElementById(pEditorId);
		var doc = cbWhenNotFrame.contentDocument;

		// Create Squire instance
		pEditor[pEditorProp] = new Squire(doc);
		if (typeof codeBookEntry != 'undefined') {
			pEditor[pEditorProp].setHTML(codeBookEntry[pEntryProp]);
		}
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
	$("#editor").css({
		height: $(window).height() - 52 - offsetFooter - offsetEditMenu
	});

	var codesystemTreeOffset = $("#easytree-section").offset().top
	$("#easytree-section").css({
		height: $(window).height() - codesystemTreeOffset - offsetFooter
	});
	editorCtrl.addCodingBrackets();
}

function setupUI() {
	if (account.isSignedIn()) {
		var profile = account.getProfile();

		$('#navAccount').show();
		$('#navSignin').hide();
		ProjectEndpoint.getProject(project_id, project_type).then(function (resp) {
			codesystem_id = resp.codesystemID;
			setDocumentList(project_id);
			codesystemView = ReactDOM.render(<Codesystem 
				projectID={project_id} 
				projectType={project_type}
				account={account} 
				codesystemId={codesystem_id} 
				removeAllCodings={removeAllCodings} 
				toggleCodingView={toggleCodingView}  
				editorCtrl={editorCtrl}  
				documentsView={documentsView} 
				umlEditorEnabled={resp.umlEditorEnabled}
				showFooter={showFooter}
				updateCodeView={updateCodeView}
			/>, document.getElementById('codesystemView'));
			if (resp.umlEditorEnabled) {
				$('#btnOpenUMLEditor').show();
			}
		});
	} else {
		$('#navAccount').hide();
	}
	//resizeHandler();
}

function splitupCoding(selection, codeID) {
	var promise = new Promise(
		function (resolve, reject) {
			var anchor = $(selection._sel.anchorNode);
			var codingID = anchor.prev('coding[code_id=' + codeID + ']').attr('id');
			if (typeof codingID == 'undefined') codingID = anchor.parentsUntil('p').parent().prev().find('coding[code_id=' + codeID + ']').last().attr('id');
			if (typeof codingID == 'undefined') codingID = anchor.parent().prev().find('coding[code_id=' + codeID + ']').last().attr('id'); // Case beginning of paragraph to middle of paragraph

			if (typeof codingID != 'undefined') {
				ProjectEndpoint.incrCodingId(project_id, project_type).then(function (resp) {
					anchor.nextAll('coding[id=' + codingID + ']').attr("id", resp.maxCodingID);
					anchor.parentsUntil('p').parent().nextAll().find('coding[id=' + codingID + ']').attr("id", resp.maxCodingID);
					anchor.parent().nextAll().find('coding[id=' + codingID + ']').attr("id", resp.maxCodingID); // Case beginning of paragraph to middle of paragraph
					resolve();
				});
			} else {
				resolve();
			}
		}
	);

	return promise;
}

function removeAllCodings(codingID) {
	var documents = documentsView.getDocuments();
	var activeDocId = documentsView.getActiveDocumentId();

	for (var i in documents) {
		var doc = documents[i];
		var elements = $('<div>' + doc.text + '</div>');
		var originalText = elements.html();
		elements.find('coding[code_id=\'' + codingID + '\']').contents().unwrap();
		var strippedText = elements.html();
		if (strippedText !== originalText) {
			doc.text = strippedText;
			documentsView.changeDocumentData(doc);
			if (activeDocId === doc.id) editorCtrl.setDocumentView(doc);
		}
	}
}

function showCodingView() {
	showFooter();
	var activeCode = codesystemView.child.getSelected();

	fillCodingTable(activeCode);
	fillPropertiesView(activeCode);
	fillCodeRelationsView();
	resizeHandler();
}

function showFooter() {
	$("#footer").show("clip", {}, 200, resizeElements);
}

function hideCodingView() {
	$("#footer").hide("clip", {}, 200, resizeElements);

}

function fillCodingTable(code) {
	var documents = documentsView.getDocuments();
	codingsView.fillCodingTable(code.codeID, documents);
}

//FIXME possibly move to CodingsView
function fillPropertiesView(code) {
	$("#codePropName").val(code.name);
	$("#codePropAuthor").val(code.author);
	$("#codePropColor").colorpicker({
		color: code.color
	});
}

function fillCodeRelationsView() {
	var code = codesystemView.child.getSelected();

	codeRelationsView.setRelations(code.relations, code.id);
}

function getSelectedCode(){
	return codesystemView.child.getSelected();
}
function updateSelectedCode(code){
	codesystemView.child.updateSelected(code);
}
function getCodeByCodeID(codeID){
	return codesystemView.child.getCodeByCodeID(codeID);
}
function getCodeSystem(){
	return codesystemView.child.getCodesystem();
}

function setDocumentList(projectID) {
	if (typeof documentsView == 'undefined') {
		documentsView = ReactDOM.render(<DocumentsView editorCtrl={editorCtrl} projectID={project_id} projectType={project_type}/>, document.getElementById('documentView'));

		document.getElementById('documentsToggleBtn').onclick = function () {
			documentsView.toggleIsExpanded();
		}
		codingsView = new CodingsView(editorCtrl, documentsView);

		metaModelView = ReactDOM.render(<MetaModelView filter={"PROPERTY"}/>, document.getElementById('metaModelAttrSelector'));
		codeRelationsView = ReactDOM.render(<CodeRelationsView metaModelView={metaModelView} getSelectedCode={getSelectedCode} updateSelectedCode={updateSelectedCode} getCodeByCodeID={getCodeByCodeID} getCodeSystem={getCodeSystem}/>, document.getElementById('codeRelationsView'));


	}

	documentsView.setupView(project_id, project_type, report).then(function (codeName) {
		resizeElements();
	});
}


// Update Code function
function updateCode(code) {
	CodesEndpoint.updateCode(code).then(function (resp) {
		codesystemView.child.updateSelected(resp);
	});
}

function updateCodeBookEntry(codeBookEntry) {
	CodesEndpoint.setCodeBookEntry(codesystemView.child.getSelected().id, codeBookEntry).then(function (resp) {
		codesystemView.child.updateSelected(resp);
	});
}




function changeParentId(code, _newParent) {
	CodesEndpoint.getCode(code.dbID).then(function (resp) {

		resp.parentID = _newParent;

		CodesEndpoint.updateCode(resp).then(function (resp2) {
			console.log("Updated Code " + resp2.id + ":" + resp2.author + ":" + resp2.name + ":" + resp2.subCodesIDs);
			code.parentID = _newParent;
		});

	});
}


function updateCodeView(code){
	if ($("#footer").is(":visible")) {
		fillCodingTable(code);
		fillPropertiesView(code);
		metaModelView.setActiveId(code.mmElementID);
		codeRelationsView.setRelations(code.relations, code.id);
		if (codeMemoEditor != undefined) codeMemoEditor.setHTML(code.memo);
		if (cbEditor.def != undefined) {
			var codeBookEntry = code.codeBookEntry
			cbEditor.def.setHTML(codeBookEntry.definition);
			cbEditor.when.setHTML(codeBookEntry.whenToUse);
			cbEditor.whenNot.setHTML(codeBookEntry.whenNotToUse);
		}
	}
}