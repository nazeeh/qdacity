import React from 'react';
import styled from 'styled-components';

import TextField from '../../../common/modals/TextField';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledCreateRevisionBtn = BtnDefault.extend `
	margin-left: 5px;
	& > i {
    	padding-right: 5px;
  }
`;

export default class CreateRevisionBtn extends React.Component {
	constructor(props) {
		super(props);
	}

	showNewRevisionModal() {
		var _this = this;
		var modal = new TextField('Revision Comment', 'Use this field to describe this revision in a few sentences');
		modal.showModal().then(function (text) {
			_this.props.createNewRevision(_this.props.project.getId(), text);
		});
	}

	render() {
		if (this.props.isProjectOwner) {
			return (
				<StyledCreateRevisionBtn
					type="button"
					className="pull-right"
					onClick={() => this.showNewRevisionModal()}
				>
					<i className="fa fa-plus-circle fa-lg"></i><b>Create Revision</b>
				</StyledCreateRevisionBtn>
			);
		} else {
			return null;
		}
	}
}