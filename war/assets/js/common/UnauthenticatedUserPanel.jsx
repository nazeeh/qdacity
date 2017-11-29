import React from 'react';
import styled from 'styled-components';

import SigninWithGoogleBtn from '../pages/index/SigninWithGoogleBtn.jsx';

const StyledPanel = styled.div `
    flex-grow: 1;
    text-align: center;
    max-width: 500px;
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 250px;
	margin-bottom:20px;
    border: 1px solid ${props => props.theme.borderDefault};
	padding: 20px 50px 20px 50px;
	background-color:  ${props => props.theme.defaultPaneBg};
	& > div {
		font-size: 18px;
	}
    `;

export default class UnauthenticatedUserPanel extends React.Component {
	constructor(props) {
		super(props);
    }
    
	render() {
		return (
           <StyledPanel>
                <h4>You are currently not logged in!</h4>
                <p>Please sign-in or register to access this page!</p>
                <p>Click <a href="/">here</a> to get to the Home.</p>
            </StyledPanel>
        );
	}
}