import React from 'react';
import styled from 'styled-components';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const StyledZoomBtn = BtnDefault.extend`
	border-right: none;
`;

export default class ButtonZoomOut extends React.Component {
	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		this.umlEditor.getGraphView().zoomOut();
	}

	render() {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;

		const zoomAway = formatMessage({
			id: 'buttonzoomout.select_zoom',
			defaultMessage: 'Zoom away from the graph.'
		});

		return (
			<StyledZoomBtn title={zoomAway} onClick={_this.buttonClicked}>
				<i className="fa fa-search-minus" />
			</StyledZoomBtn>
		);
	}
}
