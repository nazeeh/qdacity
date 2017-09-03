import React from 'react';

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
		// TODO
	}

	render() {
		const _this = this;

		return (
			<BtnDefault onClick={_this.buttonClicked}>
		        <i className="fa fa-plus"></i>
	        </BtnDefault>
		);
	}

}