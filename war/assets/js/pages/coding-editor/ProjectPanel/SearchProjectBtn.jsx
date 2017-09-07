import React from 'react'
import styled from 'styled-components';
import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';
const StyledPrjSearchBtn = BtnDefault.extend `
	text-align: center;
	width: 100%;
	margin-bottom:5px;

	&> span {
		margin-left: 5px;
	}
`;

export default class SearchProjectBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<StyledPrjSearchBtn  onClick={this.props.toggleSearchBar}>
				<i className="fa fa-search fa-lg"></i>
				<span>Search Project</span>
			</StyledPrjSearchBtn>
		);
	}
}