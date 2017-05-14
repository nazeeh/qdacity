import React from 'react';

import DocumentsEndpoint from '../../common/endpoints/DocumentsEndpoint';

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
		this.saveDocument = this.saveDocument.bind(this);
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
			}
		};
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

	removeDocument(pId) {
		var index = this.state.documents.findIndex(function (doc, index, array) {
			return doc.id == pId;
		});
		this.state.documents.splice(index, 1);
		this.setState({
			documents: this.state.documents
		});
		this.render();
	}
	
	saveCurrentDocument(){
			var doc = this.getDocument(this.state.selected);
			doc.text = this.props.editorCtrl.getHTML();
			this.setState({
				documents: this.state.documents
			});
			this.saveDocument(doc);
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

	getActiveDocumentId(selectedID) {
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

	isActive(value) {
		return 'list-group-item clickable ' + ((value == this.state.selected) ? 'active' : 'default');
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
			<div className="list-group">
        {
          this.state.documents.map(function(doc) {	
            return <a className= {_this.isActive(doc.id)} key={doc.id}  onClick={_this.setActiveDocument.bind(null,doc.id)}>{doc.title}</a>
          })
        }
      </div>
		);
	}


}