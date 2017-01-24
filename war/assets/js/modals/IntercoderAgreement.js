import ReactLoading from '../common/ReactLoading.jsx';

import VexModal from './VexModal';
import IntercoderAgreementByDoc from './IntercoderAgreementByDoc';
import BinaryDecider from './BinaryDecider';
import ProjectEndpoint from '../common/endpoints/ProjectEndpoint';
import ValidationEndpoint from '../common/endpoints/ValidationEndpoint';
import 'script!../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';

export default class IntercoderAgreement extends VexModal {
	
  constructor(report) {
	  super();
	  this.formElements = '<div id="intercoderAgreement" style="text-align: center; background-color: #eee;">Average: F-Measure:'+report.paragraphAgreement.fmeasure+' Recall:'+report.paragraphAgreement.recall+' Precision:'+report.paragraphAgreement.precision+'</div>';
	  this.formElements += '<div id="intercoderAgreement" style="text-align: center; background-color: #eee; font-color:#222;"><div id="loadingAnimation" class="centerParent"><div id="reactLoading" class="centerChild"></div></div><table cellpadding="0" cellspacing="0" border="0" class="display" id="agreementTable"></table></div>';
	  
	  
	  this.report = report;
	  this.results;
  }
  
  showModal(){
	  
	  var _this = this;
	  var promise = new Promise(
			  function(resolve, reject) {
				  
				  var formElements =  _this.formElements;

			 		vex.dialog.open({
			 			message : "Intercoder Agreement",
			 			contentCSS: { width: '900px' },
			 			input : formElements,
			 			buttons : [ 
			 			            $.extend({}, vex.dialog.buttons.YES, {text : 'OK'}),
			 			            $.extend({}, vex.dialog.buttons.NO, { className: 'deciderBtn vex-dialog-button-primary', text: "Send Email", click: function($vexContent, event) {
			 			            	var decider = new BinaryDecider('Confirm sending out emails to all validation coders',  'Cancel', 'Yes, send email' );
			 			            	decider.showModal().then(function(value){
			 			     			  if (value == 'optionB'){
			 			     				var validationEndpoint = new ValidationEndpoint();
				 			            	validationEndpoint.sendNotificationEmail(_this.report.id);
			 			     			  }
			 			     		  });
			 			            	
							        }}),
							        $.extend({}, vex.dialog.buttons.NO, { className: 'deciderBtn vex-dialog-button-primary', text: "Agreement Maps", click: function($vexContent, event) {
							        	window.location.href = 'coding-editor.html?project='+_this.report.revisionID+'&type=REVISION&report='+_this.report.id+'&parentproject='+_this.report.projectID;
							        }}),
			 			          ],
			 			callback : function(data) {
			 				
			 				if (data != false) {
								resolve(data);
							}
							else reject(data);
			 			}
			 		});
			 		ReactDOM.render(<ReactLoading color={'#444'} />, document.getElementById('reactLoading'));
			 		
			 		gapi.client.qdacity.validation.listValidationResults({'reportID' : _this.report.id}).execute(function(resp) {
						if (!resp.code) {
							$('#loadingAnimation').addClass('hidden');
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
	  var _this = this;
	  // initialize if not initialized
	  if ( !$.fn.dataTable.isDataTable( '#agreementTable' ) ) {
		var table1 = $('#agreementTable').dataTable({
			"iDisplayLength" : 15,
			"bLengthChange" : false,
			"data" : dataSet,
			"autoWidth" : false,
			"columns" : [ 
			{
				className: "hidden" ,
				"searchable": true
			},
			{
				className: "hidden" ,
				"searchable": true
			},
			{
				"title" : "Coder",
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
	  
  $('#agreementTable tbody').on('click', 'tr', function() {
		if ($(this).hasClass('selected')) {
			$(this).removeClass('selected');
		} else {

			table.$('tr.selected').removeClass('selected');
			$( this).addClass('selected');
			
			var resultID = $(this).find("td").eq(0).html();
			var validationProjectID = $(this).find("td").eq(1).html();
			var agreementByDoc = new IntercoderAgreementByDoc(resultID, validationProjectID, _this.report.projectID);
			agreementByDoc.showModal();
		}
	});
	  
	var table = $( '#agreementTable' ).DataTable();
	
	table.clear();
	if (typeof this.report != 'undefined'){
		for (var i=0;i< this.results.length;i++) {
		      var result = this.results[i];
		      table.row.add([result.id, result.validationProjectID, result.name, result.paragraphAgreement.fmeasure, result.paragraphAgreement.recall, result.paragraphAgreement.precision]);
			}
	}
	
	
	table.draw();
	
	$('#agreementTable tbody > tr').addClass("clickable");
	
	$('#agreementTable tbody').on('click', 'tr', function() {
		if ($(this).hasClass('selected')) {
			$(this).removeClass('selected');
		} else {
			table.$('tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});
  }
  
  calculateAgreement(){
  	var projectEndpoint = new ProjectEndpoint();
  	var _this = this;
  	projectEndpoint.evaluateRevision(this.revId)
  		.then(
  	        function(val) {
  	        	_this.valPrjList = val.items;
  	        	_this.setupDataTable(); // FIXME fix reinitialization of datatable
  	        	alertify.success("Agreement: " + val.items[0].paragraphFMeasure	);
  	        })
  	    .catch(handleBadResponse);
  }
  
  
  
}

 