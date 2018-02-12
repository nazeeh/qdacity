import React from 'react';
import styled from 'styled-components';

const StyledItalic = styled.span`
	font-style: italic;
`;

const Italic = props => (
	<StyledItalic data-mark-type={props.mark.type}>
		{props.children}
	</StyledItalic>
);

export default Italic;

