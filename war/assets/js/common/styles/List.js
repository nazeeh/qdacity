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

const StyledListItemBtn = styled.a `
	float: right;
	margin-top: -15px;
`;

export {
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn
};