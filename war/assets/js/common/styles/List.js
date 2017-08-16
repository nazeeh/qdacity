import styled from 'styled-components';

const StyledPagination = styled.ul `
	list-style: none;
	display: flex;
`;

const StyledPaginationItem = styled.a `
	color: black;
	float: left;
	padding: 8px 16px;
	text-decoration: none;
	cursor: pointer;
`;

const StyledBoxList = styled.ul`
	width: 100%;
	font-family:sans-serif;
	margin:0;
	padding:0px 0 0;
	flex-shrink: 0;
`;

const StyledListItem = styled.li `
	height: 40px;
	width: 100%;
	display: flex;
	flex: 0 0 100%;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding:12px;
	margin-bottom: 5px;
	border: 1px solid transparent;
	&:hover{
		cursor: ${props => (props.clickable ? 'pointer' : 'initial')};
	}
`;

const StyledListItemPrimary = StyledListItem.extend `
	background-color: ${props => props.theme.bgPrimary};
	border-color:  ${props => props.theme.borderPrimary};
	&:hover {
		background-color:  ${props => props.theme.borderPrimaryHighlight};
		border-color:  ${props => props.theme.borderPrimaryHighlight};
		color: ${props => props.theme.fgPrimaryHighlight};
		& > span > .fa-inverse {
			color: ${props => props.theme.fgPrimary};
		}

    }
	&:focus {
		background-color:  ${props => props.theme.borderPrimaryHighlight};
		border-color:  ${props => props.theme.borderPrimaryHighlight};
		color: ${props => props.theme.fgPrimaryHighlight};
    }
	&:active {
		background-color:  ${props => props.theme.borderPrimaryHighlight};
		border-color:  ${props => props.theme.borderPrimaryHighlight};
		color: ${props => props.theme.fgPrimaryHighlight};
	}
`;

const StyledListItemDefault = StyledListItem.extend `
	background-color: ${props => props.theme.bgDefault};
	border-color:  ${props => props.theme.borderDefault};
	&:hover {
		background-color:  ${props => props.theme.borderDefaultHighlight};
		border-color:  ${props => props.theme.borderDefaultHighlight};
		color: ${props => props.theme.fgDefaultHighlight};
    }
	&:focus {
		background-color:  ${props => props.theme.borderDefaultHighlight};
		border-color:  ${props => props.theme.borderDefaultHighlight};
		color: ${props => props.theme.fgDefaultHighlight};
    }
	&:active {
		background-color:  ${props => props.theme.borderDefaultHighlight};
		border-color:  ${props => props.theme.borderDefaultHighlight};
		color: ${props => props.theme.fgDefaultHighlight};
	}
`;

const StyledListItemBtn = styled.a `
	margin-top: -15px;
	align-self:center;
 	font-size: 19px;
	& > i {
	}
`;

export {
	StyledBoxList,
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
};