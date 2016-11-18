import DocumentsView from './DocumentsView.jsx';
import CodingsView from './CodingsView.js';

import Account from '../Account.jsx';
import ReactLoading from '../ReactLoading.jsx';
import DocumentsCtrl from './DocumentsCtrl';
import EditorCtrl from './EditorCtrl';
import Prompt from '../modals/Prompt';
import $script from 'scriptjs';

import 'script!../../../components/tooltipster/js/jquery.tooltipster.js';
import 'script!../../../components/filer/js/jquery.filer.min.js';
import 'script!../../../components/EasyTree/jquery.easytree.js';
import 'script!../../../components/loading/loadingoverlay.js';
import 'script!../../../components/colorpicker/evol.colorpicker.js';
import 'script!../../../components/URIjs/URI.min.js';

import 'script!../../../assets/js/ErrorHandler.js';


$script('https://apis.google.com/js/platform.js', function() {
	$script('https://apis.google.com/js/client.js?onload=init','google-api');
	});
  
var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';

var codesystem_id;
var project_id;
var project_type;
var max_coding_id;
 
var codeMemoEditor;
var cbEditorDef;
var cbEditorWhen;
var cbEditorWhenNot;

var account;
var codingsView;


var documentsView;
var documentsCtrl = {};

var editorCtrl = {};

  window.init = function()  {
	 
	ReactDOM.render(<ReactLoading />, document.getElementById('documentsLoaderMount'));
	ReactDOM.render(<ReactLoading />, document.getElementById('codesystemLoaderMount'));

	editorCtrl = new EditorCtrl(easytree);
	createCodeMemoEditor(); 
	
	createCodeBookEditor();
	
	$('.tooltips').tooltipster();

	// codesystem-ui
	$('#btnApplyCode').tooltipster({
		content : $('<span>Apply Code</span>'),
	});

	$('#btnRemoveCoding').tooltipster({
		content : $('<span>Remove Coding</span>'),
	});

	$('#btnCodeProps').tooltipster({
		content : $('<span>Code Properties</span>')
	});

	$('#btnRemoveCode').tooltipster({
		content : $('<span>Delete Code</span>')
	});

	$('#btnInsertCode').tooltipster({
		content : $('<span>New Code</span>')
	});

	$("#codePropColor").colorpicker();

	
	$("#footer").hide();
	$('#navAccount').hide();

	// the toggle is later hooked to the
	// visibility of the toolbar
	var urlParams = URI(window.location.search).query(true);
  	
	project_id = urlParams.project;
	project_type = urlParams.type;
	if (typeof project_type == 'undefined'){
		project_type = "PROJECT";
	}
	if (project_type == "PROJECT"){
		$('#btnInsertCode').show();
		$('#btnRemoveCode').show();
		$('#settings').show();
		$('.projectsOnly').removeClass('projectsOnly');
	} else {
		easytree.options.enableDnd = false;
	}

	$(".projectDashboardLink").attr('href', 'project-dashboard.html?project=' + project_id+'&type='+project_type);

	var apisToLoad;
	var callback = function() {
		if (--apisToLoad == 0) {
			account = ReactDOM.render(<Account  client_id={client_id} scopes={scopes} callback={setupUI}/>, document.getElementById('accountView'));
		}

	}

	apisToLoad = 2;
	// Parameters are APIName,APIVersion,CallBack function,API Root
	gapi.client.load('qdacity', 'v3', callback, 'https://3-dot-qdacity-app.appspot.com/_ah/api');
	gapi.load('auth2', callback);

	document.getElementById('btnCodeProps').onclick = function() {
		if ($("#footer").is(":visible")) {
			hideCodingView();
		} else {
			showCodingView();
		}
	}

	$("#btnInsertCode").on("click", function() {
		var prompt = new Prompt('Give your code a name', 'Code Name');
		prompt.showModal().then(function(codeName) {
				insertCode(account.getProfile().getName(), codeName);
		});
	});
	
	//$("#documentsToggleBtn").mouseup(resizeElements);
	
	$('#document-section').on('hidden.bs.collapse', resizeElements);
	$('#document-section').on('shown.bs.collapse', resizeElements);

	document.getElementById('btnRemoveCode').onclick = function() {
		deleteCode();
	}

	document.getElementById('btnHideFooter').onclick = function() {
		hideCodingView();
	}

	document.getElementById('btnApplyCode').onclick = function() {
		var activeID = getActiveCode().id;
		if (typeof activeID != 'undefined') {
			gapi.client.qdacity.project.incrCodingId({'id' : project_id, 'type' : project_type }).execute(function(resp) {
				var codingID = resp.maxCodingID;
				var author = account.getProfile().getName();

				editorCtrl.setCoding(codingID, activeID, getActiveCode().name, author);
				documentsCtrl.saveCurrentDoc(editorCtrl.getHTML());
				easytree.getNode(activeID).codingCount++;
				rebuildTree();
			});
		}
	}

	document.getElementById('btnRemoveCoding').onclick = function() {
		var activeID	 = getActiveCode().id;
		if (typeof activeID != 'undefined') {
			var slection = editorCtrl.removeCoding(activeID);
			splitupCoding(slection, activeID).then(function(value) {
				easytree.getNode(activeID).codingCount--;
				rebuildTree();
				documentsCtrl.saveCurrentDoc(editorCtrl.getHTML());
				editorCtrl.addCodingBrackets();
			});
			
			
		} else {
			window.alert("No code selected.")
		}

	}
	
	document.getElementById('btnCodeSave').onclick = function() {
		updateCode(getActiveCode().memo, $('#codePropAuthor').val(), $('#codePropName').val(), $('#codePropColor').val(), getActiveCode().dbID, getActiveCode().id);

	}
	
	document.getElementById('btnCodeMemoSave').onclick = function() {
		updateCode(codeMemoEditor.getHTML(), $('#codePropAuthor').val(), $('#codePropName').val(), $('#codePropColor').val(), getActiveCode().dbID, getActiveCode().id);

	}
	
	// FIXME possibly move to CodingsView
	document.getElementById('btnCodeBookEntrySave').onclick = function() {
		var codeBookEntry = {};
		codeBookEntry.definition = cbEditorDef.getHTML();
		codeBookEntry.whenToUse = cbEditorWhen.getHTML();
		codeBookEntry.whenNotToUse = cbEditorWhenNot.getHTML();
		updateCodeBookEntry(codeBookEntry);
	}
	
	document.getElementById('btnTxtSave').onclick = function() {
		documentsCtrl.saveCurrentDoc(editorCtrl.getHTML());
	}

	$('#textdocument-menu').on('shown.bs.collapse', function() {
		editorCtrl.setReadOnly(false);
		resizeElements();
	})

	$('#textdocument-menu').on('hidden.bs.collapse', function() {
		editorCtrl.setReadOnly(true);
		resizeElements();
	})
	
}


