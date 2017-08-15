import React from 'react'
import styled from 'styled-components';

const Btn = styled.button `
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

const BtnSm = Btn.extend `
	padding: 5px 10px;
	font-size: 12px;
	line-height: 1.5;
`;



const BtnDefault =  BtnSm.extend `
	color: ${props => props.theme.fgDefault};
	background-color:  ${props => props.theme.bgDefault};
	border-color: ${props => props.theme.borderDefault};
	border-radius: 0px;
	&:hover {
		background-color:  ${props => props.theme.borderDefaultHighlight};
		border-color:  ${props => props.theme.borderDefaultHighlight};
		color: ${props => props.theme.fgDefaultHighlight};
		& > span > .fa-inverse {
			color: ${props => props.theme.fgDefault};
		}
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
export default BtnDefault;