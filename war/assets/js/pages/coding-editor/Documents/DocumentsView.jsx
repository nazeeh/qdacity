import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import ReactLoading from '../../../common/ReactLoading.jsx';

import { DragDocument } from './Document.jsx';

import DocumentsEndpoint from '../../../common/endpoints/DocumentsEndpoint';

import DocumentsToolbar from './DocumentsToolbar.jsx';

const StyledDocumentsHeader = styled.div`
	text-align: center;
	position: relative;
	background-color: #e7e7e7;
`;

const StyledInfoBox = styled.div`
	background-color: ${props => props.theme.defaultPaneBg};
	border-left-style: solid;
	border-left-width: thick;
	border-left-color: ${props => props.theme.borderPrimaryHighlight};
	border-right-style: solid;
	border-right-width: thick;
	border-right-color: ${props => props.theme.borderPrimaryHighlight};
	text-align: center;
`;

const StyledToolBar = styled.div`
	text-align: center;
	position: relative;
	background-color: #e7e7e7;
`;

const StyledDocumentList = styled.div`
	margin: 5px 5px 5px 5px;
`;

export default class DocumentsView extends React.Component {
	constructor(props) {
		super(props);
		this.codingCountWorker = new Worker('dist/js/web-worker/codingCountWorker.dist.js'); // create web worker
		this.state = {
			documents: [],
			selected: -1,
			isExpanded: true,
			loading: true
		};

		var setupPromise = this.setupView(
			this.props.projectID,
			this.props.projectType,
			this.props.report
		);

		const _this = this;
		setupPromise.then(() => {
			_this.setState({
				loading: false,
				documents: _this.state.documents.sort((doc1, doc2) => {
					return doc1.positionInOrder - doc2.positionInOrder;
				})
			});

			// Persists the order of documents if no order is persisted in the database.
			_this.persistDocumentsOrderIfNecessary();

			if (this.state.documents.length > 0) {
				_this.setActiveDocument(this.state.documents[0].id);
			}
		});

		this.addDocument = this.addDocument.bind(this);
		this.setActiveDocument = this.setActiveDocument.bind(this);
		this.getActiveDocument = this.getActiveDocument.bind(this);
		this.getDocuments = this.getDocuments.bind(this);
		this.removeActiveDocument = this.removeActiveDocument.bind(this);
		this.saveDocument = this.saveDocument.bind(this);
		this.updateCurrentDocument = this.updateCurrentDocument.bind(this);
		this.changeDocumentData = this.changeDocumentData.bind(this);
		this.applyCodeToCurrentDocument = this.applyCodeToCurrentDocument.bind(
			this
		);
		this.swapDocuments = this.swapDocuments.bind(this);
		this.persistSwappedDocuments = this.persistSwappedDocuments.bind(this);
		this.getNewDocumentPosition = this.getNewDocumentPosition.bind(this);
	}

