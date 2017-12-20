import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import ReactLoading from '../../../common/ReactLoading.jsx';

import DocumentsEndpoint from '../../../common/endpoints/DocumentsEndpoint';

import DocumentsToolbar from './DocumentsToolbar.jsx'

const StyledDocumentsHeader = styled.div `
	text-align: center;
	position:relative;
	background-color: #e7e7e7;
 `;

const StyledInfoBox = styled.div `
	background-color: ${props =>  props.theme.defaultPaneBg };
	border-left-style: solid;
	border-left-width: thick;
	border-left-color: ${props =>  props.theme.borderPrimaryHighlight };
	border-right-style: solid;
	border-right-width: thick;
	border-right-color: ${props =>  props.theme.borderPrimaryHighlight };
	text-align: center;
`;

const StyledToolBar = styled.div `
	text-align: center;
	position: relative;
	background-color: #e7e7e7;
`;

const StyledDocumentList = styled.div `

	margin:5px 5px 5px 5px;
`;

const StyledDocumentItem = styled.a `
	background-color: ${props => props.active ? props.theme.bgPrimaryHighlight : ''} !important;
	color: ${props => props.active ? props.theme.fgPrimaryHighlight : ''};
	padding: 2px 2px !important;
	position: relative;
	display: block;
	padding: 10px 15px;
	margin-bottom: -1px;
	background-color: #fff;
	border: 1px solid ;
	border-color: ${props => props.theme.borderPrimary} !important;
	&:hover {
		text-decoration: none;
		cursor: pointer;
		background-color: ${props => props.theme.borderPrimary};
		color: ${props => props.theme.fgPrimaryHighlight};
	}
`;

