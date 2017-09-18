import React from 'react'
import styled from 'styled-components';
import {
	BtnDefault
} from '../../common/styles/Btn.jsx';

const StyledPrjDasboardBtn = BtnDefault.extend `
	text-align: center;
	width: 100%;
	margin-bottom:5px;
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
			<StyledPrjDasboardBtn  onClick={() => {this.projectDashboardBtnClick(this.props.project);}}>
				<i className="fa fa-home fa-lg"></i>
				<span>Project Dashboard</span>
			</StyledPrjDasboardBtn>
		);
	}
}