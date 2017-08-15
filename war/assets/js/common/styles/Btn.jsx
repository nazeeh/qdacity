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
`;

const BtnSm = btn.extend `
	padding: 5px 10px;
	font-size: 12px;
	line-height: 1.5;
`;



export default BtnSm.extend `
	color: #333;
	background-color: #fff;
	border-color: #ccc;
	border-radius: 0px;
	&:hover {
      background-color: #e7e7e7;
    }
`;
