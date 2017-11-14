import React from 'react';
import styled from 'styled-components';

import Project from '../Project';


const StyledParentLink = styled.a `
    cursor: pointer;
`;



export default class ParentProject extends React.Component {
	constructor(props) {
		super(props);
		this.redirectToParentProject = this.redirectToParentProject.bind(this);
	}

	redirectToParentProject() {
		var prjId = this.props.project.getParentID();
		this.props.history.push('/ProjectDashboard?project='+prjId+'&type=PROJECT');
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
					This is an validation project belonging to <StyledParentLink onClick={this.redirectToParentProject}>this parent project</StyledParentLink>
				</div>
			</div>
		);
	}

}