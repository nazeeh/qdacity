import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

export default class ButtonApplyLayout extends React.Component {
	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		this.umlEditor.getGraphView().applyLayout();
	}

	render() {
		const _this = this;

		return (
			<BtnDefault
				title="Click to apply a new layout to the graph. The layouting algorithm tries to reduce the amount of overlapping nodes and edges."
				onClick={_this.buttonClicked}
			>
				<i className="fa fa-th" />
				<span>
					<FormattedMessage
						id="buttonapplylayout.apply_layout"
						defaultMessage="Apply Layout"
					/>
				</span>
			</BtnDefault>
		);
	}
}
