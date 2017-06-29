import React from 'react'
import styled from 'styled-components';

const StyledTab = styled.div `
    padding: 5px 10px 5px 10px;
	font-size: 15px;
	font-weight: bold;
	cursor: pointer;
	color: ${props => props.isActive ?'#fff' : '#000'};
	background-color: ${props => props.isActive ?'#337ab7' : ''};
	border-bottom-style: solid;
	border-bottom-color:  #337ab7;
`;

export default class Tab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<StyledTab isActive={this.props.isActive} onClick={() => this.props.changeTab(this.props.tabIndex)}>
				{this.props.tabTitle}
			</StyledTab>
		);
	}
}