export default class DocumentsView extends React.Component {
constructor(props) {
    super(props);
    this.state = {documents: [], selected: -1};
	this.addDocument = this.addDocument.bind(this); 
	this.setActiveDocument = this.setActiveDocument.bind(this); 
	this.isActive = this.isActive.bind(this); 
	this.getActiveDocument = this.getActiveDocument.bind(this); 
	this.getDocuments = this.getDocuments.bind(this); 
  }  
 
  addDocument(pId, pTitle, pText){
	  var doc = {};
	  doc.id = pId;
	  doc.title = pTitle;
	  doc.text = pText;
	  this.state.documents.push(doc);
	  this.setState({documents: this.state.documents});
  }
  
  renameDocument(pId, pNewTitle){
	var index = this.state.documents.findIndex(function (doc, index, array) {
		return doc.id == pId;
	});
	this.state.documents[index].title = pNewTitle;
	this.setState({documents: this.state.documents});

  }
  
  removeDocument(pId){
	var index = this.state.documents.findIndex(function (doc, index, array) {
		return doc.id == pId;
	});
	this.state.documents.splice( index, 1 );
	this.setState({documents: this.state.documents});
	this.render();
  }
  
  getDocuments(){
  	return this.state.documents;
  }
  
  setActiveDocument(selectedID){
	  this.setState({selected: selectedID});
	  this.props.setEditor(selectedID);
  }
  
  getActiveDocumentId(selectedID){
	  return this.state.selected;
  }
  
  getActiveDocument(){
		return this.getDocument(this.state.selected);
  }
  
  getDocument(docId){
  	var _this = this;
	  var activeDoc = this.state.documents.find(function (doc) {
		return doc.id == docId;
		});
		return activeDoc;
  }
  
  isActive(value){
    return 'list-group-item ' + ((value==this.state.selected) ?'active':'default');
  }
  
  
   render() {
	   var _this = this; 
      return (
      <div className="list-group">
        {
          this.state.documents.map(function(doc) {
            return <a className= {_this.isActive(doc.id)} key={doc.id} href={"#"}  onClick={_this.setActiveDocument.bind(null,doc.id)}>{doc.title}</a>
          })
        }
      </div>
    );
   }
   
   
}
