import React from 'react';

import TextField from '../../common/modals/TextField';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';

export default class Description extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			description: "",
			isProjectOwner : false
		};
		
		this.showDescriptionModal = this.showDescriptionModal.bind(this);
	}
	
	setDescription(desc){
		this.setState({
			description: desc
		});
	}
	
	setIsProjectOwner(pIsProjectOnwer){
		this.setState({
			isProjectOwner: pIsProjectOnwer
		});
	}
	
	showDescriptionModal() {
		var _this = this;
		var modal = new TextField('Change the project description', 'Description');
		modal.showModal().then(function (text) {
			ProjectEndpoint.setDescription(_this.props.projectId, _this.props.projectType, text).then(function (resp) {
				_this.setState({
					description: text
				})
			});
		});
	}
	
	renderEditBtn(){
		if (!this.state.isProjectOwner) return "";
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
				<h3 className="box-title">Project Stats</h3>
				{this.renderEditBtn()}
				</div>
				<div className="box-body">
					{this.state.description}
				</div>
			</div>
		);
	}


}