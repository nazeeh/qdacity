import React from 'react';
import styled from 'styled-components';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledZoomBtn = BtnDefault.extend `
	border-left: none;
`;

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

		return (
			<StyledZoomBtn title="Zooms the graph until all classes fit into the screen." onClick={_this.buttonClicked}>
                <i className="fa fa-arrows-alt"></i>
                <span>Show all</span>
	        </StyledZoomBtn>
		);
	}

}