	setupView(project_id, project_type, agreement_map) {
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			if (typeof agreement_map != 'undefined') {
				DocumentsEndpoint.getAgreementMaps(agreement_map, project_type)
					.then(function(resp) {
						resp.items = resp.items || [];
						for (var i = 0; i < resp.items.length; i++) {
							let doc = resp.items[i];
							doc.id = doc.textDocumentID;
							_this.addDocument(doc);
						}
						resolve();
					})
					.catch(function(resp) {
						reject();
					});
			} else {
				DocumentsEndpoint.getDocuments(project_id, project_type)
					.then(function(items) {
						items = items || [];
						_this.addAllDocuments(items);
						resolve();
					})
					.catch(function(resp) {
						reject();
					});
			}
		});
		return promise;
	}

	// returns a promis that resolves in the coding count value
	// the calculation is handled asynchronously in web worker
	async calculateCodingCount(codeIDs) {
		let _this = this;
		await this.setupPromise;
		this.codingCountWorker.postMessage({ documents: this.state.documents, codeIDs: codeIDs }); // post a message to our worker
		return new Promise(function(resolve, reject) {
			_this.codingCountWorker.addEventListener('message', function handleEvent (event) { // listen for events from the worker
					let codingCountKeys = Array.from(event.data.keys());
					console.log(`Results for  ${codingCountKeys} are in`);
					if (codeIDs.length==codingCountKeys.length && codeIDs.every((v,i)=> v === codingCountKeys[i])){
						_this.codingCountWorker.removeEventListener('message', handleEvent);
						resolve(event.data); // resolve with codingCount for codeID
					}
				}
			);
		});
	}

	toggleIsExpanded() {
		this.setState({
			isExpanded: !this.state.isExpanded
		});
	}

	// Adds a document and selects the new document as active
	addDocument(doc) {
		doc.text = doc.text.value;
		this.state.documents.push(doc);
		this.setState({
			documents: this.state.documents
		});
		this.setActiveDocument(doc.id);
	}

	// Adds an array of documents to the state
	// Does not set an active document
	addAllDocuments(docList) {

		if (!typeof !docList || !docList.length || docList.length === 0) return;

		for (var i = 0; i < docList.length; i++) {
			let doc = docList[i];
			doc.text = doc.text.value;
			this.state.documents.push(doc);
		}
		this.setState({
			documents: this.state.documents
		});
	}

	renameDocument(pId, pNewTitle) {
		var index = this.state.documents.findIndex(function(doc, index, array) {
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
		DocumentsEndpoint.applyCode(doc, code).then(function(resp) {
			_this.updateDocument(doc.id, doc.title, doc.text);
		});
	}

	changeDocumentData(doc) {
		var _this = this;
		doc.projectID = this.props.projectID;
		DocumentsEndpoint.updateTextDocument(doc).then(function(resp) {
			_this.updateDocument(doc.id, doc.title, doc.text);
		});
	}

	updateDocument(pId, pNewTitle, pText) {
		var index = this.state.documents.findIndex(function(doc, index, array) {
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
		var index = this.state.documents.findIndex(function(doc, index, array) {
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
		if (typeof doc != 'undefined') {
			doc.text = this.props.textEditor.getHTML();
			this.setState({
				documents: this.state.documents
			});
			this.saveDocument(doc);
		}
	}

	saveDocument(doc) {
		doc.projectID = this.props.projectID;
		var _this = this;
		DocumentsEndpoint.updateTextDocument(doc).then(function(resp) {
			// FIXME not working
		});
	}

	getDocuments() {
		return this.state.documents;
	}

	setActiveDocument(selectedID) {
		if (this.props.textEditor.isTextEditable()) {
			this.saveCurrentDocument();
		}
		this.props.syncService.updateUser({
			document: selectedID.toString()
		});
		this.setState({
			selected: selectedID
		});
		this.props.textEditor.setHTML(this.getDocument(selectedID).text);
	}

	getActiveDocumentId() {
		return this.state.selected;
	}

	getActiveDocument() {
		return this.getDocument(this.state.selected);
	}

	getDocument(docId) {
		var _this = this;
		var activeDoc = this.state.documents.find(function(doc) {
			return doc.id == docId;
		});
		return activeDoc;
	}

	getNewDocumentPosition() {
		if (this.state.documents == null || this.state.documents.length == 0) {
			return 1;
		}

		return (
			parseInt(
				this.state.documents[this.state.documents.length - 1].positionInOrder
			) + 1
		);
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

	swapDocuments(dragIndex, hoverIndex) {
		const swap = this.state.documents[dragIndex];

		this.state.documents[dragIndex] = this.state.documents[hoverIndex];
		this.state.documents[hoverIndex] = swap;

		this.forceUpdate();
	}

	persistSwappedDocuments(dragIndex, targetIndex) {
		this.persistOrderOfDocuments();
	}

	/**
	 * Checks if the order of documents is already persisted in the database and persists the current order if not.
	 */
	persistDocumentsOrderIfNecessary() {
		let persistOrder = false;

		for (let i = 0; i < this.state.documents.length; i++) {
			if (
				this.state.documents[i].positionInOrder == 0 ||
				this.state.documents[i].positionInOrder == null
			) {
				persistOrder = true;
			}
		}

		if (persistOrder) {
			this.persistOrderOfDocuments();
		}
	}

	/**
	 * Persist the current order of documents in the database.
	 */
	persistOrderOfDocuments() {
		for (let i = 0; i < this.state.documents.length; i++) {
			this.state.documents[i].positionInOrder = i + 1;
		}

		if (this.state.documents.length > 0) {
			// AgreementMaps and TextDocuments are updated with different Endpoints

			// AgreementMaps
			if (this.state.documents[0].textDocumentID) {
				DocumentsEndpoint.reorderAgreementMapPositions(
					this.props.report,
					this.props.projectType,
					this.state.documents
				).then(function(resp) {
					// Do nothing
				});
			} else {
				// TextDocuments
				DocumentsEndpoint.updateTextDocuments(this.state.documents).then(
					function(resp) {
						// Do nothing
					}
				);
			}
		}
	}

	renderCollapseIcon() {
		if (this.state.isExpanded) return <i className="fa fa-compress fa-1x" />;
		else return <i className="fa fa-expand fa-1x" />;
	}

	renderToolbar() {
		if (this.props.projectType == 'PROJECT') {
			return (
				<DocumentsToolbar
					projectID={this.props.projectID}
					document={this.getActiveDocument()}
					addDocument={this.addDocument}
					removeActiveDocument={this.removeActiveDocument}
					changeDocumentData={this.changeDocumentData}
					getNewDocumentPosition={this.getNewDocumentPosition}
					projectType={this.props.projectType}
				/>
			);
		} else {
			return null;
		}
	}

	renderDocument(doc, index) {
		return (
			<DragDocument
				doc={doc}
				key={doc.id}
				index={index}
				active={doc.id == this.state.selected}
				setActiveDocument={this.setActiveDocument}
				swapDocuments={this.swapDocuments}
				persistSwappedDocuments={this.persistSwappedDocuments}
				syncService={this.props.syncService}
			>
				{doc.title}
			</DragDocument>
		);
	}

	renderDocuments() {
		if (!this.state.isExpanded) {
			return (
				<StyledInfoBox>
					<b>
						<FormattedMessage
							id="documentsview.current_document"
							defaultMessage="Current Document"
						/>:
						{this.getActiveDocument().title}
					</b>
				</StyledInfoBox>
			);
		}

		return (
			<div>
				<StyledToolBar>{this.renderToolbar()}</StyledToolBar>
				<StyledDocumentList>
					{this.state.documents.map((doc, index) => {
						return this.renderDocument(doc, index);
					})}
				</StyledDocumentList>
			</div>
		);
	}

	render() {
		return (
			<div>
				<StyledDocumentsHeader>
					<div className="row no-gutters">
						<span className="col-xs-1" />
						<span className="col-xs-10">
							<b>
								<FormattedMessage
									id="documentsview.documents"
									defaultMessage="Documents"
								/>
							</b>
							<br />
							<span id="docToolBox" className="collapse in" />
						</span>
						<span className="col-xs-1">
							<a
								id="documentsToggleBtn"
								className="editorPanelTogel pull-right"
								onClick={() => this.toggleIsExpanded()}
							>
								{this.renderCollapseIcon()}
							</a>
						</span>
					</div>
				</StyledDocumentsHeader>
				{this.state.loading ? (
					<ReactLoading color={'#020202'} />
				) : (
					this.renderDocuments()
				)}
			</div>
		);
	}
}
