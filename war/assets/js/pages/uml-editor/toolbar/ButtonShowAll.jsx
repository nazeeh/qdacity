import React from 'react';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

export default class ButtonShowAll extends React.Component {
	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		this.umlEditor.getGraphView().panAndZoomToFitAllCells();
	}

	render() {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;
		const zoomAll = formatMessage({
			id: 'buttonshowall.title',
			defaultMessage: 'Zooms the graph until all classes fit into the screen.'
		});

		return (
			<BtnDefault title={zoomAll} onClick={_this.buttonClicked}>
				<i className="fa fa-arrows-alt" />
				<span>
					<FormattedMessage
						id="buttonshowall.show_all"
						defaultMessage="Show all"
					/>
				</span>
			</BtnDefault>
		);
	}
}
