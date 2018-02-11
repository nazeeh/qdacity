import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import Project from '../Project';

const StyledParentLink = styled.a`
	cursor: pointer;
`;

export default class ParentProject extends React.Component {
	constructor(props) {
		super(props);
		this.redirectToParentProject = this.redirectToParentProject.bind(this);
	}

	redirectToParentProject() {
		var prjId = this.props.project.getParentID();
		this.props.history.push(
			'/ProjectDashboard?project=' + prjId + '&type=PROJECT'
		);
		location.reload();
	}

	render() {
		const parentProject = (
			<StyledParentLink onClick={this.redirectToParentProject}>
				<FormattedMessage
					id="parentproject.parent_project"
					defaultMessage="Parent Project"
				/>
			</StyledParentLink>
		);
		if (this.props.project.getType() == 'PROJECT') return null;
		return (
			<div className=" box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">
						<FormattedMessage
							id="parentproject.parent_project"
							defaultMessage="Parent Project"
						/>
					</h3>
				</div>
				<div className="box-body">
					<FormattedMessage
						id="parentproject.validation_project_belonging_to"
						defaultMessage="This is a validation project belonging to this {parent_project}"
						values={{
							parent_project: parentProject
						}}
					/>
				</div>
			</div>
		);
	}
}
