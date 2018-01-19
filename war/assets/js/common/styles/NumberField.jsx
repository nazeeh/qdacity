import React from 'react';
import styled from 'styled-components';

const StyledNumberInput = styled.input`
	display: inline-block;
	margin: 0;
	padding: 5px;
	font-size: 12px;
	line-height: 1.5;
	border: 1px solid #ccc;
`;

export default props => <StyledNumberInput {...props} type="number" />;
