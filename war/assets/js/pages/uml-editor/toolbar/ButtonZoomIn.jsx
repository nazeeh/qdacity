import React from 'react';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledZoomBtn = BtnDefault.extend `
    margin-left: 25px;
`;

export default class ButtonZoomIn extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.buttonClicked = this.buttonClicked.bind(this);
	}

	buttonClicked() {
		this.umlEditor.getGraphView().zoomIn();
	}

	render() {
		const _this = this;

		return (
			<StyledZoomBtn onClick={_this.buttonClicked}>
		        <i className="fa fa-search-plus"></i>
	        </StyledZoomBtn>
		);
	}

}