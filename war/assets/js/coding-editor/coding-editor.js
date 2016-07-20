import DocumentsView from './DocumentsView.jsx';
import CodingBrackets from './coding-brackets';
import Account from '../Account';

import $script from 'scriptjs';

$script('https://apis.google.com/js/client.js', function() {
	$script('https://apis.google.com/js/platform.js?onload=init','google-api');
	});
  
var scopes = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var client_id = '309419937441-6d41vclqvedjptnel95i2hs4hu75u4v7.apps.googleusercontent.com';
var current_user_name;
var current_user_id;
var codesystem_id;
var active_code;
var project_id;
var documentMap;
var max_coding_id;
 
var editor;
var codeMemoEditor;

var account;

var iframe = document.getElementById('editor');
  window.init = function()  {
	// Make sure we're in standards mode.
	var doc = iframe.contentDocument;
	$("#editor").css({
		height : $(window).height() - 52
	});
	if (doc.compatMode !== 'CSS1Compat') {
		doc.open();
		doc.write('<!DOCTYPE html><title></title>');
		doc.close();
	}

	doc.open();
	doc.write('<!DOCTYPE html><title>test</title><head></head>');
	doc.close();
	// doc.close() can cause a re-entrant load event in some browsers, such as IE9.
	if (editor) {
		return;
	}
	// Create Squire instance
	editor = new Squire(doc, {
		blockTag : 'p',
		blockAttributes : {
			'class' : 'paragraph'
		},
		tagAttributes : {
			ul : {
				'class' : 'UL'
			},
			ol : {
				'class' : 'OL'
			},
			li : {
				'class' : 'listItem'
			}
		}
	});
	editor['readOnly']('true');
	
	createCodeMemoEditor(); 
	
	var editorStyle = doc.createElement('link');
	editorStyle.href = 'assets/css/editorView.css';
	editorStyle.rel = 'stylesheet';
	doc.querySelector('head').appendChild(editorStyle);
		
	var codingBracketStyle = doc.createElement('link');
	codingBracketStyle.href = 'assets/css/codingBrackets.css';
	codingBracketStyle.rel = 'stylesheet';
	doc.querySelector('head').appendChild(codingBracketStyle);
	
	$("#codeTabs").easytabs({
		animate : true,
		animationSpeed : 100,
		panelActiveClass : "active-content-div",
		defaultTab : "span#defaultCodeTab",
		tabs : "> div > span",
		updateHash : false
	});

	$('.tooltips').tooltipster();

	// documents-ui
	$('#btnUpdateDoc').tooltipster({
		content : $('<span>Rename Document</span>'),
	});

	$('#btnInsertDoc').tooltipster({
		content : $('<span>New Document</span>'),
	});

	$('#btnRemoveDoc').tooltipster({
		content : $('<span>Remove Document</span>'),
	});

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

	$('#btnUpdateCode').tooltipster({
		content : $('<span>Edit Code</span>')
	});

	$("#codePropColor").colorpicker();
	
	window.init2();
}


function addCodingBrackets(){
	var doc = iframe.contentDocument;
	$(doc).imagesLoaded( function() {
		$(doc).find(".svgContainer").remove();
		var codingsMap = getCodingsFromText(doc);
		var svgDiv = (new CodingBrackets()).createCodingBrackets(doc, codingsMap);
		var body = doc.querySelector('body');
		body.insertBefore(svgDiv, body.firstChild);
	});
	
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
	addCodingBrackets();
}

var easytree = $('#easytree-section').easytree({
	enableDnd : true,
	dropped : dropped,
	stateChanged : codesystemStateChanged
});


