import React from 'react';
import styled from 'styled-components';

const StyledFontFace = styled.span`
	font-family: ${props => props.fontFace};
`;

const FontFace = props => {

	const data = props.mark.data.toJS();

	return (
		<StyledFontFace
			data-mark-type={props.mark.type}
			fontFace={data.font}
		>
			{props.children}
		</StyledFontFace>
	);
};

export default FontFace;
