import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div `
    margin-left: 20px;
    height: 40px;
`;

export default class Cell extends React.Component {

	constructor(props) {
		super(props);

	}

	render() {
		const _this = this;

		return (
			<StyledContainer>Test</StyledContainer>
		);
	}

}