export default class DocumentsView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			documents: [],
			selected: -1,
			isExpanded: true,
			loading: true,
		};

		var setupPromise = this.setupView(this.props.projectID, this.props.projectType, this.props.report);

		const _this = this;
		setupPromise.then(() => {
			_this.setState({
				loading: false
			});
		});

		this.addDocument = this.addDocument.bind(this);
		this.setActiveDocument = this.setActiveDocument.bind(this);
		this.getActiveDocument = this.getActiveDocument.bind(this);
		this.getDocuments = this.getDocuments.bind(this);
		this.removeActiveDocument = this.removeActiveDocument.bind(this);
		this.saveDocument = this.saveDocument.bind(this);
		this.updateCurrentDocument = this.updateCurrentDocument.bind(this);
		this.changeDocumentData = this.changeDocumentData.bind(this);
		this.applyCodeToCurrentDocument = this.applyCodeToCurrentDocument.bind(this);
	}

	setupView(project_id, project_type, agreement_map) {
		var _this = this;
		var promise = new Promise(
			function (resolve, reject) {

				if (typeof agreement_map != 'undefined') {
					DocumentsEndpoint.getAgreementMaps(agreement_map, project_type).then(function (resp) {
						resp.items = resp.items || [];
						for (var i = 0; i < resp.items.length; i++) {
							_this.addDocument(resp.items[i].textDocumentID, resp.items[i].title, resp.items[i].text.value);
						}
						resolve();
					}).catch(function (resp) {
						reject();
					});
				} else {
					DocumentsEndpoint.getDocuments(project_id, project_type).then(function (items) {
						for (var i = 0; i < items.length; i++) {
							_this.addDocument(items[i].id, items[i].title, items[i].text.value);
						}
						resolve();
					}).catch(function (resp) {
						reject();
					});
				}

			}

		);
		return promise;
	}

	calculateCodingCount(codID) {
		var codingCount = 0;
		var documents = this.state.documents;
		for (var index in documents) {
			var doc = documents[index];
			var elements = doc.text;
			var foundArray = $('coding[code_id=\'' + codID + '\']', elements).map(function () {
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
		return codingCount;
	}

	toggleIsExpanded() {
		this.setState({
			isExpanded: !this.state.isExpanded
		});
	}

	// Adds a document and selects the new document as active
	addDocument(pId, pTitle, pText) {
		var doc = {};
		doc.id = pId;
		doc.title = pTitle;
		doc.text = pText;
		this.state.documents.push(doc);
		this.setState({
			documents: this.state.documents
		});
		this.setActiveDocument(doc.id);
	}

	renameDocument(pId, pNewTitle) {
		var index = this.state.documents.findIndex(function (doc, index, array) {
			return doc.id == pId;
		});
		this.state.documents[index].title = pNewTitle;
		this.setState({
			documents: this.state.documents
		});

	}

	updateCurrentDocument(text) {
		var doc = this.getActiveDocument();
		doc.text = text;
		this.changeDocumentData(doc);
	}

	applyCodeToCurrentDocument(text, code) {
		var doc = this.getActiveDocument();
		doc.text = text;
		doc.projectID = this.props.projectID;
		var _this = this;
		DocumentsEndpoint.applyCode(doc, code).then(function (resp) {
			_this.updateDocument(doc.id, doc.title, doc.text);
		});
	}

	changeDocumentData(doc) {
		var _this = this;
		doc.projectID = this.props.projectID;
		DocumentsEndpoint.updateTextDocument(doc).then(function (resp) {
			_this.updateDocument(doc.id, doc.title, doc.text);
		});
	}

	updateDocument(pId, pNewTitle, pText) {
		var index = this.state.documents.findIndex(function (doc, index, array) {
			return doc.id == pId;
		});
		this.state.documents[index].title = pNewTitle;
		this.state.documents[index].text = pText;
		this.setState({
			documents: this.state.documents
		});

	}

	removeActiveDocument() {
		var _this = this;
		var index = this.state.documents.findIndex(function (doc, index, array) {
			return doc.id == _this.state.selected;
		});
		this.state.documents.splice(index, 1);
		this.setState({
			documents: this.state.documents
		});
		this.render();
	}

	saveCurrentDocument() {
		var doc = this.getActiveDocument();
		if (typeof doc != "undefined") {
			doc.text = this.props.editorCtrl.getHTML();
			this.setState({
				documents: this.state.documents
			});
			this.saveDocument(doc);
		}

	}

	saveDocument(doc) {
		doc.projectID = this.props.projectID;
		var _this = this;
		DocumentsEndpoint.updateTextDocument(doc).then(function (resp) { // FIXME not working
		});
	}

	getDocuments() {
		return this.state.documents;
	}

	setActiveDocument(selectedID) {
		if (this.props.editorCtrl.isReadOnly === false) {
			this.saveCurrentDocument();
		}
		this.props.syncService.handleDocumentChange(
			this.state.selected === -1 ? null : this.state.selected.toString(),
			selectedID.toString()
		);
		this.setState({
			selected: selectedID
		});
		this.props.editorCtrl.setDocumentView(this.getDocument(selectedID));

	}

	getActiveDocumentId() {
		return this.state.selected;
	}

	getActiveDocument() {
		return this.getDocument(this.state.selected);
	}

	getDocument(docId) {
		var _this = this;
		var activeDoc = this.state.documents.find(function (doc) {
			return doc.id == docId;
		});
		return activeDoc;
	}

	setDocumentWithCoding(codingID) {
		var documents = this.state.documents;
		for (var i in documents) {
			var doc = documents[i];
			var elements = doc.text;

			var foundArray = $(doc.text).find('coding[id=\'' + codingID + '\']');
			if (foundArray.length > 0) {
				this.setActiveDocument(doc.id);
			}

		}
	}

	renderCollapseIcon() {
		if (this.state.isExpanded) return (<i className="fa fa-compress fa-1x"></i>);
		else return (<i className="fa fa-expand fa-1x"></i>);
	}

	renderToolbar() {
		if (this.props.projectType == "PROJECT") {
			return (
				<DocumentsToolbar
					projectID={this.props.projectID}
					document={this.getActiveDocument()}
					addDocument={this.addDocument}
					removeActiveDocument={this.removeActiveDocument}
					changeDocumentData={this.changeDocumentData}
				/>
			);
		} else {
			return null;
		}

	}

	renderDocuments() {
		var _this = this;
		if (!this.state.isExpanded) {
			return <StyledInfoBox>
		      <b><FormattedMessage id='documentsview.current_document' defaultMessage='Current Document' />: {this.getActiveDocument().title}</b>
		    </StyledInfoBox>
		}
		return (
			<div>
				<StyledToolBar>
					{this.renderToolbar()}
				</StyledToolBar>
				<StyledDocumentList>
		        {
		          this.state.documents.map(function(doc) {
		            return <StyledDocumentItem active={doc.id == _this.state.selected} key={doc.id}  onClick={_this.setActiveDocument.bind(null,doc.id)}>{doc.title}</StyledDocumentItem>
		          })
		        }
		  		</StyledDocumentList>
			</div>
		);
	}

	renderDocumentsContent() {
		if (!this.state.loading) {
			return this.renderDocuments();
		} else {
			return <ReactLoading color={"#020202"}/>;
		}
	}

	render() {
		var _this = this;
		return (
			<div>
				<StyledDocumentsHeader>
					<div className="row no-gutters" >
						<span className="col-xs-1"></span>
						<span className="col-xs-10">
							<b><FormattedMessage id='documentsview.documents' defaultMessage='Documents' /></b>
							<br/>
							<span id="docToolBox"  className="collapse in">
							</span>
						</span>
						<span className="col-xs-1">
							<a id="documentsToggleBtn" className="editorPanelTogel pull-right" onClick={() => this.toggleIsExpanded()}>
								{this.renderCollapseIcon()}
							</a>
						</span>
					</div>
				</StyledDocumentsHeader>
				{this.renderDocumentsContent()}
     	</div>
		);
	}


}