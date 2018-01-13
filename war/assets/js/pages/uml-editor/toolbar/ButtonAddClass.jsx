import React from 'react';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

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
		const {
			formatMessage
		} = IntlProvider.intl;
		const _this = this;

		let prompt = new Prompt(
			formatMessage({
				id: 'buttonaddclass.code_name_prompt',
				defaultMessage: 'Give your code a name'
			}),
			formatMessage({
				id: 'buttonaddclass.code_name_prompt.sample',
				defaultMessage: 'Code Name'
			})
		);

		prompt.showModal().then(function (codeName) {
			let mmElementIDs = [];
			mmElementIDs.push(_this.umlEditor.getMetaModelEntityByName(_this.umlEditor.getMetaModelMapper().getDefaultUmlClassMetaModelName()).id);

			_this.props.createCode(codeName, mmElementIDs);
		});
	}

	render() {
		const _this = this;
		const {formatMessage} = IntlProvider.intl;
		const addClass = formatMessage({id: 'buttonaddclass.title', defaultMessage: 'Click to create a new class (code).'});

		return (
			<BtnDefault title={addClass} onClick={_this.buttonClicked}>
				<i className="fa fa-plus"></i>
			</BtnDefault>
		);
	}

}