//@ts-check
import React, {Component} from 'react';

import hello from 'hellojs';
import * as AuthenticationNetworks from '../../common/auth/AuthenticationNetworks.js';

import AuthenticationEndpoint from '../../common/endpoints/AuthenticationEndpoint.js';

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

const StyledAssociatedLoginList = styled.ul`
    padding-left: 5px;
    margin-top: 30px;
    list-style: none;
`;

const StyledAssociateBtnGroup = styled.div`
    margin-top: 20px;

    & > button {
        margin-right: 20px;
    }
`;

const StyledAssociatedLoginItem = styled.li`
    padding: 3px 5px;
    margin-bottom: 5px;

    background-color: ${props => props.theme.bgDefault};
    border: 1px solid ${props => props.theme.borderPrimary};

    &:hover {
        border-color ${props => props.theme.borderDefault};
    }
    &:active {
        border-color ${props => props.theme.borderDefault};
    }
    &:focus {
        border-color ${props => props.theme.borderDefault};
    }

    display: grid;

    @media (max-width: 767px) {
        grid-template-rows: auto auto auto auto;
    }

    @media (min-width: 768px) {
        grid-template-columns: 100px 200px 200px auto;
        grid-column-gap: 2px;
    }
`;

const StyledDisassociateSpan = styled.span`
    text-align: right;

    & > a {
        cursor: pointer;
    }
`;

