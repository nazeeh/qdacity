import React from 'react';
import styled from 'styled-components';

const StyledFontSize = styled.span`
	font-size: ${props => props.fontSize};
`;

const FontSize = props => {

	const data = props.mark.data.toJS();

	return (
		<StyledFontSize
			data-mark-type={props.mark.type}
			fontSize={data.size}
		>
			{props.children}
		</StyledFontSize>
	);
};

export default FontSize;
