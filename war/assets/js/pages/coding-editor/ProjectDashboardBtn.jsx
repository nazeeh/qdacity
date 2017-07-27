import React from 'react'
import styled from 'styled-components';

const StyledPrjDasboardBtn = styled.a `
	text-align: center;
`;

export default class ProjectDashboardBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<div className="list-group">
				<StyledPrjDasboardBtn className="list-group-item clickable" href={"ProjectDashboard?project="+ this.props.project.getId() +"&type="+ this.props.project.getType()}>
					<i className="fa fa-home fa-fw "></i>
					Project Dashboard
				</StyledPrjDasboardBtn>
			</div>
		);
	}
}