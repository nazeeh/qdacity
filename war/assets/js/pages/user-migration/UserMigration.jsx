import React from 'react';

import styled from 'styled-components';


const StyledContent = styled.div `
    margin-top: 180px;
    max-width: 800px;
    display: block;
    margin-left: auto;
    margin-right: auto;
`;

const StyledHeader1 = styled.h1 `
    margin-bottom: 40px;
`;
const StyledHeader3 = styled.h3 `
    margin-top: 25px;
    margin-bottom: 15px;
`;

const StyledMigrationDescription = styled.div `

`;

const StyledMigrationFunctionality = styled.div `
    margin-top: 80px;
`;

const StyledSignInButtonWrapper = styled.div `
    width: 100%;
`;

const StyledSignInButton = styled.div `
    max-width: 200px;
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 100px;
`;

const ProfileImg = styled.img `
    height: 50px;
    widht: auto;
`;

const StyledButton = styled.div `
    margin: 20px;
    width: 100%;
    max-width: 150px;
`;

const StyledPreconditionsStatus = styled.i `
    margin-right: 7.5px;
`;

const ErrorMsg = styled.p `
    color: red;
`;
const SuccessMsg = styled.p `
    color: green;
`;

export default class UserMigration extends React.Component {
	constructor(props) {
        super(props);

        this.state = {
			name: '',
			email: '',
            picSrc: '',
            isSignedIn: null,
            isAlreadyMigrated: null,
            isRegistered: null
        };

        this.access_token = null;
        this.id_token = null;
        this.migrationStatus = null;

        const _this = this;
        this.props.account.addAuthStateListener(function(payload) {
            console.log('auth state changed:');
            console.log(payload);
            // update on every auth state change
            if(!! payload.authResponse) {
                _this.access_token = payload.authResponse.access_token;
                _this.id_token = payload.authResponse.id_token;
            }
			_this.updateUserStatus();
		});
		
		// update on initialization
		this.updateUserStatus();
    }

    updateUserStatus() {
        const loginStatus = this.props.account.isSignedIn();
		if(loginStatus !== this.state.isSignedIn) {
            if(!loginStatus) {
                this.setState({
                    name: "",
                    email: "",
                    picSrc: "",
                    isSignedIn: null,
                    isAlreadyMigrated: null,
                    isRegistered: null
                });
                return;
            }
            const _this = this;
            this.props.account.getProfile().then((profile) => {
                _this.state.name = profile.displayName;
                _this.state.email = profile.email;
                _this.state.picSrc = profile.thumbnail;
                _this.state.isSignedIn = loginStatus;
                _this.setState(_this.state);
                _this.checkMigrationPreconditions();
            })
		}
    }
    
    checkMigrationPreconditions() {
        const _this = this;

        // custom request because we need access_token here as header
        gapi.client.setToken({
            access_token: this.access_token
        });
        console.log('preconditions: access_token');
        console.log(this.access_token);
        gapi.client.qdacityusermigration.isOldUserRegistered({}).execute((resp) => {
            console.log('old user registered?');
            console.log(resp);
            _this.state.isRegistered = resp.value;
            _this.setState(_this.state);
            
            // all other requests need id_token here as header
            gapi.client.setToken({
                access_token: this.id_token
            });
            
            this.props.account.getCurrentUser().then((user) => {
                _this.state.isAlreadyMigrated = !! user.id;
                _this.setState(_this.state);
            }, (error) => {
                _this.state.isAlreadyMigrated = false;
                _this.setState(_this.state);
            });
        }, (err) => {
            console.error("Error in updating the preconditions for migration!");
            // all other requests need id_token here as header
            gapi.client.setToken({
                access_token: this.id_token
            });
        });
        
    }

    signIn() {
        this.props.account.signIn().then(function() {

        }, (error) => {
            console.error("Sign in failed.");
        });
    }

    signOut() {
        this.props.account.signout().then(function() {
            
        }, (err) => {
            console.error("Sign out failed.");
        });
    }

    migrate() {
        if(!this.state.isRegistered || this.state.isAlreadyMigrated) {
            console.error("Preconditions for migration are not met!");
            return;
        }
        if(!this.access_token || !this.id_token) {
            console.error("Did not receive access_token or id_token!");
            return;
        }

        // custom request because we need access_token here as header
        gapi.client.setToken({
            access_token: this.access_token
        });
        const _this = this;
        gapi.client.qdacityusermigration.migrateFromGoogleIdentityToCustomAuthentication({
            idToken: this.id_token
        }).execute((resp) => {
            if (resp.status === 204 || resp.status === 200) {
                _this.migrationStatus = true;
            } else {
                _this.migrationStatus = false;
            }
        });
        // all other requests need id_token here as header
        gapi.client.setToken({
            access_token: this.id_token
        });
    }

