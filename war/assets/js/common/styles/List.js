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
	background-color: ${props => props.theme.bgPrimary};
	border: 1px solid transparent;
	border-color:  ${props => props.theme.borderPrimary};

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
	StyledListItem
};