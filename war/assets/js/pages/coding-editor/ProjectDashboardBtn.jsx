import React from 'react'
import styled from 'styled-components';

const StyledPrjDasboardBtn = styled.a `
	text-align: center;
`;

export default class ProjectDashboardBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	projectDashboardBtnClick(prj) {
		this.props.history.push('/ProjectDashboard?project=' + prj.id + '&type=' + prj.type);
	}

	render() {
		return (
			<div className="list-group">
				<StyledPrjDasboardBtn className="list-group-item clickable" onClick={() => {this.projectDashboardBtnClick(this.props.project);}}>
					<i className="fa fa-home fa-fw "></i>
					Project Dashboard
				</StyledPrjDasboardBtn>
			</div>
		);
	}
}