    render() {
        const GoogleSignIn = ({show}) => (
            show ? <div>
                <StyledSignInButtonWrapper>
                    <StyledSignInButton className="btn btn-primary" onClick={() => {this.signIn()}}>
                        Sign-In with Google
                    </StyledSignInButton>
                </StyledSignInButtonWrapper>
            </div>: null
        );

        const ProfileInfo = ({ show }) => (
            show ? <div>
                <div className="col-xs-12">
                    <div>
                        <StyledHeader3>Google Profile:</StyledHeader3>
                    </div>
                    <div className="col-md-2">
                        <ProfileImg src={this.state.picSrc} alt="" className="img-responsive"/>
                    </div>
                    <div className="col-md-3">
                        <p>{this.state.name}<br/>
                        {this.state.email}</p>
                    </div>
                </div>
                <div className="col-xs-12">
                    <div className="col-xs-2"/>
                    <StyledButton className="btn btn-primary col-xs-3" onClick={() => {this.signOut()}}>
                        Sign-Out!
                    </StyledButton>
                    <div className="col-xs-7"/>
                </div>
            </div> : null
        );

        const MigrationPreconditions = ({show}) => (
            show ? <div>
                <div className="col-xs-12">
                    <StyledHeader3>Preconditions for Migration:</StyledHeader3>
                    <p>
                        <PreconditionsStatus fulfilled={this.state.isRegistered} />
                        You are registered at QDAcity with an old account (2017 or before)
                    </p>
                    <p>
                        <PreconditionsStatus fulfilled={!this.state.isAlreadyMigrated} />
                        You are not migrated yet 
                    </p>
                </div>
                <MigrationNotPossible show={!this.state.isRegistered || this.state.isAlreadyMigrated}/>
            </div>: null
        );

        const PreconditionsStatus = ({fulfilled}) => (
            fulfilled === null ? <StyledPreconditionsStatus className="fa fa-question" aria-hidden="true" /> : fulfilled ? <StyledPreconditionsStatus className="fa fa-check" aria-hidden="true" /> : <StyledPreconditionsStatus className="fa fa-times" aria-hidden="true" />
        );
        const MigrationNotPossible = ({show}) => (
            show ? <div>
                <ErrorMsg><strong><StyledPreconditionsStatus className="fa fa-exclamation-triangle" aria-hidden="true" /> Preconditions are not met! Please choose another account to migrate.</strong></ErrorMsg>
            </div> : null 
        );

        const MigrationButton = ({show}) => (
            show ? <div>
                <div className="col-xs-12">
                    <div className="col-md-3"/>
                    <div className="col-md-4">
                        <StyledButton className="btn btn-primary col-xs-3" onClick={() => {this.migrate()}}>
                            Migrate Now!
                        </StyledButton>
                    </div>
                </div>
            </div> : null 
        );

        const MigrationMessage = ({show, successful}) => (
            show && !successful ? <div>
                <ErrorMsg><strong><StyledPreconditionsStatus className="fa fa-exclamation-triangle" aria-hidden="true" /> Migration was not successful!</strong></ErrorMsg>
            </div> : show && successful ? <div>
                <SuccessMsg><strong><StyledPreconditionsStatus className="fa fa-check" aria-hidden="true" /> Migration was successful!</strong></SuccessMsg>
            </div> : null
        );

        return (
            <StyledContent>
                <StyledHeader1>User Migration</StyledHeader1>
                <StyledMigrationDescription>
                    <p>Thank you for participating in our user migration! Please follow the steps below:</p>
                    <ol>
                        <li>Use the <strong>Google-Sign-In-Button</strong> below to sign-in. You should then see your profile information displayed!</li>
                        <li>Then click the <strong>Migration-Button</strong> in order to trigger the migration.</li>
                        <li>Wait until the status displays <strong>'migrated'</strong></li>
                    </ol>
                </StyledMigrationDescription>
                <StyledMigrationFunctionality>
                    
                    <GoogleSignIn show={!this.state.isSignedIn}/>
                    <ProfileInfo show={this.state.isSignedIn}/>
                    <MigrationPreconditions  show={this.state.isSignedIn}/>
                    <MigrationButton show={this.state.isRegistered && !this.state.isAlreadyMigrated && !this.migrationStatus}/>
                    <MigrationMessage show={this.state.isRegistered && !this.state.isAlreadyMigrated && this.migrationStatus !== null} />

                </StyledMigrationFunctionality>
            </StyledContent>
        );
    }
}