import React from 'react';
import styled from 'styled-components';

const StyledLink = styled.a `
    text-align: center;
`;

export default class ProjectDashboardButton extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const _this = this;

		const href = 'project-dashboard.html?project=' + this.props.projectId + '&type=' + this.props.projectType;

		return (
			<div className="list-group">
                <StyledLink href={href} className="list-group-item clickable">
                    <i className="fa fa-home fa-fw "></i>
                    Project Dashboard
                </StyledLink>
            </div>
		);
	}
}