import React from 'react';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';

import UmlCodeMetaModelModal from '../../../common/modals/UmlCodeMetaModelModal';

export default class ButtonEditMetaModel extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditorView = this.props.umlEditorView;

		this.state = {
			selectedNodeId: null,
			enabled: false
		}
	}

	componentDidMount() {
		this.addSelectionEventListener();
	}

	addSelectionEventListener() {
		const _this = this;

		this.umlEditorView.addGraphSelectionModelEventListener(mxEvent.CHANGE, (sender, evt) => {
			const cells = sender.cells;

			if (cells.length == 1 && cells[0].vertex == true) {
				_this.setState({
					selectedNodeId: cells[0].mxObjectId,
					enabled: true
				});
			} else {
				_this.setState({
					selectedNodeId: null,
					enabled: false
				});
			}
		});
	}

	buttonClicked() {
		const _this = this;

		let umlClass = this.umlEditorView.umlClasses.find((uml) => uml.getNode() != null && uml.getNode().mxObjectId == _this.state.selectedNodeId);
		let code = umlClass.getCode();

		let codeMetaModelModal = new UmlCodeMetaModelModal(code);

		codeMetaModelModal.showModal().then(function (data) {
			console.log('Closed modal');

			if (code.mmElementIDs != data.ids) {
				console.log('New mmElementIds for code ' + code.name + ' (' + code.codeID + '): ' + data.ids + '. Old Ids: ' + code.mmElementIDs);

				let oldMetaModelElementIds = code.mmElementIDs;
				code.mmElementIDs = data.ids;

				console.log('Updating the mmElementIds for code ' + code.name + ' (' + code.codeID + ') in the database...');

				CodesEndpoint.updateCode(code).then(function (resp) {
					console.log('Updated the mmElementIds for code ' + code.name + ' (' + code.codeID + ') in the database.');
					_this.umlEditorView.exchangeCodeMetaModelEntities(resp.codeID, oldMetaModelElementIds);
					
					// TODO: Clear selection? only if the node gets removed
				});
			}
		});
	}

	getStyle() {
		return {
			marginLeft: '30px'
		};
	}

	render() {
		const _this = this;

		const style = this.getStyle();

		const disabled = this.state.enabled ? "" : "disabled";

		return (
			<button style={style} disabled={disabled} onClick={_this.buttonClicked.bind(_this)} type="button" className="btn btn-default">
                <i className="fa fa-list-alt"></i>
            </button>
		);
	}

}