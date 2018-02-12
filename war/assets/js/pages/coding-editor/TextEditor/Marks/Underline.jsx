import React from 'react';
import styled from 'styled-components';

const StyledUnderline = styled.span`
	text-decoration: underline;
`;

const Underline = props => (
	<StyledUnderline data-mark-type={props.mark.type}>
		{props.children}
	</StyledUnderline>
);

export default Underline;