function setupUI(){
	if (account.isSignedIn()){
	var profile = account.getProfile();
	
	document.getElementById('loginButton').style.visibility = 'hidden';
    document.getElementById('currentUserName').innerHTML = profile.getName();
	document.getElementById('currentUserEmail').innerHTML = profile.getEmail();
	document.getElementById('currentUserPicture').src = profile.getImageUrl();
	$('#navAccount').show();
	$('#navSignin').hide();
	
	gapi.client.qdacity.project.getProject({ 'id' : project_id }).execute(function(resp) {
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
		document.getElementById('loginButton').style.visibility = '';
		$('#navAccount').hide();
	}
	
	
}


function signout() {
	window.open("https://accounts.google.com/logout");
}

window.init2 = function (){


	$.LoadingOverlay("show");
	$("#footer").hide();
	$('#navAccount').hide();
	$("#textdocument-menu").collapse(); // editor will be initialized readonly,
	// the toggle is later hooked to the
	// visibility of the toolbar

	vex.defaultOptions.className = 'vex-theme-os';
	
	var urlParams = URI(window.location.search).query(true);
  	
	project_id = urlParams.project;

	$(".projectDashboardLink").attr('href', 'project-dashboard.html?project?' + project_id);

	var apisToLoad;
	var callback = function() {
		if (--apisToLoad == 0) {
			account = new Account(client_id, scopes);
			account.signin(setupUI);
		}

	}

	apisToLoad = 2;
	// Parameters are APIName,APIVersion,CallBack function,API Root
	gapi.client.load('qdacity', 'v1', callback, 'https://qdacity-app.appspot.com/_ah/api');
	gapi.load('auth2', callback);

	document.getElementById('btnCodeProps').onclick = function() {
		if ($("#footer").is(":visible")) {
			hideCodingView();
		} else {
			showCodingView();
		}
	}

	$("#btnInsertCode").on("click", function() {
		vex.dialog.prompt({
			message : 'Give your code a name',
			placeholder : 'Code Name',
			callback : function(codeName) {
				if (codeName != false) {
					insertCode(current_user_name, codeName);
				}
			}
		});
	});

	document.getElementById('btnRemoveCode').onclick = function() {
		deleteCode();
	}

	document.getElementById('btnRemoveDoc').onclick = function() {
		removeDocumentFromProject();
	}

	document.getElementById('btnUpdateDoc').onclick = function() {
		changeDocumentTitle();
	}

	document.getElementById('loginButton').onclick = function() {
		account.signin(setupUI);
	}

	document.getElementById('btnHideFooter').onclick = function() {
		hideCodingView();
	}
	
	document.getElementById('navBtnSwitchAccount').onclick = function () {
		account.changeAccount(setupUI,client_id,scopes);
	};

	document.getElementById('btnApplyCode').onclick = function() {
		var activeID = getActiveCode().id;
		if (typeof activeID != 'undefined') {
			gapi.client.qdacity.project.incrCodingId({
				'id' : project_id
			}).execute(function(resp) {
				var codingID = resp.maxCodingID;
				var author = current_user_name;
				editor['setCoding'](codingID, activeID, getActiveCode().name, author);
				var activeDoc = documentsView.getActiveDocument();
				changeDocumentData(activeDoc.id, activeDoc.title);
				easytree.getNode(activeID).codingCount--;
				easytree.rebuildTree();
				addCodingBrackets();

			});

		}
	}

	document.getElementById('btnRemoveCoding').onclick = function() {
		var activeID = getActiveCode().id;
		if (typeof activeID != 'undefined') {

			editor['removeCoding'](activeID);
			easytree.getNode(activeID).codingCount++;
			easytree.rebuildTree();
			var activeDoc = documentsView.getActiveDocument();
			changeDocumentData(activeDoc.id, activeDoc.title);
			addCodingBrackets();
		} else {
			window.alert("No code selected.")
		}

	}

	document.getElementById('btnCodeSave').onclick = function() {
		updateCode(getActiveCode().memo, $('#codePropAuthor').val(), $('#codePropName').val(), $('#codePropColor').val(), getActiveCode().id);

	}
	
	document.getElementById('btnCodeMemoSave').onclick = function() {
		window.alert(codeMemoEditor.getHTML());
		updateCode(codeMemoEditor.getHTML(), $('#codePropAuthor').val(), $('#codePropName').val(), $('#codePropColor').val(), getActiveCode().id);

	}

	document.getElementById('navBtnSigninGoogle').onclick = function() {
		account.signin(setupUI, anonymousUser);
	}

	document.getElementById('navBtnSignOut').onclick = function() {
		signout();
	}

	document.getElementById('btnTxtBold').onclick = function() {
		editor['bold']();
	}

	document.getElementById('btnTxtItalic').onclick = function() {
		editor['italic']();
	}

	document.getElementById('btnTxtUnderline').onclick = function() {
		editor['underline']();
	}

	document.getElementById('btnTxtSave').onclick = function() {
		saveEditorContent();
	}

	$("#txtSizeSpinner").on("spin", function(event, ui) {
		editor['setFontSize'](ui.value);
	});

	$('#textdocument-menu').on('shown.bs.collapse', function() {
		editor['readOnly']('false');
		resizeElements();
	})

	$('#textdocument-menu').on('hidden.bs.collapse', function() {
		editor['readOnly']('true');
		resizeElements();
	})

	document.getElementById('uploadDocBtn').onclick = function() {
		uploadSelectedDocuments();
	}

	document.getElementById('createDocBtn').onclick = function() {
		addDocumentToProject(document.getElementById("newDocTitleFld").value);
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

function fillCodingTable(codeID) {
	var table = $('#example').DataTable();

	table.clear();

	var codings = [];

	table.clear();
	
	var documents = documentsView.getDocuments();
	
	for ( var i in documents) {
		var doc = documents[i];
		var elements = doc.text;
		var found = $('coding', elements);
		var foundArray = $('coding[code_id=\'' + codeID + '\']', elements).map(function() {
			var tmp = {};
			tmp.id = $(this).attr('id');
			tmp.code_id = $(this).attr('code_id');
			tmp.author = $(this).attr('author');
			return tmp;

		});
		foundArray = foundArray.toArray();
		var idsAdded = []; // When a coding spans multiple HTML blocks, then
		// there will be multiple elements with the same ID
		for (var j = 0; j < foundArray.length; j++) {
			if ($.inArray(foundArray[j].id, idsAdded) != -1)
				continue;
			table.row.add([ foundArray[j].id, doc.title, foundArray[j].author ]);
			idsAdded.push(foundArray[j].id);
		}
	}
	
	table.draw();
}

function getCodingsFromText(text){

		var codingMap = {};
		var codingNodes = $("#editor").contents().find(
				'coding');
		if (codingNodes.length > 0){
			var codingData = {};
			var currentID = -1;
			for ( var i = 0; i< codingNodes.length; i++) {
				var codingNode = codingNodes[i];
				currentID = codingNode.getAttribute("id");
				// One code ID may have multiple DOM elements, if this is a new one create a coding object
				if (!(currentID in codingMap)){
					codingData = {};
					codingData.offsetTop = codingNode.offsetTop;
					codingData.height = codingNode.offsetHeight;
					codingData.name = codingNode.getAttribute("title"); 
					codingData.codingId = currentID; 
					codingData.color = getCodeColor(codingNode.getAttribute("code_id"));
					
					codingMap[currentID] = codingData;
				}
				// if this is just another DOM element for a coding that has already been created, then adjust the hight
				else{ 
					codingMap[currentID].height = codingNode.offsetTop - codingMap[currentID].offsetTop + codingNode.offsetHeight;
				}
			}
		}
	
	return codingMap;
}

function fillPropertiesView(codeID) {
	$("#codePropName").val(getActiveCode().name);
	$("#codePropAuthor").val(getActiveCode().author);
	// $("#codePropColor").val(getActiveCode().color);
	$("#codePropColor").colorpicker({
		color : getActiveCode().color
	});
}

function getCodingCount(codeId) {

}

window.activateCodingInEditor = function (codingID, scrollToSection) {

	var documents = documentsView.getDocuments();
	for ( var i in documents) {
		var doc = documents[i];
		var elements = doc.text;
		var foundArray = $('coding[id=\'' + codingID + '\']', elements).map(
				function() {
					return $(this);

				});
		foundArray = foundArray.toArray();

		if (foundArray.length > 0) {
			var range;
			range = document.createRange();
			documentsView.setActiveDocument(doc.id);
			setDocumentView(doc.id);
			var codingNodes = $("#editor").contents().find(
					'coding[id=\'' + codingID + '\']');
			var startNode = codingNodes[0];
			var endNode = codingNodes[codingNodes.length - 1];

			var raWnge = iframe.contentDocument.createRange();
			range.setStart(startNode, 0);
			range.setEnd(endNode, endNode.childNodes.length);
			editor.setSelection(range);
			
			//Scroll to selection
			if (scrollToSection){
				var offset = startNode.offsetTop;
				$("#editor").contents().scrollTop(offset);
			}

		}
	}
}

var documentsView = {};
function setDocumentList(projectID) {
	documentsView = ReactDOM.render(<DocumentsView setEditor={setDocumentView} />, document.getElementById('documentView'));

	$("#documents-ui").LoadingOverlay("show");
	gapi.client.qdacity.documents.getTextDocument({
		'id' : project_id
	}).execute(function(resp) {
		if (!resp.code) {
			resp.items = resp.items || [];
			for (var i = 0; i < resp.items.length; i++) {
				documentsView.addDocument(resp.items[i].id, resp.items[i].title, resp.items[i].text.value);
				
			}
		}

		$("#documents-ui").LoadingOverlay("hide");

		// Extract the codings from the loaded documents
		addCodingCountToTree();
		
		resizeElements();

	});
}

function addDocumentToProject(title) {

	var requestData = {};
	requestData.projectID = project_id;
	requestData.text = " "; // can not be empty
	requestData.title = title;

	gapi.client.qdacity.documents.insertTextDocument(requestData).execute(function(resp) {
		if (!resp.code) {
			documentsView.addDocument(resp.id, resp.title, resp.items[i].text.value);
		}
	});

}

function removeDocumentFromProject() {	
	var docId = documentsView.getActiveDocumentId();

	var requestData = {};
	requestData.id = docId;
	gapi.client.qdacity.documents.removeTextDocument(requestData).execute(function(resp) {
		documentsView.removeDocument(docId);
	});
}

function changeDocumentTitle() {
	var docId = documentsView.getActiveDocumentId();
	var title = prompt("New name for document \"" + docId + "\"", "Title");
	changeDocumentData(docId, title);
}

function changeDocumentData(id, title) {f

	var requestData = {};
	requestData.id = id; 
	requestData.title = title;
	requestData.text = editor.getHTML();
	requestData.projectID = project_id;
	// FIXME text
	gapi.client.qdacity.documents.updateTextDocument(requestData).execute(function(resp) {
		if (!resp.code) {
			documentsView.renameDocument(id, title);
		}
	});
}

function setDocumentView(textDocumentID) {
	var doc = documentsView.getDocument(textDocumentID);
	if (typeof doc.text == 'undefined') {
		editor.setHTML("");
	} else {
		editor.setHTML(doc.text);
		addTooltipsToEditor(textDocumentID);
	}
	
	addCodingBrackets();
}

function addTooltipsToEditor(id) {
	var doc = documentsView.getDocument(id);
	var elements = doc.text;
	var foundArray = $("#editor").contents().find('coding');

	foundArray = foundArray.toArray();

	for (var i = 0; i < foundArray.length; i++) {
		var node = foundArray[i];
		$(node).tooltip({
			"content" : "Code [" + $(node).attr('codeName') + "]",
			placement : 'top'
		});

	}
}

function saveEditorContent() {
	changeDocumentData(active_document.id, active_document.title);
}

// List Codes function that will execute the listCode call
function listCodes() {
	$("#codesystem-ui").LoadingOverlay("show");
	var codes = [];
	gapi.client.qdacity.codesystem.getCodeSystem({
		'id' : codesystem_id
	}).execute(function(resp) {
		if (!resp.code) {
			resp.items = resp.items || [];
			var result = "";

			for (var i = 0; i < resp.items.length; i++) {
				result = result + resp.items[i].name + "..." + "<b>" + resp.items[i].author + "</b>" + "[" + resp.items[i].id + "]" + "   {" + resp.items[i].subCodesIDs + "}" + "<br/>";

				codes.push(resp.items[i]);
			}
			
			for (var i = 0; i < codes.length; i++) {
				addNodeToTree(codes[i].id, codes[i].name, codes[i].author, codes[i].color, codes[i].parentID, codes[i].subCodesIDs, codes[i].memo);
			}

			for (var i = 0; i < codes.length; i++) {
				if (typeof codes[i].subCodesIDs != 'undefined') {
					if (codes[i].subCodesIDs.length > 0) {

						for (var j = 0; j < codes.length; j++) {
							for (var k = 0; k < codes[i].subCodesIDs.length; k++) {
								if (codes[i].subCodesIDs[k] == codes[j].id) {
									relocateNode(codes[j].id, codes[i].id);
								}
							}
						}

					}
				}
			}
		}
		addCodingCountToTree();
		$("#codesystem-ui").LoadingOverlay("hide");
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
	if (activeID != 'undefined')
		requestData.parentID = activeID;
	requestData.codesytemID = codesystem_id;
	requestData.color = "#000000";

	gapi.client.qdacity.codes.insertCode(requestData).execute(function(resp) {

		console.log("Response: " + resp.id + ":" + resp.author + ":" + resp.name);
		if (!resp.code) {
			// Just logging to console now, you can do your check here/display
			// message
			console.log(resp.id + ":" + resp.author + ":" + resp.name);
			addNodeToTree(resp.id, resp.name, resp.author, resp.color, resp.parentID, resp.subCodesIDs, resp.memo);
			if (typeof activeID != 'undefined') {
				addSubCode(activeID, resp.id);
				relocateNode(resp.id, activeID);
			}
		} else {
			console.log(resp.code);
		}

	});
}

// Update Code function
function updateCode(_Memo, _AuthorName, _CodeName, _CodeColor, _ID) {
	// Build the Request Object
	var requestData = {};
	requestData.id = _ID;
	requestData.author = _AuthorName;
	requestData.name = _CodeName;
	requestData.color = _CodeColor;
	requestData.memo = _Memo;
	requestData.codesytemID = codesystem_id;
	requestData.parentID = getActiveCode().parentID;
	requestData.subCodesIDs = getActiveCode().subCodesIDs;
	gapi.client.qdacity.codes.updateCode(requestData).execute(function(resp) {
		if (!resp.code) {
			// Just logging to console now, you can do your check here/display
			// message
			console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
			updateNode(resp.id, resp.name, resp.author, resp.color, resp.memo);
		}
	});
}

function relocateCode(codeId, newParentId) {
	removeLinkFromOldParent(codeId);

	addSubCode(newParentId, codeId);

	changeParentId(codeId, newParentId);
}

// Add SubCode function FIXME
function addSubCode(_ID, _SubID) {

	gapi.client.qdacity.codes.getCode({	'id' : _ID }).execute(function(resp) {

		if (!resp.code) {
			console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
		}

		var code = {};

		var requestData = {};

		requestData.name = resp.name;
		requestData.id = _ID;
		requestData.author = resp.author;
		requestData.codesytemID = resp.codesytemID;
		requestData.color = resp.color;
		requestData.memo = resp.memo;
		
		if (typeof resp.subCodesIDs == 'undefined') {
			requestData.subCodesIDs = [ _SubID ];
		} else {
			requestData.subCodesIDs = resp.subCodesIDs.concat(_SubID);
		}
		gapi.client.qdacity.codes.updateCode(requestData).execute(function(resp) {
			if (!resp.code) {
				console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
				// relocateNode(_SubID, _ID);
			}
		});

	});
}

function changeParentId(_ID, _newParent) {

	gapi.client.qdacity.codes.getCode({
		'id' : _ID
	}).execute(function(resp) {

		if (!resp.code) {
			console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
		}

		var requestData = {};

		requestData.name = resp.name;
		requestData.id = _ID;
		requestData.author = resp.author;
		requestData.subCodesIDs = resp.subCodesIDs;
		requestData.parentID = _newParent;
		requestData.codesytemID = resp.codesytemID;
		requestData.color = resp.color;
		requestData.memo = resp.memo;
		
		gapi.client.qdacity.codes.updateCode(requestData).execute(function(resp) {
			if (!resp.code) {
				console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
			}
		});

	});
}

function removeSubCode(_ID, _SubID) {

	gapi.client.qdacity.codes.getCode({
		'id' : _ID
	}).execute(function(resp) {

		if (!resp.code) {
			console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
		}

		var code = {};

		var requestData = {};

		requestData.name = resp.name;
		requestData.id = _ID;
		requestData.author = resp.author;
		requestData.codesystemID = resp.codesystemID;
		requestData.color = resp.color;
		requestData.memo = resp.memo;
		
		for (var i = resp.subCodesIDs.length - 1; i >= 0; i--) {

			if (resp.subCodesIDs[i] === _SubID) {

				resp.subCodesIDs.splice(i, 1);
			}
		}
		requestData.subCodesIDs = resp.subCodesIDs;
		gapi.client.qdacity.codes.updateCode(requestData).execute(function(resp) {
			if (!resp.code) {
				// Just logging to console now, you can do your check
				// here/display message
				console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
			}
		});

	});
}

function removeLinkFromOldParent(codeId) {

	gapi.client.qdacity.codes.getCode({
		'id' : codeId
	}).execute(function(resp) {

		if (!resp.code) {
			console.log(resp.id + ":" + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
			if (typeof resp.parentID != 'undefined') {
				removeSubCode(resp.parentID, codeId);
			}
		}
	});
}

// Delete code function
function deleteCode() {
	var activeID = getActiveCode().id;
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
			removeNodeFromTree(activeID);
		});
	}

}

function setNameAndAuthor(codeId, nameField, authorField) {
	gapi.client.qdacity.codes.getCode({
		'id' : codeId
	}).execute(function(resp) {

		if (!resp.code) {
			document.getElementById(nameField).value = resp.name;
			document.getElementById(authorField).value = resp.author;
		}
	});
}

$(function() {

	var dialog, form, name = $("#newCodeName"), email = $("#newCodeAuthor"), password = $("#newCodeID"), allFields = $([]).add(name).add(email).add(password), tips = $(".validateTips");

	function addCode() {
		var name = document.getElementById('newCodeName').value, author = document.getElementById('newCodeAuthor').value;

		insertCode(author, name);
		dialog.dialog("close");
		form[0].reset();
	}

	dialog = $("#new-document-form").dialog({
		autoOpen : false,
		height : 450,
		width : 750,
		modal : true,
		buttons : {
			"Add code" : addCode,
			Cancel : function() {
				dialog.dialog("close");
			}
		},
		close : function() {
			form[0].reset();
			allFields.removeClass("ui-state-error");

		}
	});

	form = dialog.find("form").on("submit", function(event) {
		event.preventDefault();
		addCode();
	});

	$("#btnInsertDoc").on("click", function() {
		$('#newCodeAuthor').attr('value', current_user_name);
		dialog.dialog("open");
	});

});

// FIXME check for dead legacy code
$(function() {
	var dialog, form, name = $("#updateCodeName"), email = $("#updateCodeAuthor"), password = $("#updateCodeID"), allFields = $([]).add(name).add(email).add(password), tips = $(".validateTips");

	function changeCode() {
		var name = document.getElementById('updateCodeName').value, author = document.getElementById('updateCodeAuthor').value, id = getActiveCode().id;

		updateCode(author, name, "#000000", id);
		dialog.dialog("close");
		form[0].reset();
	}

	dialog = $("#update-code-form").dialog({
		autoOpen : false,
		height : 350,
		width : 450,
		modal : true,
		buttons : {
			"Modify code" : changeCode,
			Cancel : function() {
				dialog.dialog("close");
			}
		},
		close : function() {
			form[0].reset();
			allFields.removeClass("ui-state-error");

		}
	});

	form = dialog.find("form").on("submit", function(event) {
		event.preventDefault();
		changeCode();
	});

	$("#btnUpdateCode").on("click", function() {
		document.getElementById('updateFormCodeId').innerHTML = getActiveCode().id;
		setNameAndAuthor(getActiveCode().id, 'updateCodeName', 'updateCodeAuthor');
		dialog.dialog("open");
	});
});

function addNodeToTree(id, name, author, color, parentID, subCodesIDs, memo) {
	var sourceNode = {};
	sourceNode.text = name;
	sourceNode.isFolder = true;
	sourceNode.id = id;
	sourceNode.codingCount = 0;
	sourceNode.uiIcon = "fa-tag fa-lg";
	sourceNode.author = author;
	sourceNode.color = color;
	sourceNode.parentID = parentID;
	sourceNode.subCodesIDs = subCodesIDs;
	if (memo == undefined) memo = "";
	sourceNode.memo = memo;

	sourceNode.onclick = function() {
		window.alert("test");
	}

	easytree.addNode(sourceNode);
	easytree.rebuildTree();
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
	
	
	easytree.rebuildTree();
	$(".codingCountBubble").click(showFooter).css( 'cursor', 'pointer' );
}

function removeNodeFromTree(id) {

	easytree.removeNode(id);
	easytree.rebuildTree();
}

function relocateNode(id, target) {

	var sourceNode = easytree.getNode(id);
	sourceNode.isFolder = true;
	var targetId = target;
	easytree.removeNode(id);

	easytree.addNode(sourceNode, target);
	easytree.rebuildTree();
}

function updateNode(id, name, author, color, memo) {

	var sourceNode = easytree.getNode(id);
	sourceNode.text = name;
	sourceNode.author = author;
	sourceNode.color = color;
	sourceNode.memo = memo;
	
	easytree.rebuildTree();
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
		code.name = 'undefined';
		code.author = 'undefined';
		code.color = 'undefined';
	} else {
		code.id = activeNode.id;
		code.name = activeNode.text;

		code.author = activeNode.author;
		code.color = activeNode.color;
		code.parentID = activeNode.parentID;
		code.subCodesIDs = activeNode.subCodesIDs;
		code.memo = activeNode.memo;
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
		relocateCode(source.id, target.id);
	}
}

var initialized_easytree = false;
function codesystemStateChanged(nodes, nodesJson) {
	if (initialized_easytree) {
		active_code = getActiveCode().id;
		if ($("#footer").is(":visible")) {
			fillCodingTable(active_code);
			fillPropertiesView(active_code);
			if (codeMemoEditor != undefined) codeMemoEditor.setHTML(getActiveCode().memo);
		}
	} else {
		initialized_easytree = true;
	}
}

function uploadSelectedDocuments() {
	var jFiler = $("#filer_input").prop("jFiler");
	var files = jFiler.files;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];

		var reader = new FileReader();

		reader.onload = function(e) {
			uploadFile(reader.result, file.name);

		}

		reader.readAsDataURL(file);
	}

}

function uploadFile(fileData, fileName) {
	var requestData = {};
	requestData.fileName = fileName;
	requestData.fileSize = "0";
	requestData.project = project_id;
	requestData.fileData = fileData.split(',')[1];
	gapi.client.qdacity.upload.insertUpload(requestData).execute(function(resp) {
		if (!resp.code) {
			setDocumentList(project_id);
		} else {
			console.log(resp.code + resp.message);
		}
	});
}

function dataURItoBlob(dataURI) {
	// convert base64 to raw binary data held in a string
	// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that
	// does this
	var byteString = atob(dataURI.split(',')[1]);

	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	// write the bytes of the string to an ArrayBuffer
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	// write the ArrayBuffer to a blob, and you're done
	var blob = new Blob([ ab ], {
		type : mimeString
	});
	window.alert("bytestring : " + byteString);
	return byteString;
}

// Font Size

$(function() {
	$('#txtSizeSpinner').spinner({
		min : 1,
		max : 99,
		step : 1
	});
	$('#txtSizeSpinner').width(20);
	$('#txtSizeSpinner').height(25);
});

// Font Selector

(function($) {
	$.widget("custom.combobox", {
		_create : function() {
			this.wrapper = $("<span>").addClass("custom-combobox").insertAfter(this.element);

			this.element.hide();
			this._createAutocomplete();
			this._createShowAllButton();
		},

		_createAutocomplete : function() {
			var selected = this.element.children(":selected"), value = selected.val() ? selected.text() : " ";

			this.input = $("<input>").appendTo(this.wrapper).val(value).attr("title", "").addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left").autocomplete({
				delay : 0,
				minLength : 0,
				source : $.proxy(this, "_source")
			}).tooltip({
				"trigger" : "manual"
			});

			this._on(this.input, {
				autocompleteselect : function(event, ui) {
					ui.item.option.selected = true;
					this._trigger("select", event, {
						item : ui.item.option
					});
					editor.setFontFace(ui.item.option.innerHTML);
				},

				autocompletechange : "_removeIfInvalid"
			});
		},

		_createShowAllButton : function() {
			var input = this.input, wasOpen = false;

			$("<a>").attr("tabIndex", -1).attr("title", "Show All Items").appendTo(this.wrapper).button({
				icons : {
					primary : "ui-icon-triangle-1-s"
				},
				text : false
			}).removeClass("ui-corner-all").addClass("custom-combobox-toggle ui-corner-right").mousedown(function() {
				wasOpen = input.autocomplete("widget").is(":visible");
			}).click(function() {
				input.focus();

				// Close if already visible
				if (wasOpen) {
					return;
				}

				// Pass empty string as value to search for, displaying all
				// results
				input.autocomplete("search", "");
			});
		},

		_source : function(request, response) {
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
			response(this.element.children("option").map(function() {
				var text = $(this).text();
				if (this.value && (!request.term || matcher.test(text)))
					return {
						label : text,
						value : text,
						option : this
					};
			}));
		},

		_removeIfInvalid : function(event, ui) {

			// Selected an item, nothing to do
			if (ui.item) {
				return;
			}

			// Search for a match (case-insensitive)
			var value = this.input.val(), valueLowerCase = value.toLowerCase(), valid = false;
			this.element.children("option").each(function() {
				if ($(this).text().toLowerCase() === valueLowerCase) {
					this.selected = valid = true;
					return false;
				}
			});

			// Found a match, nothing to do
			if (valid) {
				return;
			}

			// Remove invalid value
			this.input.val("").tooltip("set", "content", value + " is not supported").tooltip("show");
			this.element.val("");
			this._delay(function() {
				this.input.tooltip("hide");
			}, 2500);
			this.input.autocomplete("instance").term = "";
		},

		_destroy : function() {
			this.wrapper.remove();
			this.element.show();
		}
	});
})(jQuery);

$(function() {
	$("#combobox").combobox();
	$("#toggle").click(function() {
		$("#combobox").toggle();
	});
});