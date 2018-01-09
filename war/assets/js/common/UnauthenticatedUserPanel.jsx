import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FormattedMessage } from 'react-intl';

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


const loadingAnimation = keyframes `
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;
const StyledLoader = styled.div `
    margin-left: auto;
    margin-right: auto;
    margin-top: 250px;
    margin-bottom:20px;
    
    width: 150px;
    height: 150px;

    border: 20px solid #f2f2f2;
    border-radius: 50%;
    border-top: 20px solid #428bca;

    animation: ${loadingAnimation} 2s linear infinite;
`;

export default class UnauthenticatedUserPanel extends React.Component {
	constructor(props) {
        super(props);
        
        this.state = {
            loading: true
        }
        const timeout = props.timeout || 2000;

        const _this = this;
        setTimeout(function() {
            _this.state.loading = false
            _this.setState(_this.state);
        }, timeout)
    }
    
	render() {
        if(this.state.loading) {
            return (
                <StyledLoader/>
            );
        }
        else {
            return (
                <StyledPanel>
                        <h4><FormattedMessage id='unauthenticated_user_panel.not_logged_in_statement' defaultMessage='You are currently not logged in!' /></h4>
                        <p><FormattedMessage id='unauthenticated_user_panel.sign_in_or_register_note' defaultMessage='Please sign-in or register to access this page.' /></p>
                        <p><FormattedMessage id='unauthenticated_user_panel.redirect_to_home' 
                            defaultMessage={'Click {redirect_url} to get to the Home.'}
                            values={{
                                redirect_url: (<a href="/">here</a>),
                            }} />
                        </p>
                    </StyledPanel>
                );
            }
	}
}