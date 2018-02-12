import React from 'react';
import styled from 'styled-components';

const Btn = styled.button`
	display: inline-block;
	padding: 6px 12px;
	margin-bottom: 0;
	font-size: 14px;
	font-weight: 400;
	line-height: 1.42857143;
	text-align: center;
	white-space: nowrap;
	vertical-align: middle;
	cursor: pointer;
	background-image: none;
	border: 1px solid transparent;
`;

const BtnSm = Btn.extend`
	padding: 5px 10px;
	font-size: 12px;
	line-height: 1.5;
	border-radius: 0px;
	& > span {
		margin-left: 5px;
	}
`;

const BtnDefault = BtnSm.extend`
	color: ${props =>
		props.active ? props.theme.fgDefaultHighlight : props.theme.fgDefault};
	background-color: ${props =>
		props.active ? props.theme.bgDefaultHighlight : props.theme.bgDefault};
	border-color: ${props =>
		props.active
			? props.theme.borderDefaultHighlight
			: props.theme.borderDefault};
	&:hover {
		background-color: ${props => props.theme.borderDefaultHighlight};
		border-color: ${props => props.theme.borderDefaultHighlight};
		color: ${props => props.theme.fgDefaultHighlight};
		& > div > .fa-inverse {
			color: ${props => props.theme.fgDefault};
		}
	}
	&:focus {
		background-color: ${props => props.theme.borderDefaultHighlight};
		border-color: ${props => props.theme.borderDefaultHighlight};
		color: ${props => props.theme.fgDefaultHighlight};
	}
	&:active {
		background-color: ${props => props.theme.borderDefaultHighlight};
		border-color: ${props => props.theme.borderDefaultHighlight};
		color: ${props => props.theme.fgDefaultHighlight};
	}
`;

const BtnPrimary = BtnSm.extend`
	color: ${props =>
		props.active ? props.theme.fgPrimaryHighlight : props.theme.fgPrimary};
	background-color: ${props =>
		props.active ? props.theme.bgPrimaryHighlight : props.theme.bgPrimary};
	border-color: ${props => props.theme.borderPrimary};
	border-radius: 0px;
	&:hover {
		background-color: ${props => props.theme.borderPrimaryHighlight};
		border-color: ${props => props.theme.borderPrimaryHighlight};
		color: ${props => props.theme.fgPrimaryHighlight};
		& > div > .fa-inverse {
			color: ${props => props.theme.fgPrimary};
		}
	}
	&:focus {
		background-color: ${props => props.theme.borderPrimaryHighlight};
		border-color: ${props => props.theme.borderPrimaryHighlight};
		color: ${props => props.theme.fgPrimaryHighlight};
	}
	&:active {
		background-color: ${props => props.theme.borderPrimaryHighlight};
		border-color: ${props => props.theme.borderPrimaryHighlight};
		color: ${props => props.theme.fgPrimaryHighlight};
	}
`;

const BtnGroup = styled.div`
	margin-left: 10px;
	display: inline;

	& > button:nth-child(n + 2),
	& > input:nth-child(n + 2) {
		border-left: none;
	}
`;

const BtnLg = styled.button`
	padding: 6px 12px;
	background-image: none;
	box-shadow: none;
	background-color: rgba(255, 255, 255, 0.4);
	border: 1px solid transparent;
	border-width: 1px;
	border-color: #fff;
	vertical-align: middle;
	&:hover {
		background-color: rgba(255, 255, 255, 1);
		border-color: #fff;
	}
	margin: auto;
	display: flex;
	flex-direction: row;
	color: rgba(0, 0, 0, 1);
	& > span {
		padding-left: 5px;
		font-size: 18px;
		margin: auto;
	}
	& > a {
		color: black;
		&:hover {
			color: black;
		}
	}
`;

export { BtnDefault, BtnPrimary, BtnSm, BtnLg, BtnGroup };