function createCodeMemoEditor(){
	var codeMemoIFrame = document.getElementById('codeMemoEditor');
	codeMemoIFrame.onload = function(event) {
		var codeMemoIFrame = document.getElementById('codeMemoEditor');
		var doc = codeMemoIFrame.contentDocument;

		// Create Squire instance
		codeMemoEditor = new Squire(doc);
		
		codeMemoEditor.setHTML(getActiveCode().memo);
	  }
}

function createCodeBookEditor(){
	
	var cbDefFrame = document.getElementById('cbEditorDef');
	cbDefFrame.onload = function(event) {
		var codeBookEntry = getActiveCode().codeBookEntry;
		var cbDefFrame = document.getElementById('cbEditorDef');
		var doc = cbDefFrame.contentDocument; // FIXME use "this"?

		// Create Squire instance
		cbEditorDef = new Squire(doc);
		cbEditorDef.setHTML(codeBookEntry.definition);
	}
	
	// FIXE Refactor for less code replication
	var cbWhenFrame = document.getElementById('cbEditorWhen');
	cbWhenFrame.onload = function(event) {
		var codeBookEntry = getActiveCode().codeBookEntry;
		var cbWhenFrame = document.getElementById('cbEditorWhen');
		var doc = cbWhenFrame.contentDocument;

		// Create Squire instance
		cbEditorWhen = new Squire(doc);
		
		cbEditorWhen.setHTML(codeBookEntry.whenToUse);
	  }
	
	var cbWhenNotFrame = document.getElementById('cbEditorWhenNot');
	cbWhenNotFrame.onload = function(event) {
		var codeBookEntry = getActiveCode().codeBookEntry;
		var cbWhenNotFrame = document.getElementById('cbEditorWhenNot');
		var doc = cbWhenNotFrame.contentDocument;

		// Create Squire instance
		cbEditorWhenNot = new Squire(doc);
		cbEditorWhenNot.setHTML(codeBookEntry.whenNotToUse);
	  }
}

