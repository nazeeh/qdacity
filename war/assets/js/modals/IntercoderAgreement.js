import VexModal from './VexModal';
import ProjectEndpoint from '../ProjectEndpoint';
import 'script!../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';

export default class IntercoderAgreement extends VexModal {
	
  constructor(report) {
	  super();
	  this.formElements = '<div id="intercoderAgreement" style="text-align: center; background-color: #eee;"><table cellpadding="0" cellspacing="0" border="0" class="display" id="agreementTable"></table></div>';
	  this.report = report;
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
			 			            $.extend({}, vex.dialog.buttons.YES, {text : 'OK'})
			 			          ],
			 			callback : function(data) {
			 				
			 				if (data != false) {
								resolve(data);
							}
							else reject(data);
			 			}
			 		});
			 		
			 		_this.setupDataTable();
			  }
		  );
	  
	  return promise;
  }
  
  setupDataTable(){
	  var dataSet = [];
	  
	  // initialize if not initialized
	  if ( !$.fn.dataTable.isDataTable( '#agreementTable' ) ) {
		var table1 = $('#agreementTable').dataTable({
			"iDisplayLength" : 15,
			"bLengthChange" : false,
			"data" : dataSet,
			"autoWidth" : false,
			"columnDefs" : [ {
				"width" : "33%"
			}, {
				"width" : "33%"
			} ],
			"columns" : [ {
				"title" : "Coder",
				"width" : "33%",
			}, {
				"title" : "Agreement (Paragraph)",
				"width" : "33%"
			} ]

		});
	}
	  
	var table = $( '#agreementTable' ).DataTable();
	
	table.clear();
	if (typeof this.report != 'undefined'){
		var results = this.report.validationResult;
		for (var i=0;i< results.length;i++) {
		      var result = results[i];
		      table.row.add([ result.name, result.paragraphFMeasure]);
			}
	}
	
	
	table.draw();
	
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

 