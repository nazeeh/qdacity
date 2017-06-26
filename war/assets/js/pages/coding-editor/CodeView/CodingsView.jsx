import 'script!../../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';
import 'script!../../../../../components/Easytabs/jquery.easytabs.js';

export default class CodingsView  extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			codeID: -1,
			documents: []
		};


	}

	setCodeID(codeID){
		this.setState({
			codeID: codeID
		});
	}

	setDocuments(documents){
		this.setState({
			documents: documents
		});
	}

	updateTable(codeID, documents){
		this.setState({
			codeID: codeID,
			documents: documents
		});
	};

	initTable(){
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

		for (var i in _this.state.documents) {
			var doc = _this.state.documents[i];
			var elements = doc.text;
			var found = $('coding', elements);
			var foundArray = $('coding[code_id=\'' + _this.state.codeID + '\']', elements).map(function () {
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
	}
	componentDidUpdate() {
		this.fillCodingTable();
	}

	render(){
		return (
			<div>
				<table id="codingTableMount" className="display">

				</table>
			</div>

		);
	}
}