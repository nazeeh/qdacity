import React from 'react';

import TextField from '../../common/modals/TextField';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';

export default class Description extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			description: this.props.project.description
		};

		this.showDescriptionModal = this.showDescriptionModal.bind(this);
	}

	showDescriptionModal() {
		var _this = this;
		var modal = new TextField('Change the project description', 'Description');
		modal.showModal().then(function (text) {
			ProjectEndpoint.setDescription(_this.props.project.getId(), _this.props.project.getType(), text).then(function (resp) {
				_this.props.project.setDescription(text);
				_this.forceUpdate();
			});
		});
	}

	renderEditBtn() {
		if (!this.props.isProjectOwner) return "";
		else return <div className="box-tools pull-right">
				<button
					type="button"
					className="btn btn-box-tool"
					onClick={this.showDescriptionModal}
				>
		        	<i className="fa fa-pencil fa-lg  hoverHand"></i>
		        </button>
			</div>
	}

	render() {
		var _this = this;

		return (
			<div className="box box-default">
				<div className="box-header with-border">
				<h3 className="box-title">Project Description</h3>
				{this.renderEditBtn()}
				</div>
				<div className="box-body">
					{this.props.project.getDescription()}
				</div>
			</div>
		);
	}


}
