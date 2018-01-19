import React from 'react';
import styled from 'styled-components';

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

		return (
			<StyledZoomBtn
				title="Zoom away from the graph."
				onClick={_this.buttonClicked}
			>
				<i className="fa fa-search-minus" />
			</StyledZoomBtn>
		);
	}
}
