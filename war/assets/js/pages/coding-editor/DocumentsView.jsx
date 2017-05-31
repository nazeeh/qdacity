import React from 'react';

import DocumentsEndpoint from '../../common/endpoints/DocumentsEndpoint';

import DocumentsToolbar from './DocumentsToolbar.jsx'

export default class DocumentsView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			documents: [],
			selected: -1,
			isExpanded: true
		};
		this.addDocument = this.addDocument.bind(this);
		this.setActiveDocument = this.setActiveDocument.bind(this);
		this.isActive = this.isActive.bind(this);
		this.getActiveDocument = this.getActiveDocument.bind(this);
		this.getDocuments = this.getDocuments.bind(this);
		this.removeActiveDocument = this.removeActiveDocument.bind(this);
		this.saveDocument = this.saveDocument.bind(this);
		this.updateCurrentDocument = this.updateCurrentDocument.bind(this);
		this.changeDocumentData = this.changeDocumentData.bind(this);
	}
	
	getStyles() {
		return {
			infoBox: {
				backgroundColor: "#FAFAFA",
				borderLeftStyle: "solid",
				borderLeftWidth: "thick",
				borderLeftColor: "#337ab7",
				borderRightStyle: "solid",
				borderRightWidth: "thick",
				borderRightColor: "#337ab7",
				textAlign: "center"
			},
			toolBar: {
				textAlign: "center",
				position: "relative",
				backgroundColor: "#e7e7e7"
			}
		};
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
						$("#documentsLoadingDiv").addClass('hidden');
					}).catch(function (resp) {
						reject();
						$("#documentsLoadingDiv").addClass('hidden');
					});
				} else {
					DocumentsEndpoint.getDocuments(project_id, project_type).then(function (items) {
						for (var i = 0; i < items.length; i++) {
							_this.addDocument(items[i].id, items[i].title, items[i].text.value);
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
	
	calculateCodingCount(codID){
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
	
	toggleIsExpanded(){
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
	
	saveCurrentDocument(){
			var doc = this.getActiveDocument();
			if (typeof doc != "undefined"){
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
		if (this.props.editorCtrl.isReadOnly === false){
			this.saveCurrentDocument();
		}
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

	isActive(value) {
		return 'list-group-item clickable ' + ((value == this.state.selected) ? 'active' : 'default');
	}
	
	renderToolbar(){
		if (this.props.projectType =="PROJECT"){
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

	render() {
		var _this = this;
		const styles = this.getStyles();
		if (!this.state.isExpanded){
			return <div style={styles.infoBox}>
		      <b>Current Document: {this.getActiveDocument().title}</b>
		    </div>
		}
		return (
		<div>
			<div  style={styles.toolBar}>
				{this.renderToolbar()}
			</div>
			<div className="list-group">
	        {
	          this.state.documents.map(function(doc) {	
	            return <a className= {_this.isActive(doc.id)} key={doc.id}  onClick={_this.setActiveDocument.bind(null,doc.id)}>{doc.title}</a>
	          })
	        }
	  		</div>
     	</div>
		);
	}


}