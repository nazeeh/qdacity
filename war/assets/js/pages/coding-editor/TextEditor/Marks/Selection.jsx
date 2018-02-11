import React from 'react';
import styled from 'styled-components';

const StyledSelection = styled.span`
	background: Highlight;
	color: ${props => props.showCaret ? 'HighlightText' : 'transparent' };
	text-shadow: ${props => props.showCaret ? 'initial' :  '0 0 0 HighlightText' };
`;

const Selection = props => (
	<StyledSelection showCaret={props.showCaret}>
		{props.children}
	</StyledSelection>
);

export default Selection;


