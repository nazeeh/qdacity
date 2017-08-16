import styled from 'styled-components';

import {BtnSm} from './Btn.jsx';

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
	height: auto;
	width: 100%;
	display: flex;
	flex: 0 0 100%;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 5px 10px;
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
		border-color:  ${props => props.theme.borderPrimaryHighlight};
		font-weight: bold;
		& > span > .fa-inverse {
			color: ${props => props.theme.fgPrimary};
		}

    }
	&:focus {
		border-color:  ${props => props.theme.borderPrimaryHighlight};
		font-weight: bold;
    }
	&:active {
		border-color:  ${props => props.theme.borderPrimaryHighlight};
		font-weight: bold;
	}
`;

const StyledListItemDefault = StyledListItem.extend `
	background-color: ${props => props.theme.bgDefault};
	border-color:  ${props => props.theme.borderDefault};
	&:hover {
		border-color:  ${props => props.theme.borderDefaultHighlight};
		font-weight: bold;
    }
	&:focus {
		border-color:  ${props => props.theme.borderDefaultHighlight};
		font-weight: bold;
    }
	&:active {
		border-color:  ${props => props.theme.borderDefaultHighlight};
		font-weight: bold;
	}
`;

const StyledListItemBtn = BtnSm.extend `
	background-color: rgba(0, 0, 0, 0.0);
	color: ${props => props.color};
	border-color: ${props => props.color};
	align-self:center;
 	font-size: 19px;
	border: 1px solid;
	margin: 0px 2px 0px 2px;
	padding: 4px 6px;
	&:hover{
		color: ${props => props.colorAccent} !important;
		border-color: ${props => props.colorAccent} !important;
	}
	& > i {
		color: inherit !important;
		border-color: inherit !important;
		&:hover{
			color: ${props => props.colorAccent} !important;
			border-color: ${props => props.colorAccent} !important;
		}
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