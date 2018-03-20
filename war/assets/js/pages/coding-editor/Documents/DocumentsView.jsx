import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import ReactLoading from '../../../common/ReactLoading.jsx';

import { DragDocument } from './Document.jsx';

import Alert from '../../../common/modals/Alert';
import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';
import DocumentsEndpoint from '../../../common/endpoints/DocumentsEndpoint';
import { EVT } from '../../../common/SyncService/constants.js';

import DocumentsToolbar from './DocumentsToolbar.jsx';

import SlateUtils from '../TextEditor/SlateUtils.js';

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
		// create web worker
		// path is from / to distribution package built with webpack
		this.codingCountWorker = new Worker(
			'dist/js/web-worker/codingCountWorker.dist.js'
		);
		this.state = {
			documents: [],
			selected: -1,
			isExpanded: true,
			loading: true
		};
		this.listenerIDs = {};

		var setupPromise = this.setupView(
			this.props.projectID,
			this.props.projectType,
			this.props.report
		);

		setupPromise.then(() => {
			this.setState({
				loading: false,
				documents: this.state.documents.sort((doc1, doc2) => {
					return doc1.positionInOrder - doc2.positionInOrder;
				})
			});

			// Persists the order of documents if no order is persisted in the database.
			this.persistDocumentsOrderIfNecessary();

			if (this.state.documents.length > 0) {
				this.setActiveDocument(this.state.documents[0].id);
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

	// returns a promise that resolves in the coding count value
	// the calculation is handled asynchronously in web worker
	async calculateCodingCount(codeIDs) {
		const _this = this;

		await this.setupPromise;

		// Get only texts from documents to remove unserializable properties
		// like SlateValue
		const documents = this.state.documents.map(doc => ({ text: doc.text }));

		this.codingCountWorker.postMessage({
			documents,
			codeIDs: codeIDs
		}); // post a message to our worker

		return new Promise(function(resolve, reject) {
			_this.codingCountWorker.addEventListener('message', function handleEvent(
				event
			) {
				// listen for events from the worker
				let codingCountKeys = Array.from(event.data.keys());
				console.log(`Results for  ${codingCountKeys} are in`);
				if (
					codeIDs.length == codingCountKeys.length &&
					codeIDs.every((v, i) => v === codingCountKeys[i])
				) {
					_this.codingCountWorker.removeEventListener('message', handleEvent);
					resolve(event.data); // resolve with codingCount for codeID
				}
			});
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

	async applyCodeToCurrentDocument(code, author) {
		const document = this.getActiveDocument();
		const {
			getCodeByCodeID,
			projectID,
			projectType,
		} = this.props;

		// Store slate value and selection to be independent of other
		// intermediate changes
		const slateValue = this.props.textEditor.getSlateValue();
		const currentSelection = slateValue.selection;

		// Do nothing if no range is selected
		if (currentSelection.isCollapsed) {
			return;
		}

		// To be called after setState executed
		const onStateChange = () => {
			// Update DocumentsView's state
			this.updateDocument(
				document.id,
				document.title,
				SlateUtils.serialize(this.props.textEditor.getSlateValue()),
			);

			// Update coding count in CodeSystem
			this.props.codesystemView.updateCodingCount();
		};

		let maxCodingID;
		try {
			// Get new coding ID from API
			const response = await ProjectEndpoint.incrCodingId(projectID, projectType);
			maxCodingID = response.maxCodingID
		} catch(e) {
			// Inform the user about the failure
			new Alert('Your new coding could not be saved. Please try again').showModal();

			console.error('error while fetching next coding ID', e);
		}

		// Create the operation to be executed
		const operations = SlateUtils
			.rangeToPaths(slateValue, currentSelection)
			.map(({ path, offset, length }) => ({
				object: 'operation',
				type: 'add_mark',
				mark: {
					object: 'mark',
					type: 'coding',
					data: {
						id: maxCodingID,
						code_id: code.codeID,
						title: code.name,
						author: author,
					},
				},
				path,
				offset,
				length,
			}));

		// Optimistically add the mark locally
		this.props.textEditor.applyOperations(operations, onStateChange);

		// Send change to sync service
		try {
			const message = await this.props.syncService.documents.addCoding(
				document.id,
				operations,
				getCodeByCodeID(code.codeID)
			);

			// Sync was successful. Log for now, delete if no action needed
			console.log('Sync of coding.add succeeded');

		// Sync failed
		} catch(e) {

			// Inform the user why the mark is disappearing again
			new Alert('Your new coding could not be saved. Please try again').showModal();

			console.error('Error while syncing coding.add', e);

			// Rollback optimistically added mark
			const undoOperations = SlateUtils.invertOperations(operations);
			this.props.textEditor.applyOperations(undoOperations, onStateChange);
		}
	}

	/**
	 * Remove coding from current selection
	 *
	 * This removes all codings with the given code ID from the current
	 * selection. If the removal leads to two remaining halfs of a coding,
	 * the latter half gets a new coding ID.
	 *
	 * @public
	 * @arg {string} codeID - the ID of the code to remove
	 * @return {Promise} - Waits for all code removals and splittings to be
	 *                     successfully processed. Resolves with the editors
	 *                     current content as HTML. Rejects if there is an
	 *                     error while fetching a new coding ID from the API
	 *                     or if nothing is selected
	 */
	async removeCoding(codeID) {
		// Store parts of the state for queries to be independent of other
		// intermediate changes. MUST NOT BE USED AS BASE FOR STATE UPDATES!
		// Otherwise intermediate changes would be discarded
		const slateValue = this.props.textEditor.getSlateValue();
		const { selection, document } = slateValue;

		// Do nothing if no range is selected
		if (selection.isCollapsed) {
			return;
		}

		// Send all changes to sync service
		const syncPromise = this.props.syncService.documents.removeCoding(
			this.getActiveDocumentId(),
			SlateUtils.rangeToPathRange(slateValue, selection),
			codeID
		);

		// Find codings that should be removed and built operations from it
		const operations = document
			.getMarksAtRange(selection)
			.filter(mark => mark.type === 'coding')
			.filter(mark => mark.data.get('code_id') === codeID)
			.reduce((operations, coding) => {
				return operations.concat(
					SlateUtils
						.rangeToPaths(slateValue, selection)
						.reduce((operations, { path, offset, length }) => {
							return operations.concat({
								object: 'operation',
								type: 'remove_mark',
								mark: coding,
								path,
								offset,
								length,
							});
						}, [])
				);
			}, []);

		// Optimistically remove the mark locally
		this.props.textEditor.applyOperations(operations);

		try {
			const message = await syncPromise;

			// Sync was successful. Log for now, delete if no action needed
			console.log('Sync of coding.remove succeeded');
		} catch(e) {

			// Inform the user why the mark is disappearing again
			new Alert('The coding could not be removed. Please try again').showModal();

			console.error('Error while syncing coding.remove', e);

			// Rollback optimistically added mark
			const undoOperations = SlateUtils.invertOperations(operations);
			this.props.textEditor.applyOperations(undoOperations);
		}

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

	/**
	 * Set the document to be shown in the text editor pane. Deserializes the
	 * document from HTML to Slate Value if not already done
	 */
	setActiveDocument(id) {
		// Save previous document if existent
		const prevDoc = this.getActiveDocument();
		if (typeof prevDoc !== 'undefined') {
			prevDoc.slateValue = this.props.textEditor.getSlateValue();
			prevDoc.text = SlateUtils.serialize(prevDoc.slateValue);

			this.setState({
				documents: this.state.documents
			});

			// Upload the current document to the backend if it is in editable mode
			if (this.props.textEditor.isTextEditable()) {
				this.saveDocument(prevDoc);
			}
		}

		// Get document to be shown and deserialize if necessary
		const nextDoc = this.getDocument(id);
		if (!nextDoc.slateValue) {
			nextDoc.slateValue = SlateUtils.deserialize(nextDoc.text);
		}
		// Apply queued operations if any
		if (nextDoc.operationQueue) {
			nextDoc.slateValue = SlateUtils.applyOperations(
				nextDoc.slateValue,
				nextDoc.operationQueue
			);
			nextDoc.operationQueue = [];
		}

		// Notify sync service (and other clients) that the user changed the
		// active document
		this.props.syncService.updateUser({
			document: id.toString()
		});

		// Change the active document and save document changes
		this.setState({
			selected: id,
			documents: this.state.documents,
		});

		// Update the text editor
		this.props.textEditor.setDocument(nextDoc);
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

	/**
	 * Process incoming operations from SyncService
	 *
	 * @private
	 * @arg {object} data - Object with at least these parameters:
	 *                      {string} document - ID of the document to apply to
	 *                      {object[]} operations - Slate.Operations to apply
	 */
	_applySyncServiceOperations(data) {
		const {
			document,
			operations,
		} = data;

		// If operations are for current document, apply directly
		if (document === this.getActiveDocumentId()) {
			this.props.textEditor.applyOperations(operations);

		// Process operations in DocumentsView
		} else {
			const doc = this.getDocument(document);

			// Apply if document has already been deserialized
			if (doc.slateValue) {
				doc.slateValue = SlateUtils.applyOperations(doc.slateValue, operations);

			// Else queue the operations for application after deserialization
			} else {
				if (!doc.operationQueue) {
					doc.operationQueue = [];
				}
				doc.operationQueue = doc.operationQueue.concat(operations);
			}

			this.setState({
				documents: this.state.documents
			});
		}

		// In any case upgrade coding count
		this.props.codesystemView.updateCodingCount();
	}

	componentDidMount() {
		// Register event listeners at sync service
		this.listenerIDs = {
			[EVT.CODING.ADDED]: this.props.syncService.on(
				EVT.CODING.ADDED,
				this._applySyncServiceOperations.bind(this)
			),
			[EVT.CODING.REMOVED]: this.props.syncService.on(
				EVT.CODING.REMOVED,
				this._applySyncServiceOperations.bind(this)
			),
		};
	}

	componentWillUnmount() {
		// Unregister event listeners at sync service
		Object.keys(this.listenerIDs).forEach(key => {
			this.props.syncService.off(key, this.listenerIDs[key]);
		});
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
