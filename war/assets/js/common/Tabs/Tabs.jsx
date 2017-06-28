import React from 'react'
import styled from 'styled-components';

const StyledTabHeader = styled.div `
	display: -webkit-flex;
	display: flex;
	-webkit-flex-direction: row;
	flex-direction: row;
`;

export default class Tabs extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeIndex: 0
		};
	}

	renderTabsHeader(){
		return React.Children.map(this.props.children, (child, index) => {
			return React.cloneElement(child, {
				onClick : this.handleTabClick,
				tabIndex: index,
				isActive: index === this.state.activeIndex
			});
		});
	}

	renderActiveTab(){
		return this.props.children.map((child, index) => {
			if (index == this.state.activeIndex) return child.props.children;
			return null;
		});
	}

	render(){
		return(
			<div>
				<StyledTabHeader>
					{this.renderTabsHeader()}
				</StyledTabHeader>
				{this.renderActiveTab()}
			</div>
		);
	}
}