import React from 'react';
import styled from 'styled-components';

const StyledBold = styled.span`
	font-weight: bold;
`;

const Bold = props => (
	<StyledBold data-mark-type={props.mark.type}>{props.children}</StyledBold>
);

export default Bold;
