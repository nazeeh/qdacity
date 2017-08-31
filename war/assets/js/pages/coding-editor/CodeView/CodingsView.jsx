import React from 'react';

import 'script-loader!../../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';

export default class CodingsView extends React.Component {

	constructor(props) {
		super(props);
	}

	initTable() {
		var dataSet = [];
		var tableMount = $('#codingTableMount');
		var table = tableMount.dataTable({
			"iDisplayLength": 7,
			"bLengthChange": false,
			"data": dataSet,
			"autoWidth": false,
			"columnDefs": [{
				"width": "5%"
			}, {
				"width": "20%"
			}, {
				"width": "20%"
			}],
			"columns": [{
				"title": "ID",
				"width": "5%",
			}, {
				"title": "Document",
				"width": "20%"
			}, {
				"title": "Author",
				"width": "20%"
			}]

		});
		var _this = this;
		$('#codingTableMount tbody').on('click', 'tr', function () {
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
			} else {

				table.$('tr.selected').removeClass('selected');
				$(this).addClass('selected');
				var codingID = $(this).find("td").eq(0).html();

				_this.props.documentsView.setDocumentWithCoding(codingID);
				_this.props.editorCtrl.activateCodingInEditor(codingID, true);

			}
		});
	}


	fillCodingTable() {
		var _this = this;

		var table = $('#codingTableMount').DataTable();

		table.clear();

		var codings = [];
		if (!_this.props.documentsView.getDocuments) return;
		const docs = _this.props.documentsView.getDocuments()
		for (var i in docs) {
			var doc = docs[i];
			var elements = doc.text;
			var found = $('coding', elements);
			var foundArray = $('coding[code_id=\'' + _this.props.code.codeID + '\']', elements).map(function () {
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
				table.row.add([foundArray[j].id, doc.title, foundArray[j].author]);
				idsAdded.push(foundArray[j].id);
			}
		}

		table.draw();
	}

	componentDidMount() {
		this.initTable();
		this.fillCodingTable();
	}
	componentDidUpdate() {
		this.fillCodingTable();
	}

	render() {
		return (
			<div>
				<table id="codingTableMount" className="display">

				</table>
			</div>

		);
	}
}