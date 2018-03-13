import React from 'react';
import styled from 'styled-components';

import { PageView } from '../View/PageView.js';

const StyledContainer = styled.div`
	border-left: 1px solid #888;
	height: 100%;
`;

export default class CodeQueries extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			selectedCode: null
		}
	}

	codesystemSelectionChanged(code) {
		this.setState({
			selectedCode: code
		});
	}

	render() {
		// Render only if the page is code_queries
		if (this.props.selectedEditor != PageView.CODE_QUERIES) {
			return null;
		}

		// Dont render if the code is empty
		if (this.state.selectedCode == null) {
			return null;
		}

		return (
			<StyledContainer>
				<div>Hello {this.state.selectedCode.name}</div>
			</StyledContainer>
		);
	}
}