const StyledChangePasswordButtonWrapper = styled.span`
    margin-left: 30px;
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

        AuthenticationEndpoint.getAssociatedLogins()
            .then(function(resp) {
                _this.setState({
                    associatedLogins: resp.items
                });
            })
            .catch(function(resp) {
                console.error('Could not fetch any associated logins.');
                _this.setState({
                    associatedLogins: []
                });
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

    onAddFacebookAccount() {
        hello.on('auth.login', this.helloCallback);

        hello(AuthenticationNetworks.FACEBOOK)
            .login({
                display: 'popup',
                scope: 'basic, email',
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

    onAddTwitterAccount() {
        hello.on('auth.login', this.helloCallback);

        hello(AuthenticationNetworks.TWITTER)
            .login({
                display: 'popup',
                scope: 'basic, email',
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
        } else if(auth.network === AuthenticationNetworks.FACEBOOK) {
            // get facebook token
            const session = hello.getAuthResponse(AuthenticationNetworks.FACEBOOK);
            const facebookToken = session.access_token;

            this.addFacebookAccount(facebookToken);

            // unsubscribe again
            hello.off('auth.login', this.helloCallback);
        } else if(auth.network === AuthenticationNetworks.TWITTER) {
            // get twitter token
            const session = hello.getAuthResponse(AuthenticationNetworks.TWITTER);
            const twitterToken = session.access_token;

            this.addTwitterAccount(twitterToken);

            // unsubscribe again
            hello.off('auth.login', this.helloCallback);
        }
    }

    addGoogleAccount(googleIdToken) {
        const _this = this;
		const { formatMessage } = IntlProvider.intl;

        AuthenticationEndpoint.associateGoogleLogin(googleIdToken)
            .then(function(resp) {
                _this.updateAssociatedLoginList();
            })
            .catch(function(resp) {    
                _this.handleFailedAssociateResponse(resp);
            });
    }

    addFacebookAccount(facebookAccessToken) {
        const _this = this;
		const { formatMessage } = IntlProvider.intl;

        AuthenticationEndpoint.associateFacebookLogin(facebookAccessToken)
            .then(function(resp) {
                _this.updateAssociatedLoginList();
            })
            .catch(function(resp) {    
                _this.handleFailedAssociateResponse(resp);
            });
    }
    
    addTwitterAccount(twitterAccessToken) {
        const _this = this;
		const { formatMessage } = IntlProvider.intl;

        AuthenticationEndpoint.associateTwitterLogin(twitterAccessToken)
            .then(function(resp) {
                _this.updateAssociatedLoginList();
            })
            .catch(function(resp) {    
                _this.handleFailedAssociateResponse(resp);
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
                
                AuthenticationEndpoint.associateEmailPassword(data.email, data.pwd)
                    .then(function(resp) {
                        _this.updateAssociatedLoginList();
                    })
                    .catch(function(resp) {
                        _this.handleFailedAssociateResponse(resp);
                    });
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

    parseLoginProvider(provider) {
        let parsedProvider = provider;
        switch(provider) {
            case 'GOOGLE': 
                parsedProvider = 'Google';
                break;
            case 'EMAIL_PASSWORD':
                parsedProvider = 'Email';
                break;
            case 'FACEBOOK':
                parsedProvider = 'Facebook';
                break;
            case 'TWITTER':
                parsedProvider = 'Twitter';
                break;
        }
        return parsedProvider
    }

    disassociate(associatedLogin) {
        const _this = this;
        const { formatMessage } = IntlProvider.intl;

        if(this.state.associatedLogins.length == 1) {
            vex.dialog.open({
                message: formatMessage({
                    id: 'settings.logindata.disassociate.failure.oneLeft',
                    defaultMessage: 'You cannot delete the last associated Login!'
                }),
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                        text: formatMessage({
                            id: 'settings.logindata.disassociate.failure.close',
                            defaultMessage: 'Close'
                        })
                    })
                ],
            });
            return;
        }

        AuthenticationEndpoint.disassociateLogin(associatedLogin)
            .then(function(resp) {
                location.reload(); // need reload if current login is deleted
            })
            .catch(function(resp) {
                let errorMsg = formatMessage({
                    id: 'settings.logindata.disassociate.failure',
                    defaultMessage: 'Could not disassociate user with the chosen Login.'
                });
                vex.dialog.open({
                    message: errorMsg,
                    buttons: [
                        $.extend({}, vex.dialog.buttons.YES, {
                            text: formatMessage({
                                id: 'settings.logindata.disassociate.failure.close',
                                defaultMessage: 'Close'
                            })
                        })
                    ],
                });
            });
    }

    onChangePassword() {
        const _this = this;
        const { formatMessage } = IntlProvider.intl;

        const oldPasswordLabel = formatMessage({
			id: 'settings.logindata.changePassword.oldPassword',
			defaultMessage: 'Old Password'
		});
		const newPasswordLabel = formatMessage({
			id: 'settings.logindata.changePassword.newPassword',
			defaultMessage: 'New Password'
		});

        vex.dialog.open({
            message: formatMessage({
                id: 'settings.logindata.changePassword.heading',
                defaultMessage: 'Change your password.'
            }),
            input: [
                `<label for="oldPassword">${oldPasswordLabel}</label><input name="oldPassword" type="password" required />`,
                `<label for="newPassword">${newPasswordLabel}</label><input name="newPassword" type="password" required />`
            ].join('\n'),
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: formatMessage({
                        id: 'settings.logindata.changePassword.changePassword',
                        defaultMessage: 'Change Password'
                    })
                }),
                $.extend({}, vex.dialog.buttons.NO, {
                    text: formatMessage({
                        id: 'settings.logindata.changePassword.cancel',
                        defaultMessage: 'Cancel'
                    })
                })
            ],
            callback: async function(data) {
                if (data === false) {
                    return console.log('Cancelled');
                }
                
                AuthenticationEndpoint.changePassword(data.oldPassword, data.newPassword)
                    .then(function(resp) {
                        _this.props.auth.authentication.refreshSession();
                        vex.dialog.open({
                            message: formatMessage({
                                id: 'settings.logindata.changePassword.success',
                                defaultMessage: 'Your password was changed!'
                            }),
                            buttons: [
                                $.extend({}, vex.dialog.buttons.YES, {
                                    text: formatMessage({
                                        id: 'settings.logindata.changePAssword.success.close',
                                        defaultMessage: 'Close'
                                    })
                                })
                            ],
                        });
                    })
                    .catch(function(resp) {
                        _this.handleFailedChangePasswordResponse(resp);
                    });
            }
        });
    }

    handleFailedChangePasswordResponse(resp) {
        const { formatMessage } = IntlProvider.intl;

        let errorMsg = formatMessage({
            id: 'settings.logindata.changePassword.failure',
            defaultMessage: 'Could not change the password.'
        });

        const code = resp.message.split(':')[0];
        switch(code) {
            case 'Code2.3': 
                errorMsg = formatMessage({
                    id: 'settings.logindata.changePassword.failure.pwdEmpty',
                    defaultMessage: 'The new password must not be empty.'
                });
                break;
            case 'Code2.4':
                errorMsg = formatMessage({
                    id: 'settings.logindata.changePassword.failure.associatedOtherAccount',
                    defaultMessage: 'The password must have at least 7 characters and must contain only small letters, big letters and numbers. Each category has to be fulfilled with at least one character! No Whitespaces allowed.'
                });
                break;
            case 'Code1.2':
                errorMsg = formatMessage({
                    id: 'settings.logindata.changePassword.failure.wrongOldPassword',
                    defaultMessage: 'The old password was not correct!'
                });
                break;
        }

        vex.dialog.open({
            message: errorMsg,
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: formatMessage({
                        id: 'settings.logindata.changePAssword.failure.close',
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
                <StyledAssociatedLoginItem>
                    <span>{this.parseLoginProvider(associatedLogin.provider)}</span>
                    <span>{associatedLogin.externalEmail}</span>
                    <span>{!!associatedLogin.externalEmail ? '' : '(ID: ' + associatedLogin.externalUserId + ')'}</span>
                    <StyledDisassociateSpan>
                        <a><i onClick={() => this.disassociate(associatedLogin)} className="fa fa-trash"/></a>
                    </StyledDisassociateSpan>
                </StyledAssociatedLoginItem>
            );
        }

        const ChangePasswordButton = () => {
            return (
                this.props.auth.userProfile.authNetwork === 'EMAIL_PASSWORD' ?
                    <StyledChangePasswordButtonWrapper>
                        <BtnDefault onClick={() => this.onChangePassword()}>
                            <FormattedMessage
                                id="settings.logindata.email.changePassword"
                                defaultMessage="Change Password"
                            />
                        </BtnDefault>
                    </StyledChangePasswordButtonWrapper> : null
            );
        }

        return (
            <div>
                <StyledPanel>
                    <FormattedMessage
                            id="settings.logindata.loggedInAs"
                            defaultMessage="You are logged in as"
                    />
                    {' '}
                    <u>
                        {this.props.auth.userProfile.externalEmail}
                    </u> 
                    {' (via ' + this.parseLoginProvider(this.props.auth.userProfile.authNetwork) + ')'}
                    <ChangePasswordButton/>
                </StyledPanel>

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
                        <BtnDefault onClick={() => this.onAddFacebookAccount()}>
                            <i className="fa fa-facebook-f" />
                            <FormattedMessage
                                id="settings.logindata.add.facebook"
                                defaultMessage="Facebook"
                            />
                        </BtnDefault>
                        <BtnDefault onClick={() => this.onAddTwitterAccount()}>
                            <i className="fa fa-twitter" />
                            <FormattedMessage
                                id="settings.logindata.add.twitter"
                                defaultMessage="Twitter"
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