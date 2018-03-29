//@ts-check
import React, {Component} from 'react';

import hello from 'hellojs';
import * as AuthenticationNetworks from '../../common/auth/AuthenticationNetworks.js';

import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { BtnDefault } from '../../common/styles/Btn.jsx'


const StyledPanel = styled.div`
	background-color: ${props => props.theme.defaultPaneBg};
	border: 1px solid ${props => props.theme.borderDefault};
	padding: 20px 50px 20px 50px;
    margin: 20px;
`;

const StyledAssociatedLoginList = styled.ul``;


const GOOGLE_CLIENT_ID = '$CLIENT_ID$';
const GOOGLE_SCOPES =
	'https://www.googleapis.com/auth/userinfo.profile, https://www.googleapis.com/auth/userinfo.email';

export default class LoginDataSettings extends Component {
	constructor(props) {
        super(props);

        this.state = {
            associatedLogins: []
        }
        
        this.updateAssociatedLoginList = this.updateAssociatedLoginList.bind(this);
        this.props.auth.authentication.addAuthStateListener(this.updateAssociatedLoginList);

        // hellojs is already setup in GoogleAuthenticationProvider

        this.updateAssociatedLoginList();
    }

    updateAssociatedLoginList() {
        const _this = this;

        gapi.client.qdacity.auth.getAssociatedLogins().execute(function(resp) {
            if (!resp.code) {
                _this.setState({
                    associatedLogins: resp.items
                });
            } else {
                console.error('Could not fetch any associated logins.');
                _this.setState({
                    associatedLogins: []
                });
            }
        });
    }

    onAddGoogleAccount() {
        const _this = this;
        hello.on('auth.login', function(auth) {
            // get google token
            const session = hello.getAuthResponse(AuthenticationNetworks.GOOGLE);
            const googleIdToken = session.id_token;

            _this.addGoogleAccount(googleIdToken);
        });

        hello(AuthenticationNetworks.GOOGLE)
            .login({
                display: 'popup',
                response_type: 'token id_token',
                scope: GOOGLE_SCOPES,
                force: true // let user choose which account he wants to login with
            })
            .then(
                function() {
                    // do nothing because the listener gets the result.
                },
                function(err) {
                    console.log(err);
                }
            );        
    }

    addGoogleAccount(googleIdToken) {
        console.log(googleIdToken);
    }
    
    render() {

        const AssociatedLoginListItems = ({ associatedLoginList }) => {
            return !! associatedLoginList ? <div>
                {associatedLoginList.map((associatedLogin, i) => {
                    return (
                        <AssociatedLoginListItem associatedLogin={associatedLogin}/>
                    );
                })}
            </div> : null;
        }

        const AssociatedLoginListItem = ({ associatedLogin }) => {
            return (
                <li>{associatedLogin.provider + ' | ' + associatedLogin.externalEmail}</li>
            );
        }

        return (
            <div>
                <StyledPanel>
                    <h2>
                        <FormattedMessage
                            id="settings.logindata.heading"
                            defaultMessage="Login Data Settings"
                        />	
                    </h2>        

                    <StyledAssociatedLoginList>
                        <AssociatedLoginListItems associatedLoginList={this.state.associatedLogins}/>
                    </StyledAssociatedLoginList>
                </StyledPanel>

                <StyledPanel>
                    <h4>
                        <FormattedMessage
                            id="settings.logindata.add"
                            defaultMessage="Associate new Login"
                        />	
                    </h4>  
                    
                    <BtnDefault onClick={() => this.onAddGoogleAccount()}>
                        <i className="fa fa-google" />
                        <FormattedMessage
                            id="settings.logindata.add.google"
                            defaultMessage="Google"
                        />
                    </BtnDefault>
                </StyledPanel>
            </div>
        );
    }
}