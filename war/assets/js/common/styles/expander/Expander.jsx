import React from 'react';
import styled from 'styled-components';

import { Collapsible, Mode } from './Collapsible.jsx';

const StyledHeader = styled.div`
	border: 1px solid;
	border-color: ${props => props.theme.borderDefault};

	padding: 0px 10px;

	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;

	&:hover {
		cursor: pointer;
	}
`;

const StyledIcon = styled.div`
	padding-left: 15px;
	padding-right: 5px;
`;

const StyledBorder = styled.div`
	border-left: ${props => (props.showBorder ? '1px solid' : 'none')};
	border-right: ${props => (props.showBorder ? '1px solid' : 'none')};
	border-bottom: ${props => (props.showBorder ? '1px solid' : 'none')};
	border-color: ${props => props.theme.borderDefault};
`;

/**
 * Available props:
 * - see Collapsible.jsx
 * - renderHeader: function which specifies the content of the header
 */
export default class Expander extends Collapsible {
	constructor(props) {
		super(props);

		this.clickHeader = this.clickHeader.bind(this);
	}

	clickHeader() {
		this.toggle();
	}

	render() {
		return (
			<div>
				{this.renderHeader()}

				<StyledBorder showBorder={this.state.mode != Mode.COLLAPSED}>
					{super.render()}
				</StyledBorder>
			</div>
		);
	}

	renderHeader() {
		return (
			<StyledHeader onClick={this.clickHeader}>
				{this.props.renderHeader ? (
					this.props.renderHeader()
				) : (
					<div>Default Header Text</div>
				)}

				{this.renderIcon()}
			</StyledHeader>
		);
	}

	renderIcon() {
		let iconClassName = 'fa fa-2x ';

		if (
			this.state.mode == Mode.COLLAPSED ||
			this.state.mode == Mode.COLLAPSING
		) {
			iconClassName += 'fa-angle-down';
		} else if (
			this.state.mode == Mode.EXPANDED ||
			this.state.mode == Mode.EXPANDING
		) {
			iconClassName += 'fa-angle-up';
		} else {
			throw new Error('Unknown state: ' + this.state.mode);
		}

		return (
			<StyledIcon>
				<i className={iconClassName} />
			</StyledIcon>
		);
	}
}
