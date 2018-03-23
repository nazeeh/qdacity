import React from 'react';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';

import DocumentsView from './DocumentsView.jsx';
import BinaryDecider from '../../../common/modals/BinaryDecider.js';
import FileUpload from '../../../common/modals/FileUpload.js';
import Prompt from '../../../common/modals/Prompt.js';
import Confirm from '../../../common/modals/Confirm';

import 'script-loader!../../../../../components/filer/js/jquery.filer.min.js';

import DocumentsEndpoint from '../../../common/endpoints/DocumentsEndpoint';
import UploadEndpoint from '../../../common/endpoints/UploadEndpoint';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const StyledBtnGroup = styled.div`
	padding: 0px 2px 2px 2px;
`;

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
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var decider = new BinaryDecider(
			formatMessage({
				id: 'documentstoolbar.empty_or_upload',
				defaultMessage: 'Empty Document or Upload?'
			}),
			formatMessage({
				id: 'documentstoolbar.new_text',
				defaultMessage: 'New Text Document'
			}),
			formatMessage({
				id: 'documentstoolbar.upload',
				defaultMessage: 'Upload Documents'
			})
		);
		decider.showModal().then(function(value) {
			if (value == 'optionA') _this.addEmptyDocument();
			else _this.addUploadDocuments();
		});
	}

	addEmptyDocument() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var prompt = new Prompt(
			formatMessage({
				id: 'documentstoolbar.document_title_prompt',
				defaultMessage: 'Give your document a name'
			}),
			formatMessage({
				id: 'documentstoolbar.document_title_prompt.sample',
				defaultMessage: 'Document Name'
			})
		);
		prompt.showModal().then(function(docTitle) {
			_this.addDocumentToProject(docTitle);
		});
	}

	addUploadDocuments() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;

		var dialog = new FileUpload(
			formatMessage({
				id: 'documentstoolbar.date_and_color_prompt',
				defaultMessage: 'Select a date and color.'
			})
		);

		dialog.showModal().then(function(files) {
			_this.uploadDocuments(files);
		});
	}

	addDocumentToProject(title) {
		var _this = this;
		var doc = {};
		doc.projectID = this.props.projectID;
		doc.text = ' '; // can not be empty
		doc.title = title;
		doc.positionInOrder = this.props.getNewDocumentPosition();
		doc.projectType = this.props.projectType;
		DocumentsEndpoint.insertTextDocument(doc).then(function(resp) {
			_this.props.addDocument(resp);
		});
	}

	readAndUpload(file) {
		var _this = this;

		var reader = new FileReader();

		reader.onload = function(e) {
			_this.uploadFile(reader.result, file.name);
		};

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
		uploadFile.fileSize = '0';
		uploadFile.project = this.props.projectID;
		uploadFile.fileData = fileData.split(',')[1];
		UploadEndpoint.insertUpload(uploadFile).then(function(resp) {
			_this.props.addDocument(resp);
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
		const { formatMessage } = IntlProvider.intl;
		var docId = this.props.document.id;
		var _this = this;
		var confirm = new Confirm(
			formatMessage(
				{
					id: 'documentstoolbar.delete_document',
					defaultMessage: 'Do you want to delete the document {title}?'
				},
				{
					title: this.props.document.title
				}
			)
		);
		confirm.showModal().then(function() {
			var requestData = {};
			requestData.id = docId;
			DocumentsEndpoint.removeTextDocument(requestData).then(function(resp) {
				_this.props.removeActiveDocument(docId);
			});
		});
	}

	changeTitle() {
		const { formatMessage } = IntlProvider.intl;
		var doc = this.props.document;
		const prompt = new Prompt(
			formatMessage(
				{
					id: 'documentstoolbar.rename',
					defaultMessage: 'New name for document "{title}"'
				},
				{
					title: doc.title
				}
			),
			doc.title
		);
		prompt.showModal().then(value => {
			doc.title = value;
			this.props.changeDocumentData(doc);
		});
	}

	render() {
		return (
			<StyledBtnGroup>
				<BtnDefault onClick={this.changeTitle}>
					<i className="fa fa-pencil fa-1x" />
				</BtnDefault>
				<BtnDefault onClick={this.addDocument}>
					<i className="fa fa-plus fa-1x" />
				</BtnDefault>
				<BtnDefault onClick={this.removeDocumentFromProject}>
					<i className="fa fa-trash fa-1x" />
				</BtnDefault>
			</StyledBtnGroup>
		);
	}
}
