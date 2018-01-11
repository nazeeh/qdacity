import React from 'react';
import {
	FormattedMessage
} from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

export default class ButtonExpandAll extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		this.umlEditor.getGraphView().expandAll();
	}

	render() {
		const _this = this;
		const {formatMessage} = IntlProvider.intl;
		const expandAll = formatMessage({id: 'buttonexpandall.title', defaultMessage: 'Expands all classes.'});

		return (
			<BtnDefault title={expandAll} onClick={_this.buttonClicked}>
				<i className="fa fa-plus-square-o"></i>
				<span><FormattedMessage id='buttonexpandall.expand_all' defaultMessage='Expand all' /></span>
			</BtnDefault>
		);
	}

}