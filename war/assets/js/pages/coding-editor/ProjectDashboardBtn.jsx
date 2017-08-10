import React from 'react'
import styled from 'styled-components';

const StyledPrjDasboardBtn = styled.a `
	text-align: center;

	padding: 3px 3px !important;
`;

const StyledDocumentList = styled.div `
	margin:2px 0px 2px 0px;
`;

const StyledDocumentItem = styled.a `

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
			<StyledPrjDasboardBtn className="list-group-item clickable" onClick={() => {this.projectDashboardBtnClick(this.props.project);}}>
				<i className="fa fa-home fa-fw "></i>
				Project Dashboard
			</StyledPrjDasboardBtn>
		);
	}
}