import React from 'react';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

export default class ButtonCollapseAll extends React.Component {
	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		this.umlEditor.getGraphView().collapseAll();
	}

	render() {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;
		const collapseAll = formatMessage({
			id: 'buttoncollapseall.title',
			defaultMessage: 'Collapses all classes.'
		});

		return (
			<BtnDefault title={collapseAll} onClick={_this.buttonClicked}>
				<i className="fa fa-minus-square-o" />
				<span>
					<FormattedMessage
						id="buttoncollapseall.collapse_all"
						defaultMessage="Collapse all"
					/>
				</span>
			</BtnDefault>
		);
	}
}
