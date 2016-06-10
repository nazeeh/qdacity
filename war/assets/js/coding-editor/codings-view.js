var dataSet = [];

$(document)
		.ready(
				function() {
					$('#codingtable')
							.html(
									'<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>');

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

					$('#example tbody').on('click', 'tr', function() {
						if ($(this).hasClass('selected')) {
							$(this).removeClass('selected');
						} else {

							table.$('tr.selected').removeClass('selected');
							$(this).addClass('selected');
							var codingID = $(this).find("td").eq(0).html();

							activateCodingInEditor(codingID);

						}
					});

					$('#filer_input').filer({
						limit : 3,
						maxSize : 3,
						extensions : [ 'rtf', 'rtf' ],
						changeInput : true,
						showThumbs : true
					});

				});

function activateCodingInEditor(codingID) {

	for ( var id in text_documents) {
		var elements = text_documents[id].text;
		var foundArray = $('coding[id=\'' + codingID + '\']', elements).map(
				function() {
					return $(this);

				});
		foundArray = foundArray.toArray();

		if (foundArray.length > 0) {
			var range;
			range = document.createRange();
			$('#documentlist .ui-selected').removeClass("ui-selected");
			$("#documentlist").find("li[docID='" + id + "']").addClass(
					"ui-selected");
			setDocumentView(id);
			var codingNodes = $("#editor").contents().find(
					'coding[id=\'' + codingID + '\']');
			var startNode = codingNodes[0];
			var endNode = codingNodes[codingNodes.length - 1];

			raWnge = iframe.contentDocument.createRange();
			range.setStart(startNode, 0);
			range.setEnd(endNode, endNode.childNodes.length);
			editor.setSelection(range);
			
			//Scroll to selection
			var offset = startNode.offsetTop;
			$("#editor").contents().scrollTop(offset);

		}
	}
}
