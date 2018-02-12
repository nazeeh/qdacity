import React from 'react';
import styled from 'styled-components';

const StyledSelection = styled.span`
	background: Highlight;

	/**
	 * In coding (readonly) mode the text color is set to transparent and
	 * instead only the text-shadow is visible. So we have to color that.
	 * In text-editing mode the text color is colored and the text-shadow
	 * stays disabled
	 */
	color: ${props => props.showCaret ? 'HighlightText' : 'transparent' };
	text-shadow: ${props => props.showCaret ? 'initial' :  '0 0 0 HighlightText' };
`;

const Selection = props => (
	<StyledSelection showCaret={props.showCaret}>
		{props.children}
	</StyledSelection>
);

export default Selection;


