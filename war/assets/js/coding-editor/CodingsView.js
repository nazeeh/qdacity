import 'script!../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';
import 'script!../../../components/Easytabs/jquery.easytabs.js';

export default class CodingsView {
	
	constructor(editorCtrl, documentsCtrl) {
		this.editorCtrl = editorCtrl;
		this.documentsCtrl = documentsCtrl;
		
		$("#codeTabs").easytabs({
			animate : true,
			animationSpeed : 100,
			panelActiveClass : "active-content-div",
			defaultTab : "span#defaultCodeTab",
			tabs : "> div > span",
			updateHash : false
		});
		
		var dataSet = [];
		var table = $('#example').dataTable({
			"iDisplayLength" : 7,
			"bLengthChange" : false,
			"data" : dataSet,
			"autoWidth" : false,
			"columnDefs" : [ {
				"width" : "5%"
			}, {
				"width" : "20%"
			}, {
				"width" : "20%"
			} ],
			"columns" : [ {
				"title" : "ID",
				"width" : "5%",
			}, {
				"title" : "Document",
				"width" : "20%"
			}, {
				"title" : "Author",
				"width" : "20%"
			} ]

		});
		var _this = this;
		$('#example tbody').on('click', 'tr', function() {
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
			} else {

				table.$('tr.selected').removeClass('selected');
				$(this).addClass('selected');
				var codingID = $(this).find("td").eq(0).html();

				_this.documentsCtrl.setDocumentWithCoding(codingID, true);
				_this.editorCtrl.activateCodingInEditor(codingID, true);

			}
		});
	  }

	fillCodingTable(codeID, documents) {
		var table = $( '#example' ).DataTable();

		table.clear();

		var codings = [];
		
		for ( var i in documents) {
			var doc = documents[i];
			var elements = doc.text;
			var found = $('coding', elements);
			var foundArray = $('coding[code_id=\'' + codeID + '\']', elements).map(function() {
				var tmp = {};
				tmp.id = $(this).attr('id');
				tmp.code_id = $(this).attr('code_id');
				tmp.author = $(this).attr('author');
				return tmp;

			});
			foundArray = foundArray.toArray();
			var idsAdded = []; // When a coding spans multiple HTML blocks, then
			// there will be multiple elements with the same ID
			for (var j = 0; j < foundArray.length; j++) {
				if ($.inArray(foundArray[j].id, idsAdded) != -1)
					continue;
				table.row.add([ foundArray[j].id, doc.title, foundArray[j].author ]);
				idsAdded.push(foundArray[j].id);
			}
		}
		
		table.draw();
	}
}