window.onresize = resizeHandler;

function resizeHandler() {
	setTimeout(function() {
		resizeElements();
	}, 250);
	if ($(window).width() > 770 || $(window).height() > 600) {
		$.LoadingOverlay("hide");
	}
}

function resizeElements() {
	if ($(window).width() < 770 || $(window).height() < 600) {
		$.LoadingOverlay("show_resize");
	} else {
		$.LoadingOverlay("hide");
	}
	var offsetFooter = 0;
	if ($("#footer").is(":visible")) {
		offsetFooter += 341;
	}
	
	var offsetEditMenu = 0;
	if ($("#textdocument-menu").is(":visible")) {
		offsetEditMenu += 45;
	}
	$("#editor").css({
		height : $(window).height() - 52 - offsetFooter - offsetEditMenu
	});
	
	var codesystemTreeOffset = $("#easytree-section").offset().top
	$("#easytree-section").css({
		height : $(window).height() - codesystemTreeOffset - offsetFooter
	});
	editorCtrl.addCodingBrackets();
}

var easytree = $('#easytree-section').easytree({
	enableDnd : true,
	dropped : dropped,
	stateChanged : codesystemStateChanged,
	ordering : 'orderedFolder'
});


function setupUI(){
	if (account.isSignedIn()){
	var profile = account.getProfile();
	
//	easytree = $('#easytree-section').easytree({
//		enableDnd : false,
//		dropped : dropped,
//		stateChanged : codesystemStateChanged
//	});
	//easytree.options.enableDnd = false;
	$('#navAccount').show();
	$('#navSignin').hide();
	
	gapi.client.qdacity.project.getProject({ 'id' : project_id, 'type': project_type}).execute(function(resp) {
		if (!resp.code) {
			codesystem_id = resp.codesystemID;
			setDocumentList(project_id);
			listCodes();
		} else {
			handleError(resp.code);
		}
		$.LoadingOverlay("hide");

	});
	}
	else {
		$('#navAccount').hide();
	}
	//resizeHandler();
}

function splitupCoding(selection, codeID){
	 var promise = new Promise(
		  function(resolve, reject) {
			  var anchor = $(selection._sel.anchorNode);
				var codingID = anchor.prev('coding[code_id='+codeID+']').attr('id');
				if (typeof codingID == 'undefined') codingID = anchor.parentsUntil('p').parent().prev().find('coding[code_id='+codeID+']').last().attr('id');
				if (typeof codingID == 'undefined') codingID = anchor.parent().prev().find('coding[code_id='+codeID+']').last().attr('id'); // Case beginning of paragraph to middle of paragraph

				if (typeof codingID != 'undefined'){
					gapi.client.qdacity.project.incrCodingId({'id' : project_id, 'type' : project_type}).execute(function(resp) {
						anchor.nextAll('coding[id='+codingID+']').attr("id", resp.maxCodingID);
						anchor.parentsUntil('p').parent().nextAll().find( 'coding[id='+codingID+']' ).attr("id", resp.maxCodingID);
						anchor.parent().nextAll().find( 'coding[id='+codingID+']' ).attr("id", resp.maxCodingID); // Case beginning of paragraph to middle of paragraph
						resolve();
					});
				}
				else{
					resolve();
				}
		  }
	  );
	 
	 return promise;
}

