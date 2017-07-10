import DocumentsView from './Documents/DocumentsView.jsx';

import CodeView from './CodeView/CodeView.jsx';
import Account from '../../common/Account.jsx';
import ReactLoading from '../../common/ReactLoading.jsx';
import EditorCtrl from './EditorCtrl';
import loadGAPIs from '../../common/GAPI';
import Codesystem from './Codesystem/Codesystem.jsx';
import PageViewChooser from './PageViewChooser.jsx';

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

var account;

var codeView;
var documentsView;
var codesystemView

var editorCtrl = {};

window.init = function () {

	ReactDOM.render(<ReactLoading />, document.getElementById('documentsLoaderMount'));
	ReactDOM.render(<ReactLoading />, document.getElementById('codesystemLoaderMount'));

	editorCtrl = new EditorCtrl(getCodeByCodeID);


	$('.tooltips').tooltipster();
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

			let pageViewChooser = ReactDOM.render(<PageViewChooser viewChanged={viewChanged} />, document.getElementById('pageViewChooser-ui'));

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
		});
	} else {
		$('#navAccount').hide();
	}
}

function viewChanged(view) {
	alert(view);
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

		codeView = ReactDOM.render(<CodeView editorCtrl={editorCtrl} documentsView={documentsView} updateSelectedCode={updateSelectedCode} getCodeByCodeID={getCodeByCodeID} getCodeSystem={getCodeSystem} hideCodingView={hideCodingView}/>, document.getElementById('codeView'));
	}

	return documentsView.setupView(project_id, project_type, report);
}

function updateCodeView(code) {
	if ($("#footer").is(":visible")) {
		codeView.updateCode(code);
	}
}