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
import 'script!../../../../components/EasyTree/jquery.easytree.js';
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

	editorCtrl = new EditorCtrl(easytree);


	createCodeMemoEditor();

	createCodeBookEditor();

	$('.tooltips').tooltipster();

	// codesystem-ui
	$('#btnApplyCode').tooltipster({
		content: $('<span>Apply Code</span>'),
	});

	$('#btnRemoveCoding').tooltipster({
		content: $('<span>Remove Coding</span>'),
	});

	$('#btnCodeProps').tooltipster({
		content: $('<span>Code Properties</span>')
	});

	$('#btnRemoveCode').tooltipster({
		content: $('<span>Delete Code</span>')
	});

	$('#btnInsertCode').tooltipster({
		content: $('<span>New Code</span>')
	});

	$('#btnOpenUMLEditor').tooltipster({
		content: $('<span>Open UML Editor</span>'),
	});

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
		$('#btnInsertCode').show();
		$('#btnRemoveCode').show();
		$('#settings').show();
		$('.projectsOnly').removeClass('projectsOnly');
	} else {
		easytree.options.enableDnd = false;
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


	$("#btnOpenUMLEditor").on("click", function () {
		window.location.href = 'uml-editor.html?project=' + project_id + '&type=' + project_type;
	});

	document.getElementById('btnCodeProps').onclick = function () {
		toggleCodingView();
	}
	
	$("#btnInsertCode").on("click", function () {
		var prompt = new Prompt('Give your code a name', 'Code Name');
		prompt.showModal().then(function (codeName) {
			insertCode(account.getProfile().getName(), codeName);
		});
	});

	$('#document-section').on('hidden.bs.collapse', resizeElements);
	$('#document-section').on('shown.bs.collapse', resizeElements);

	document.getElementById('btnRemoveCode').onclick = function () {
		codesystemView.child.removeCode(); // codesystem is wrapped in DragAndDropContext. actual component is in child
	}

	document.getElementById('btnHideFooter').onclick = function () {
		hideCodingView();
	}

	document.getElementById('btnApplyCode').onclick = function () {
		var activeID = getActiveCode().id;
		if (typeof activeID != 'undefined') {
			ProjectEndpoint.incrCodingId(project_id, project_type).then(function (resp) {
				var codingID = resp.maxCodingID;
				var author = account.getProfile().getName();

				editorCtrl.setCoding(codingID, activeID, getActiveCode().name, author);
				documentsView.updateCurrentDocument(editorCtrl.getHTML());
				easytree.getNode(activeID).codingCount++;
				rebuildTree();
			});
		}
	}

	document.getElementById('btnRemoveCoding').onclick = function () {
		var activeID = getActiveCode().id;
		if (typeof activeID != 'undefined') {
			var slection = editorCtrl.removeCoding(activeID);
			splitupCoding(slection, activeID).then(function (value) {
				easytree.getNode(activeID).codingCount--;
				rebuildTree();
				documentsView.updateCurrentDocument(editorCtrl.getHTML());
				editorCtrl.addCodingBrackets();
			});


		} else {
			window.alert("No code selected.")
		}

	}

	document.getElementById('btnCodeSave').onclick = function () {
		updateCode(getActiveCode().memo, $('#codePropAuthor').val(), $('#codePropName').val(), $('#codePropColor').val(), getActiveCode().dbID, getActiveCode().id, getActiveCode().mmElementID, getActiveCode().relations);

	}

	document.getElementById('btnCodeMemoSave').onclick = function () {
		updateCode(codeMemoEditor.getHTML(), $('#codePropAuthor').val(), $('#codePropName').val(), $('#codePropColor').val(), getActiveCode().dbID, getActiveCode().id, getActiveCode().mmElementID, getActiveCode().relations);

	}

	document.getElementById('btnSaveMetaModelAttr').onclick = function () {
		updateCode(codeMemoEditor.getHTML(), $('#codePropAuthor').val(), $('#codePropName').val(), $('#codePropColor').val(), getActiveCode().dbID, getActiveCode().id, metaModelView.getActiveElementId(), getActiveCode().relations);

	}

	// FIXME possibly move to CodingsView
	document.getElementById('btnCodeBookEntrySave').onclick = function () {
		var codeBookEntry = {};
		codeBookEntry.definition = cbEditor.def.getHTML();
		codeBookEntry.whenToUse = cbEditor.when.getHTML();
		codeBookEntry.whenNotToUse = cbEditor.whenNot.getHTML();
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

		codeMemoEditor.setHTML(getActiveCode().memo);
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
		var codeBookEntry = getActiveCode().codeBookEntry;

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

var easytree = $('#easytree-section').easytree({
	enableDnd: true,
	dropped: dropped,
	stateChanged: codesystemStateChanged,
	ordering: 'orderedFolder'
});


function setupUI() {
	if (account.isSignedIn()) {
		var profile = account.getProfile();

		$('#navAccount').show();
		$('#navSignin').hide();
		ProjectEndpoint.getProject(project_id, project_type).then(function (resp) {
			codesystem_id = resp.codesystemID;
			setDocumentList(project_id);
			listCodes();
			codesystemView = ReactDOM.render(<Codesystem projectID={project_id} 
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
	var activeCode = codesystemView.getSelected();

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
	var code = getActiveCode();

	codeRelationsView.setRelations(code.relations, easytree, getActiveCode().dbID, getActiveCode().id);
}

function setDocumentList(projectID) {
	if (typeof documentsView == 'undefined') {
		documentsView = ReactDOM.render(<DocumentsView editorCtrl={editorCtrl} projectID={project_id} projectType={project_type}/>, document.getElementById('documentView'));

		document.getElementById('documentsToggleBtn').onclick = function () {
			documentsView.toggleIsExpanded();
		}
		codingsView = new CodingsView(editorCtrl, documentsView);

		metaModelView = ReactDOM.render(<MetaModelView filter={"PROPERTY"}/>, document.getElementById('metaModelAttrSelector'));
		codeRelationsView = ReactDOM.render(<CodeRelationsView metaModelView={metaModelView}/>, document.getElementById('codeRelationsView'));


	}

	documentsView.setupView(project_id, project_type, report).then(function (codeName) {
		addCodingCountToTree();
		resizeElements();
	});
}


// List Codes function that will execute the listCode call
function listCodes() {
	var codes = [];
	CodesystemEndpoint.getCodeSystem(codesystem_id).then(function (resp) {
		// clear codesystem in easytree object
		easytree.rebuildTree([]);


		resp.items = resp.items || [];

		for (var i = 0; i < resp.items.length; i++) {
			codes.push(resp.items[i]);
		}

		for (var i = 0; i < codes.length; i++) {
			addNodeToTree(codes[i].codeID, codes[i].id, codes[i].name, codes[i].author, codes[i].color, codes[i].parentID, codes[i].subCodesIDs, codes[i].memo, codes[i].codeBookEntry, codes[i].mmElementID, codes[i].relations);
		}

		for (var i = 0; i < codes.length; i++) {
			if (typeof codes[i].subCodesIDs != 'undefined') {
				if (codes[i].subCodesIDs.length > 0) {

					for (var j = 0; j < codes.length; j++) {
						for (var k = 0; k < codes[i].subCodesIDs.length; k++) {
							if (codes[i].subCodesIDs[k] == codes[j].codeID) {
								relocateNode(codes[j].codeID, codes[i].codeID);
							}
						}
					}
				}
			}
		}

		activateRootNode();
		addCodingCountToTree();
		$("#codesystemLoadingDiv").addClass("hidden");

	});
}

// Insert Code function
function insertCode(_AuthorName, _CodeName) {
	var activeID = getActiveCode().id;
	// Build the Request Object
	var requestData = {};
	requestData.author = _AuthorName;
	requestData.name = _CodeName;
	requestData.subCodesIDs = new Array();
	if (activeID != 'undefined') requestData.parentID = activeID;
	requestData.codesystemID = codesystem_id;
	requestData.color = "#000000";

	CodesEndpoint.insertCode(requestData).then(function (resp) {
		addNodeToTree(resp.codeID, resp.id, resp.name, resp.author, resp.color, resp.parentID, resp.subCodesIDs, resp.memo, resp.codeBookEntry, resp.mmElementID, resp.relations);
		if (activeID != 'undefined') {
			relocateNode(resp.codeID, activeID);
			setSubCodeIDs(easytree.getNode(resp.parentID));
		}
	});
}

// Update Code function
function updateCode(_Memo, _AuthorName, _CodeName, _CodeColor, _ID, _CodeID, _mmElementID, _relations) {
	// Build the Request Object
	var requestData = {};
	requestData.id = _ID;
	requestData.codeID = _CodeID;
	requestData.author = _AuthorName;
	requestData.name = _CodeName;
	requestData.color = _CodeColor;
	requestData.memo = _Memo;
	requestData.codesystemID = codesystem_id;
	requestData.parentID = getActiveCode().parentID;
	requestData.subCodesIDs = getActiveCode().subCodesIDs;
	requestData.mmElementID = _mmElementID;
	requestData.relations = _relations;
	CodesEndpoint.updateCode(requestData).then(function (resp) {

		updateNode(resp.codeID, resp.name, resp.author, resp.color, resp.memo, resp.codeBookEntry, resp.mmElementID, resp.relations);
	});
}

function updateCodeBookEntry(codeBookEntry) {
	CodesEndpoint.setCodeBookEntry(getActiveCode().dbID, codeBookEntry).then(function (resp) {
		updateNode(resp.codeID, resp.name, resp.author, resp.color, resp.memo, codeBookEntry, resp.mmElementID, resp.relations);
	});
}


function relocateCode(code, newParentCode) {
	CodesEndpoint.relocateCode(code.dbID, newParentCode.id).then(function (resp) {
		code.parentID = newParentCode.id;
		console.log("Updated logation of code:" + resp.id + " |  " + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
	});
}



function setSubCodeIDs(node) {
	var _ID = node.dbID;
	var subCodeIDs = getSubCodeIDs(node);

	CodesEndpoint.getCode(_ID).then(function (resp) {

		resp.subCodesIDs = subCodeIDs;

		CodesEndpoint.updateCode(resp).then(function (resp2) {
			console.log("Updated: ID" + resp2.id + " SubCodeIDs:" + resp2.subCodesIDs);
		});
	});
}

function getSubCodeIDs(node) {
	var children = node.children;
	var subCodeIDs = [];
	if (typeof children == 'undefined') return subCodeIDs;

	for (var i = children.length - 1; i >= 0; i--) {
		subCodeIDs.push(children[i].id);
	}
	return subCodeIDs;
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

// Delete code function
function deleteCode() {
	var activeID = getActiveCode().dbID;
	if (typeof activeID == 'undefined') {
		window.alert("No code selected");
		return;
	} else {
		// Build the Request Object
		var requestData = {};
		requestData.id = activeID;
		CodesEndpoint.removeCode(requestData).then(function (resp) {
			removeAllCodings(getActiveCode().id);
			removeNodeFromTree(getActiveCode().id);
		});
	}

}

function addNodeToTree(id, dbID, name, author, color, parentID, subCodesIDs, memo, codeBookEntry, mmElementID, relations) {
	var sourceNode = {};
	sourceNode.text = name;
	sourceNode.isFolder = true;
	sourceNode.id = id;
	sourceNode.dbID = dbID;
	sourceNode.codingCount = 0;
	sourceNode.uiIcon = "fa-tag fa-lg";
	sourceNode.author = author;
	sourceNode.color = color;
	sourceNode.parentID = parentID;
	sourceNode.codeBookEntry = codeBookEntry;
	sourceNode.mmElementID = mmElementID;
	sourceNode.subCodesIDs = subCodesIDs;
	sourceNode.relations = relations;
	if (typeof subCodesIDs == 'undefined') sourceNode.subCodesIDs = [];
	if (memo == undefined) memo = "";
	sourceNode.memo = memo;

	sourceNode.onclick = function () {
		window.alert("test");
	}

	easytree.addNode(sourceNode);
	rebuildTree();
}

function addCodingCountToTree() {

	var nodes = easytree.getAllNodes();
	var codeIDs = getAllCodeIds(nodes);

	for (var i = 0; i < codeIDs.length; i++) {
		var codingCount = 0;
		var documents = documentsView.getDocuments();
		for (var index in documents) {
			var doc = documents[index];
			var elements = doc.text;
			var foundArray = $('coding[code_id=\'' + codeIDs[i] + '\']', elements).map(function () {
				return $(this).attr('id');
			});
			var idsCounted = []; // When a coding spans multiple HTML blocks,
			// then there will be multiple elements with
			// the same ID
			for (var j = 0; j < foundArray.length; j++) {
				if ($.inArray(foundArray[j], idsCounted) != -1)
					continue;
				codingCount++;
				idsCounted.push(foundArray[j]);
			}
		}
		var node = easytree.getNode(codeIDs[i]);

		node.codingCount = codingCount;
	}
	rebuildTree();
}

function activateRootNode() {
	easytree.getAllNodes()[0].isActive = true;
}

function rebuildTree() {
	easytree.rebuildTree();
	$(".codingCountBubble").click(showFooter).css('cursor', 'pointer');
}

function removeNodeFromTree(id) {

	easytree.removeNode(id);
	rebuildTree();
}

function relocateNode(id, target) {

	var sourceNode = easytree.getNode(id);
	sourceNode.isFolder = true;
	var targetId = target;
	easytree.removeNode(id);

	easytree.addNode(sourceNode, target);
	rebuildTree();
}

function updateNode(id, name, author, color, memo, codeBookEntry, mmElementID, relations) {

	var sourceNode = easytree.getNode(id);
	sourceNode.text = name;
	sourceNode.author = author;
	sourceNode.color = color;
	sourceNode.memo = memo;
	sourceNode.codeBookEntry = codeBookEntry;
	sourceNode.mmElementID = mmElementID;
	sourceNode.relations = relations;
	rebuildTree();
}

function getCodeColor(id, target) {
	var node = easytree.getNode(id);
	if (node != null) return node.color;
	else return "#000";
}

function getActiveCode() {
	var nodes = easytree.getAllNodes();
	var activeNode = getActiveNodeRecursive(nodes);

	var code = {};
	if (typeof activeNode == 'undefined') {
		code.id = 'undefined';
		code.dbID = 'undefined';
		code.name = 'undefined';
		code.author = 'undefined';
		code.color = 'undefined';
	} else {
		code.id = activeNode.id;
		code.dbID = activeNode.dbID;
		code.name = activeNode.text;

		code.author = activeNode.author;
		code.color = activeNode.color;
		code.parentID = activeNode.parentID;
		code.subCodesIDs = activeNode.subCodesIDs;
		code.memo = activeNode.memo;
		code.codeBookEntry = activeNode.codeBookEntry;
		code.mmElementID = activeNode.mmElementID;
		code.relations = activeNode.relations;
	}
	return code;

}

function getActiveNodeRecursive(nodes) {
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].isActive == true) {
			return nodes[i];
		}
		if (nodes[i].children && nodes[i].children.length > 0) {
			var result = getActiveNodeRecursive(nodes[i].children);
			if (typeof result != 'undefined')
				return result;
		}
	}
}

function getAllCodeIds(nodes) {
	var ids = [];
	for (var i = 0; i < nodes.length; i++) {
		ids.push(nodes[i].id);
		if (nodes[i].children && nodes[i].children.length > 0) {

			var result = getAllCodeIds(nodes[i].children);
			ids = ids.concat(result);
		}
	}
	return ids;
}

function dropped(event, nodes, isSourceNode, source, isTargetNode, target) {

	if (isSourceNode && isTargetNode) { // internal to internal drop
		relocateCode(source, target);
	}
}

var initialized_easytree = false;

function codesystemStateChanged(nodes, nodesJson) {
	if (initialized_easytree) {
		var active_code = getActiveCode().id;
		if ($("#footer").is(":visible")) {
			updateCodeView(active_code);
		}
	} else {
		initialized_easytree = true;
	}
}

function updateCodeView(code){
	if ($("#footer").is(":visible")) {
		fillCodingTable(code);
		fillPropertiesView(code);
		metaModelView.setActiveId(code.mmElementID);
		codeRelationsView.setRelations(code.relations, easytree, code.id, code.codeID);
		if (codeMemoEditor != undefined) codeMemoEditor.setHTML(code.memo);
		if (cbEditor.def != undefined) {
			var codeBookEntry = code.codeBookEntry
			cbEditor.def.setHTML(codeBookEntry.definition);
			cbEditor.when.setHTML(codeBookEntry.whenToUse);
			cbEditor.whenNot.setHTML(codeBookEntry.whenNotToUse);
		}
	}
}