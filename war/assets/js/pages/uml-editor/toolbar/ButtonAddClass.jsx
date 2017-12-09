import React from 'react';

import Prompt from '../../../common/modals/Prompt';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

export default class ButtonAddClass extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		const _this = this;

		let prompt = new Prompt('Give your code a name', 'Code Name');

		prompt.showModal().then(function (codeName) {
			let mmElementIDs = [];
			mmElementIDs.push(_this.umlEditor.getMetaModelEntityByName(_this.umlEditor.getMetaModelMapper().getDefaultUmlClassMetaModelName()).id);

			_this.props.createCode(codeName, mmElementIDs);
		});
	}

	render() {
		const _this = this;

		return (
			<BtnDefault title="Click to create a new class (code)." onClick={_this.buttonClicked}>
		        <i className="fa fa-plus"></i>
	        </BtnDefault>
		);
	}

}