function removeAllCodings(codingID){
	var documents = documentsView.getDocuments();
	var activeDocId = documentsView.getActiveDocumentId();
	
	for ( var i in documents) {
		var doc = documents[i];
		var elements = $('<div>'+doc.text+'</div>');
		var originalText = elements.html();
		elements.find('coding[code_id=\'' + codingID + '\']').contents().unwrap();
		var strippedText = elements.html();
		if (strippedText !== originalText){
			doc.text = strippedText;
			documentsCtrl.changeDocumentData(doc.id, doc.title, doc.text);
			if (activeDocId === doc.id)editorCtrl.setDocumentView(doc);
		}
	}
}

function showCodingView() {
	showFooter();
	var activeID = getActiveCode().id;
	
	fillCodingTable(activeID);
	fillPropertiesView(activeID);
	resizeHandler();
}

function showFooter() {
	$("#footer").show("clip", {}, 200, resizeElements);
}

function hideCodingView() {
	$("#footer").hide("clip", {}, 200, resizeElements);

}

function fillCodingTable(activeID){
	var documents = documentsView.getDocuments();
	codingsView.fillCodingTable(activeID, documents);
}

//FIXME possibly move to CodingsView
function fillPropertiesView(codeID) {
	$("#codePropName").val(getActiveCode().name);
	$("#codePropAuthor").val(getActiveCode().author);
	$("#codePropColor").colorpicker({
		color : getActiveCode().color
	});
}

function setDocumentList(projectID) {
	if (typeof documentsView == 'undefined'){
		documentsView = ReactDOM.render(<DocumentsView editorCtrl={editorCtrl} />, document.getElementById('documentView'));
		documentsCtrl = new DocumentsCtrl(documentsView, project_id);
		codingsView = new CodingsView(editorCtrl, documentsCtrl);
	}
	
	documentsCtrl.setupView(project_id, project_type).then(function(codeName) {
		addCodingCountToTree();
		resizeElements();
	});
}


