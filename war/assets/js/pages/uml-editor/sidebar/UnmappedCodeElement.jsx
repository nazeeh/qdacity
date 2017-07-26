import React from 'react';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';

import UmlCodeMetaModelModal from '../../../common/modals/UmlCodeMetaModelModal';

export default class UnmappedCodeElement extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;
		this.codeId = this.props.codeId;
	}

	buttonClicked() {
		const _this = this;
		let code = this.umlEditor.getUmlGraphView().getCode(this.codeId);
		let codeMetaModelModal = new UmlCodeMetaModelModal(code);

		codeMetaModelModal.showModal(this.umlEditor.getUmlGraphView().getMetaModelEntities(), this.umlEditor.getUmlGraphView().getMetaModelRelations()).then(function (data) {
			// TODO duplicate code in UmlGraphView.jsx
			console.log('Closed modal');

			if (code.mmElementIDs != data.ids) {
				console.log('New mmElementIds for code ' + code.name + ' (' + code.codeID + '): ' + data.ids + '. Old Ids: ' + data.oldIds);

				code.mmElementIDs = data.ids;

				console.log('Updating the mmElementIds for code ' + code.name + ' (' + code.codeID + ') in the database...');

				CodesEndpoint.updateCode(code).then(function (resp) {
					console.log('Updated the mmElementIds for code ' + code.name + ' (' + code.codeID + ') in the database.');
					_this.umlEditor.getUmlGraphView().exchangeCodeMetaModelEntities(resp.codeID, data.oldIds);
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

		const name = _this.umlEditor.getUmlGraphView().getCode(_this.codeId).name;

		return (
			<div style={style.item}>
                
		        <div style={style.text}>{name}</div>

		        <button style={style.button} type="button" className={buttonClass} onClick={_this.buttonClicked.bind(_this)}><i className={iconClass}></i></button>
            </div>
		);
	}
}