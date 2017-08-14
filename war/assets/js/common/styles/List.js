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

const StyledListItem = styled.li `
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
`;

const StyledListItemBtn = styled.a `
	margin-top: -15px;
	align-self:center;
	float: right;
 	font-size: 19px;
	& > i {
	}
`;

export {
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledListItem
};