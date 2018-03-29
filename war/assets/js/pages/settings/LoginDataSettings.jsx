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

const StyledAssociateBtnGroup = styled.div`
    & > button {
        margin-right: 20px;
    }
`;


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
        this.helloCallback = this.helloCallback.bind(this);
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
        hello.on('auth.login', this.helloCallback);

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

    helloCallback(auth) {
        if(auth.network === AuthenticationNetworks.GOOGLE) {
            // get google token
            const session = hello.getAuthResponse(AuthenticationNetworks.GOOGLE);
            const googleIdToken = session.id_token;

            this.addGoogleAccount(googleIdToken);

            // unsubscribe again
            hello.off('auth.login', this.helloCallback);
        }
    }

    addGoogleAccount(googleIdToken) {
        const _this = this;
		const { formatMessage } = IntlProvider.intl;

        gapi.client.qdacity.auth.associateGoogleLogin({
            googleIdToken: googleIdToken
        }).execute(function(resp) {
            if(!resp.code) {
                _this.updateAssociatedLoginList();
            } else {    
                _this.handleFailedAssociateResponse(resp);
            }
        });
    }
    
    onAddEmailPassword() {
		const _this = this;
        const { formatMessage } = IntlProvider.intl;
        
		const emailLabel = formatMessage({
			id: 'settings.logindata.associate.emailpwd.email',
			defaultMessage: 'Email'
		});
		const passwordLabel = formatMessage({
			id: 'settings.logindata.associate.emailpwd.password',
			defaultMessage: 'Password'
		});
		vex.dialog.open({
			message: formatMessage({
				id: 'settings.logindata.associate.emailpwd.heading',
				defaultMessage: 'Register with an email account!'
			}),
			input: [
				`<label for="email">${emailLabel}</label><input name="email" type="text" placeholder="${emailLabel}" required />`,
				`<label for="pwd">${passwordLabel}</label><input name="pwd" type="password" placeholder="${passwordLabel}" required />`
			].join('\n'),
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: formatMessage({
						id: 'settings.logindata.associate.emailpwd.register',
						defaultMessage: 'Register'
					})
				}),
				$.extend({}, vex.dialog.buttons.NO, {
					text: formatMessage({
						id: 'settings.logindata.associate.emailpwd.cancel',
						defaultMessage: 'Cancel'
					})
				})
			],
			callback: async function(data) {
				if (data === false) {
					return console.log('Cancelled');
                }
                
				gapi.client.qdacity.auth.associateEmailPassword({
                    email: data.email,
                    password: data.pwd
                }).execute(function(resp) {
                    if(!resp.code) {
                        _this.updateAssociatedLoginList();
                    } else {
                        _this.handleFailedAssociateResponse(resp);
                    }
                })
			}
		});
    }

    handleFailedAssociateResponse(resp) {
        const { formatMessage } = IntlProvider.intl;

        const code = resp.message.split(':')[0];
        let errorMsg = formatMessage({
            id: 'settings.logindata.associate.failure',
            defaultMessage: 'Could not associate user to that Google account.'
        });

        switch(code) {
            case 'Code4.1': 
                errorMsg = formatMessage({
                    id: 'settings.logindata.associate.failure.invalidGoogleId',
                    defaultMessage: 'The Google token does not seem to be valid!'
                });
                break;
            case 'Code4.2':
                errorMsg = formatMessage({
                    id: 'settings.logindata.associate.failure.associatedOtherAccount',
                    defaultMessage: 'There already exists a QDAcity user with this google account!'
                });
                break;
            case 'Code4.3':
                errorMsg = formatMessage({
                    id: 'settings.logindata.associate.failure.emailFormat',
                    defaultMessage: 'The given email adress is not in a valid format!'
                });
                break;
            case 'Code4.4':
                errorMsg = formatMessage({
                    id: 'settings.logindata.associate.failure.passwordEmpty',
                    defaultMessage: 'The password must not be empty!'
                });
                break;
            case 'Code4.5':
                errorMsg = formatMessage({
                    id: 'settings.logindata.associate.failure.passwordFormat',
                    defaultMessage: 'The password must have at least 7 characters and must contain only small letters, big letters and numbers. Each category has to be fulfilled with at least one character! No Whitespaces allowed.'
                });
                break;
            case 'Code2.1':
                errorMsg = formatMessage({
                    id: 'settings.logindata.associate.failure.emailAlreadyInUse',
                    defaultMessage: 'The Email is already in use!'
                });
                break;
        }

        vex.dialog.open({
            message: errorMsg,
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: formatMessage({
                        id: 'settings.logindata.associate.failure.close',
                        defaultMessage: 'Close'
                    })
                })
            ],
        });
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
                    <StyledAssociateBtnGroup>
                        <BtnDefault onClick={() => this.onAddGoogleAccount()}>
                            <i className="fa fa-google" />
                            <FormattedMessage
                                id="settings.logindata.add.google"
                                defaultMessage="Google"
                            />
                        </BtnDefault>
                        <BtnDefault onClick={() => this.onAddEmailPassword()}>
                            <i className="fa fa-envelope" />
                            <FormattedMessage
                                id="settings.logindata.add.emailpassword"
                                defaultMessage="Email+Password"
                            />
                        </BtnDefault>
                    </StyledAssociateBtnGroup>
                </StyledPanel>
            </div>
        );
    }
}