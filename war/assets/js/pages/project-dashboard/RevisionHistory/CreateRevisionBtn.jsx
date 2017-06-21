import React from 'react';
import styled from 'styled-components';

import TextField from '../../../common/modals/TextField';

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
				<button 
					type="button" 
					className="btn btn-default btn-sm pull-right"
					onClick={() => this.showNewRevisionModal()}
				>
					<i className="fa fa-plus-circle fa-lg"></i>&nbsp;&nbsp;<b>Create Revision</b>
				</button>
			);
		} else {
			return null;
		}
	}
}