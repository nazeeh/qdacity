import React from 'react';

import DocumentsView from './DocumentsView.jsx';
import BinaryDecider from '../../../common/modals/BinaryDecider.js';
import FileUpload from '../../../common/modals/FileUpload.js';
import Prompt from '../../../common/modals/Prompt.js';
import 'script!../../../../../components/filer/js/jquery.filer.min.js';

import DocumentsEndpoint from '../../../common/endpoints/DocumentsEndpoint';
import UploadEndpoint from '../../../common/endpoints/UploadEndpoint';

export default class DocumentsToolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isProjectOwner: false,
			umlEditor: this.props.umlEditor
		};

		this.addDocument = this.addDocument.bind(this);
		this.removeDocumentFromProject = this.removeDocumentFromProject.bind(this);
		this.changeTitle = this.changeTitle.bind(this);
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
		doc.projectID = this.props.projectID;
		doc.text = " "; // can not be empty
		doc.title = title;

		DocumentsEndpoint.insertTextDocument(doc).then(function (resp) {
			_this.props.addDocument(resp.id, resp.title, resp.text.value);
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
		uploadFile.project = this.props.projectID;
		uploadFile.fileData = fileData.split(',')[1];
		UploadEndpoint.insertUpload(uploadFile).then(function (resp) {
			_this.props.addDocument(resp.id, resp.title, resp.text.value);
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

	removeDocumentFromProject() {
		var docId = this.props.document.id;
		var _this = this;
		var requestData = {};
		requestData.id = docId;
		DocumentsEndpoint.removeTextDocument(requestData).then(function (resp) {
			_this.props.removeActiveDocument(docId);
		});
	}

	changeTitle() {
		var doc = this.props.document;
		const prompt = new Prompt("New name for document \"" + doc.title + "\"", doc.title);
		prompt.showModal().then((value) => {
			doc.title = value;
			this.props.changeDocumentData(doc);
		});
	}

	render() {
		return (
			<div className="btn-group">
				<a className="btn btn-default" onClick={this.changeTitle}>
					<i className="fa fa-pencil fa-1x"></i>
				</a>
				<a className="btn btn-default" onClick={this.addDocument}>
					<i className="fa fa-plus fa-1x"></i>
				</a>
				<a className="btn btn-default" onClick={this.removeDocumentFromProject}>
					<i className="fa fa-trash fa-1x"></i>
				</a>
			</div>
		);
	}


}