// List Codes function that will execute the listCode call
function listCodes() {
	var codes = [];
	gapi.client.qdacity.codesystem.getCodeSystem({'id' : codesystem_id }).execute(function(resp) {
		if (!resp.code) {
			// clear codesystem in easytree object
			easytree.rebuildTree([]);
			
			
			resp.items = resp.items || [];
			//var result = "";

			for (var i = 0; i < resp.items.length; i++) {
				//result = result + resp.items[i].name + "..." + "<b>" + resp.items[i].author + "</b>" + "[" + resp.items[i].id + "]" + "   {" + resp.items[i].subCodesIDs + "}" + "<br/>";

				codes.push(resp.items[i]);
			}
			
			for (var i = 0; i < codes.length; i++) {
				addNodeToTree(codes[i].codeID, codes[i].id, codes[i].name, codes[i].author, codes[i].color, codes[i].parentID, codes[i].subCodesIDs, codes[i].memo, codes[i].codeBookEntry);
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

	gapi.client.qdacity.codes.insertCode(requestData).execute(function(resp) {
		if (!resp.code) {
			addNodeToTree(resp.codeID, resp.id, resp.name, resp.author, resp.color, resp.parentID, resp.subCodesIDs, resp.memo, resp.codeBookEntry);
			if (activeID != 'undefined') {
				relocateNode(resp.codeID, activeID);
				setSubCodeIDs(easytree.getNode(resp.parentID));
			}
		} else {
			console.log(resp.code);
		}
	});
}

// Update Code function
function updateCode(_Memo, _AuthorName, _CodeName, _CodeColor, _ID, _CodeID) {
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
	gapi.client.qdacity.codes.updateCode(requestData).execute(function(resp) {
		if (!resp.code) {
			// Just logging to console now, you can do your check here/display
			// message
			console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
			updateNode(resp.codeID, resp.name, resp.author, resp.color, resp.memo, resp.codeBookEntry);
		}
	});
}

function updateCodeBookEntry(codeBookEntry){
	gapi.client.qdacity.codes.setCodeBookEntry({'codeId' : getActiveCode().dbID },codeBookEntry).execute(function(resp) {
		if (!resp.code) {
			updateNode(resp.codeID, resp.name, resp.author, resp.color, resp.memo, codeBookEntry);
		}
	});
}


function relocateCode(code, newParentCode) {
//	setSubCodeIDs(easytree.getNode(code.parentID));
//	setSubCodeIDs(newParentCode);
//	changeParentId(code, newParentCode.id);
	
	gapi.client.qdacity.codes.relocateCode({	'codeId' : code.dbID , 'newParentID' : newParentCode.id}).execute(function(resp) {
		if (!resp.code) {
			code.parentID = newParentCode.id;
			console.log( "Updated logation of code:"+ resp.id + " |  "+ resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
		}
	});
}



function setSubCodeIDs(node) {
	var _ID = node.dbID;
	var subCodeIDs = getSubCodeIDs(node);
	
	gapi.client.qdacity.codes.getCode({	'id' : _ID }).execute(function(resp) {

		if (!resp.code) {
			console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
		}
		
			resp.subCodesIDs = subCodeIDs;

		gapi.client.qdacity.codes.updateCode(resp).execute(function(resp2) {
			if (!resp2.code) {
				console.log("Updated: ID"+resp2.id + " SubCodeIDs:" + resp2.subCodesIDs);
			}
		});
	});
}

function getSubCodeIDs(node){
	var children = node.children;
	var subCodeIDs = [];
	if (typeof children == 'undefined') return subCodeIDs;
	
	for (var i = children.length - 1; i >= 0; i--) {
		subCodeIDs.push(children[i].id);
	}
	return subCodeIDs;
}

function changeParentId(code, _newParent) {
	gapi.client.qdacity.codes.getCode({
		'id' : code.dbID
	}).execute(function(resp) {

		if (!resp.code) {
			console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
		}
		
		resp.parentID = _newParent;
		
		gapi.client.qdacity.codes.updateCode(resp).execute(function(resp2) {
			if (!resp2.code) {
				console.log(resp2.id + ":" + resp2.author + ":" + resp2.name + ":" + resp2.subCodesIDs);
				code.parentID = _newParent;
			}
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
		console.log(requestData);
		gapi.client.qdacity.codes.removeCode(requestData).execute(function(resp) {
			// Just logging to console now, you can do your check here/display
			// message
			console.log(resp);
			removeAllCodings(getActiveCode().id);
			removeNodeFromTree(getActiveCode().id);
			
		});
	}

}

function addNodeToTree(id, dbID, name, author, color, parentID, subCodesIDs, memo, codeBookEntry) {
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
	sourceNode.subCodesIDs = subCodesIDs;
	if (typeof subCodesIDs == 'undefined') sourceNode.subCodesIDs = [];
	if (memo == undefined) memo = "";
	sourceNode.memo = memo;

	sourceNode.onclick = function() {
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
		for ( var index in documents) {
			var doc = documents[index];
			var elements = doc.text;
			var foundArray = $('coding[code_id=\'' + codeIDs[i] + '\']', elements).map(function() {
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

function activateRootNode(){
	easytree.getAllNodes()[0].isActive = true;
}

function rebuildTree(){
	easytree.rebuildTree();
	$(".codingCountBubble").click(showFooter).css( 'cursor', 'pointer' );
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

function updateNode(id, name, author, color, memo, codeBookEntry) {

	var sourceNode = easytree.getNode(id);
	sourceNode.text = name;
	sourceNode.author = author;
	sourceNode.color = color;
	sourceNode.memo = memo;
	sourceNode.codeBookEntry = codeBookEntry;
	
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
			fillCodingTable(active_code);
			fillPropertiesView(active_code);
			if (codeMemoEditor != undefined) codeMemoEditor.setHTML(getActiveCode().memo);
			if (cbEditorDef != undefined){
				var codeBookEntry = getActiveCode().codeBookEntry
				cbEditorDef.setHTML(codeBookEntry.definition);
				cbEditorWhen.setHTML(codeBookEntry.whenToUse);
				cbEditorWhenNot.setHTML(codeBookEntry.whenNotToUse);
			}
		}
	} else {
		initialized_easytree = true;
	}
}