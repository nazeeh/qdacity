import VexModal from './VexModal';
import MetaModelView from '../../pages/coding-editor/MetaModelView.jsx';


export default class NewCodeRelation extends VexModal {

  constructor(metaModel, codeSystem) {
	  super();
	  this.formElements = '<div id="newCodeRelation" class="row" style="text-align: center; background-color: #eee; font-color:#222;"><div class="col-sm-6">Relationship Type<br/><div id=mmRelationships/></div><div class="col-sm-6">Code<br/><div id="easytreeNewCode"><ul></ul></div><div id="easytreeNewCode2"><ul></ul></div></div></div>';
	  
	  
	  
	  this.mmRelationshipsView = {};
	  
	  this.codeSystem = codeSystem;
	  
	  this.easytree = {};
	  
  }
  
  showModal(){
	  
	  var _this = this;
	  var promise = new Promise(
			  function(resolve, reject) {
				  
				  var formElements =  _this.formElements;

			 		vex.dialog.open({
			 			message : "New Code Relationship",
			 			contentCSS: { width: '900px' },
			 			input : formElements,
			 			buttons : [ 
			 			            $.extend({}, vex.dialog.buttons.YES, {text : 'Create'}),
							        $.extend({}, vex.dialog.buttons.NO, {text : 'Cancel'}), 
			 			          ],
			 			callback : function(data) {
			 				
			 				var relationship = {};
			 				relationship.mmElementId =_this.mmRelationshipsView.getActiveElementId();
			 				relationship.codeId =  _this.getSelectedId();
			 				if (data != false) {
								resolve(relationship);
							}
							else reject(relationship);
			 			}
			 		});
			 		
			 		_this.mmRelationshipsView = ReactDOM.render(<MetaModelView filter={"RELATIONSHIP"}/>, document.getElementById('mmRelationships'));
			 		
			 		_this.easytree = $('#easytreeNewCode').easytree({
			 			enableDnd : false,
			 			ordering : 'orderedFolder',
			 			minOpenLevels: 1
			 		});
			 		var originalNodes = _this.codeSystem.getAllNodes();
			
			 		
			 		var deepCopy = [];
			 		_this.codeSystem.getAllNodes().forEach(function(node){
			 			var node = jQuery.extend(true,  {}, node);
			 			_this.modifyNodeId(node);
			 			deepCopy.push(node);
			 			
			 		});
			 		
			 		_this.easytree.rebuildTree(deepCopy);
			 	
			         
			  }
		  );
	  
	  return promise;
  }
  
  modifyNodeId(node){
	  var _this = this;
	  node.id += "newCode";
	  if (typeof node.children != 'undefined'){
		  node.children.forEach(function(childNode){
			  _this.modifyNodeId(childNode);
		  });
	  }
  }
  
  getSelectedId(){
	  var modifiedNodeId = this.getActiveNodeRecursive(this.easytree.getAllNodes()).id;
	  
	  return modifiedNodeId.split("newCode")[0]; 
  }
  
  
  getActiveNodeRecursive(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].isActive == true) {
				return nodes[i];
			}
			if (nodes[i].children && nodes[i].children.length > 0) {
				var result = this.getActiveNodeRecursive(nodes[i].children);
				if (typeof result != 'undefined')
					return result;
			}
		}
	}
  
}

 