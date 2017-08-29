import React from 'react';

import Project from '../Project';

export default class ParentProject extends React.Component {
	constructor(props) {
		super(props);
		this.redirectToParentProject = this.redirectToParentProject.bind(this);
	}

	redirectToParentProject() {
		this.props.history.push('/ProjectDashboard?project=' + this.props.project.getParentID() + '&type=PROJECT');
		location.reload();

	}

	render() {
		if (this.props.project.getType() == 'PROJECT') return null;
		return (
			<div className=" box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">Parent Project</h3>
				</div>
				<div className="box-body">
					This is an validation project belonging to <a onClick={this.redirectToParentProject}>this parent project</a>
				</div>
			</div>
		);
	}

}