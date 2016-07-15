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

							window.activateCodingInEditor(codingID, true);

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

