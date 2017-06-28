import React from 'react';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';

import UmlCodeMetaModelModal from '../../../common/modals/UmlCodeMetaModelModal';

export default class UnmappedCodeElement extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditorView = this.props.umlEditorView;
		this.codeId = this.props.codeId;
	}

	buttonClicked() {
		const _this = this;
		let code = this.umlEditorView.getCode(this.codeId);
		let codeMetaModelModal = new UmlCodeMetaModelModal(code);

		codeMetaModelModal.showModal(this.umlEditorView.getMetaModelEntities(), this.umlEditorView.getMetaModelRelations()).then(function (data) {
			// TODO duplicate code in UmlEditorView.js
			console.log('Closed modal');

			if (code.mmElementIDs != data.ids) {
				console.log('New mmElementIds for code ' + code.name + ' (' + code.codeID + '): ' + data.ids + '. Old Ids: ' + code.mmElementIDs);

				let oldMetaModelElementIds = code.mmElementIDs;
				code.mmElementIDs = data.ids;

				console.log('Updating the mmElementIds for code ' + code.name + ' (' + code.codeID + ') in the database...');

				CodesEndpoint.updateCode(code).then(function (resp) {
					console.log('Updated the mmElementIds for code ' + code.name + ' (' + code.codeID + ') in the database.');
					_this.umlEditorView.exchangeCodeMetaModelEntities(resp.codeID, oldMetaModelElementIds);
				});
			}
		});
	}

	getStyle() {
		return {
			item: {
				display: 'block'
			},
			text: {
				float: 'left',
				height: '36px',
				lineHeight: '36px',
				display: 'inline-block',
				marginLeft: '10px'
			},
			button: {
				float: 'right',
				margin: '3px 10px 3px 0px'
			}
		};
	}

	render() {
		const _this = this;

		const style = this.getStyle();

		const buttonClass = 'btn btn-sm btn-default';
		const iconClass = 'fa fa-list-alt';

		const name = _this.umlEditorView.getCode(_this.codeId).name;

		return (
			<div style={style.item}>
                
		        <div style={style.text}>{name}</div>

		        <button style={style.button} type="button" className={buttonClass} onClick={_this.buttonClicked.bind(_this)}><i className={iconClass}></i></button>
            </div>
		);
	}
}