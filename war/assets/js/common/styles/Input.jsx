import styled from 'styled-components';

const StyledInput = styled.input`
	
	height: 30px;
	padding:0.3em;
	border 1px solid ;
	border-color: ${props => props.theme.borderDefault};
	&:hover {
		border-color: ${props => props.theme.borderDefaultHighlight};
	}
	&:focus {
		border-color: ${props => props.theme.borderDefaultHighlight};
	}
	&:active {
		border-color: ${props => props.theme.borderDefaultHighlight};
	}
	
`;

export default StyledInput;
