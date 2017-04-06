import DocumentsView from './DocumentsView.jsx';
import BinaryDecider from '../../common/modals/BinaryDecider.js';
import FileUpload from '../../common/modals/FileUpload.js';
import Prompt from '../../common/modals/Prompt.js';
import 'script!../../../../components/filer/js/jquery.filer.min.js';

import DocumentsEndpoint from '../../common/endpoints/DocumentsEndpoint';
import UploadEndpoint from '../../common/endpoints/UploadEndpoint';


export default class DocumentsCtrl {

	constructor(documentsView, projectID) {
		this.view = documentsView;
		this.projectID = projectID;
		this.addDocument = this.addDocument.bind(this);

		this.bindDomElements();
	}

	addDocument() {
		var _this = this;
		var decider = new BinaryDecider('Empty Document or Upload?', 'New Text Document', 'Upload Documents');
		decider.showModal().then(function (value) {
			if (value == 'optionA') _this.addEmptyDocument();
			else _this.addUploadDocuments();
		});
	}

	addEmptyDocument() {
		var _this = this;
		var prompt = new Prompt('Give your document a name', 'Document Name');
		prompt.showModal().then(function (docTitle) {
			_this.addDocumentToProject(docTitle);
		});
	}

	addUploadDocuments() {
		var _this = this;

		var dialog = new FileUpload('Select a date and color.');

		dialog.showModal().then(function (files) {
			_this.uploadDocuments(files);
		});
	}


	addDocumentToProject(title) {
		var _this = this;
		var doc = {};
		doc.projectID = this.projectID;
		doc.text = " "; // can not be empty
		doc.title = title;

		DocumentsEndpoint.insertTextDocument(doc).then(function (resp) {
			_this.view.addDocument(resp.id, resp.title, resp.text.value);
		});

	}

	readAndUpload(file) {
		var _this = this;

		var reader = new FileReader();

		reader.onload = function (e) {
			_this.uploadFile(reader.result, file.name);

		}

		reader.readAsDataURL(file);

	}

	uploadDocuments(files) {
		var _this = this;
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			this.readAndUpload(file);

		}
	}

	uploadFile(fileData, fileName) {
		var _this = this;
		var uploadFile = {};
		uploadFile.fileName = fileName;
		uploadFile.fileSize = "0";
		uploadFile.project = this.projectID;
		uploadFile.fileData = fileData.split(',')[1];
		UploadEndpoint.insertUpload(uploadFile).then(function (resp) {
			_this.view.addDocument(resp.id, resp.title, resp.text.value);
		});
	}

	setDocumentWithCoding(codingID) {
		var documents = this.view.getDocuments();
		for (var i in documents) {
			var doc = documents[i];
			var elements = doc.text;

			var foundArray = $(doc.text).find('coding[id=\'' + codingID + '\']');
			if (foundArray.length > 0) {
				this.view.setActiveDocument(doc.id);
			}

		}
	}

	//TODO: Currently not used, as long as files are sent directly through the endpoint. This is limited to 1MB and when uploading to cloud storage we need to send blobs
	dataURItoBlob(dataURI) {
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
		var blob = new Blob([ab], {
			type: mimeString
		});
		window.alert("bytestring : " + byteString);
		return byteString;
	}

	changeTitle() {
		var doc = this.view.getActiveDocument();
		var title = prompt("New name for document \"" + doc.title + "\"", "Title");
		this.changeDocumentData(doc.id, title, doc.text);
	}

	saveCurrentDoc(text) {
		var doc = this.view.getActiveDocument();
		this.changeDocumentData(doc.id, doc.title, text);
	}

	changeDocumentData(id, title, text) {

		var requestData = {};
		requestData.id = id;
		requestData.title = title;
		requestData.text = text;
		requestData.projectID = this.projectID;
		var _this = this;
		DocumentsEndpoint.updateTextDocument(requestData).then(function (resp) {
			_this.view.updateDocument(id, title, requestData.text);
		});
	}

	removeDocumentFromProject() {
		var docId = this.view.getActiveDocumentId();
		var _this = this;
		var requestData = {};
		requestData.id = docId;
		DocumentsEndpoint.removeTextDocument(requestData).then(function (resp) {
			_this.view.removeDocument(docId);
		});
	}

	bindDomElements() {
		var _this = this;
		$('#btnRemoveDoc').click(function () {
			_this.removeDocumentFromProject();
		});
		$('#btnRemoveDoc').tooltipster({
			content: $('<span>Remove Document</span>')
		});

		$('#btnUpdateDoc').click(function () {
			_this.changeTitle();
		});
		$('#btnUpdateDoc').tooltipster({
			content: $('<span>Rename Document</span>')
		});

		$("#btnInsertDoc").click(this.addDocument);
		$('#btnInsertDoc').tooltipster({
			content: $('<span>New Document</span>')
		});
	}

	setupView(project_id, project_type, agreement_map) {
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {

				if (typeof agreement_map != 'undefined') {
					DocumentsEndpoint.getAgreementMaps(agreement_map, project_type).then(function (resp) {
						resp.items = resp.items || [];
						for (var i = 0; i < resp.items.length; i++) {
							_this.view.addDocument(resp.items[i].textDocumentID, resp.items[i].title, resp.items[i].text.value);
						}
						resolve();
						$("#documentsLoadingDiv").addClass('hidden');
					}).catch(function (resp) {
						reject();
						$("#documentsLoadingDiv").addClass('hidden');
					});
				} else {
					DocumentsEndpoint.getDocuments(project_id, project_type).then(function (items) {
						for (var i = 0; i < items.length; i++) {
							_this.view.addDocument(items[i].id, items[i].title, items[i].text.value);
						}
						resolve();
						$("#documentsLoadingDiv").addClass('hidden');
					}).catch(function (resp) {
						reject();
						$("#documentsLoadingDiv").addClass('hidden');
					});
				}

			}

		);
		return promise;
	}
}