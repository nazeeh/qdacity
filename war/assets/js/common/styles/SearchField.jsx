import styled from 'styled-components';

const StyledSearchField = styled.div`
	float: none;
	width: 100%;
	display:flex;
	flex-direction:row;
	padding-bottom: 5px;

	& > input[type=text] {
		flex:1;
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
	}

`;

export default StyledSearchField;
