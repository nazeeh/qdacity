import ReactLoading from '../ReactLoading.jsx';

import VexModal from './VexModal';

import 'script!../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';

export default class IntercoderAgreementByDoc extends VexModal {
	
  constructor(resultID) {
	  super();
	  this.formElements = '<div id="intercoderAgreementByDoc" style="text-align: center; background-color: #eee; font-color:#222;"><div id="loadingAnimationDocAgreement" class="centerParent"><div id="reactLoadingDocAgreement" class="centerChild"></div></div><table cellpadding="0" cellspacing="0" border="0" class="display" id="agreementByDocTable"></table></div>';
	  
	  
	  this.resultID = resultID;
	  
	  this.results;

  }
  
  showModal(){
	  
	  var _this = this;
	  var promise = new Promise(
			  function(resolve, reject) {
				  
				  var formElements =  _this.formElements;

			 		vex.dialog.open({
			 			message : "Agreement By Document",
			 			contentCSS: { width: '900px' },
			 			input : formElements,
			 			buttons : [ 
			 			            $.extend({}, vex.dialog.buttons.YES, {text : 'OK'}),
//							        $.extend({}, vex.dialog.buttons.NO, { className: 'deciderBtn vex-dialog-button-primary', text: "Agreement Maps", click: function($vexContent, event) {
//							        	window.location.href = 'coding-editor.html?project='+_this.report.revisionID+'&type=REVISION&report='+_this.report.id+'&parentproject='+_this.report.projectID;
//							        }}), 
			 			          ],
			 			callback : function(data) {
			 				
			 				if (data != false) {
								resolve(data);
							}
							else reject(data);
			 			}
			 		});
			 		ReactDOM.render(<ReactLoading color={'#444'} />, document.getElementById('reactLoadingDocAgreement'));
			 		
			 		gapi.client.qdacity.validation.listDocumentResults({'validationRresultID' : _this.resultID}).execute(function(resp) {
						if (!resp.code) {
							$('#loadingAnimationDocAgreement').addClass('hidden');
							_this.results = resp.items || [];
							_this.setupDataTable();
						} else{
							// Log error
						}
					});
			 		
			  }
		  );
	  
	  return promise;
  }
  
  setupDataTable(){
	  var dataSet = [];
	  
	  // initialize if not initialized
	  if ( !$.fn.dataTable.isDataTable( '#agreementByDocTable' ) ) {
		var table1 = $('#agreementByDocTable').dataTable({
			"iDisplayLength" : 15,
			"bLengthChange" : false,
			"data" : dataSet,
			"autoWidth" : false,
			"columnDefs" : [ {
				"width" : "20%"
			}, {
				"width" : "25%"
			} , {
				"width" : "25%"
			}, {
				"width" : "25%"
			}],
			"columns" : [ {
				"title" : "Document",
				"width" : "20%",
			}, {
				"title" : "F-Measure (Paragraph)",
				"width" : "25%"
			},  {
				"title" : "Recall (Paragraph)",
				"width" : "25%"
			}, {
				"title" : "Precision (Paragraph)",
				"width" : "25%"
			}]

		});
	}
	  
	var table = $( '#agreementByDocTable' ).DataTable();
	
	table.clear();
	if (typeof this.resultID != 'undefined'){
		for (var i=0;i< this.results.length;i++) {
		      var result = this.results[i];
		      table.row.add([ result.documentName, result.paragraphAgreement.fmeasure, result.paragraphAgreement.recall, result.paragraphAgreement.precision]);
			}
	}
	
	
	table.draw();
	
	
  } 
  
}

 