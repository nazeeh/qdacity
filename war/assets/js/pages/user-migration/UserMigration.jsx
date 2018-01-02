import React from 'react';

import styled from 'styled-components';

import ReactLoading from '../../common/ReactLoading.jsx';

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
            isRegistered: null,
            migrationStatus: null
        };

        this.access_token = null;
        this.id_token = null;

        this.authenticationProvider = this.props.auth.authentication;

        const _this = this;
        this.authenticationProvider.addAuthStateListener(function(payload) {
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
        const loginStatus = this.authenticationProvider.isSignedIn();
		if(loginStatus !== this.state.isSignedIn) {
            if(!loginStatus) {
                this.setState({
                    name: "",
                    email: "",
                    picSrc: "",
                    isSignedIn: null,
                    isAlreadyMigrated: null,
                    isRegistered: null,
                    migrationStatus: null
                });
                return;
            }
            const _this = this;
            this.authenticationProvider.getProfile().then((profile) => {
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
        gapi.client.qdacityusermigration.isOldUserRegistered({}).execute((resp) => {
            _this.state.isRegistered = resp.value;
            _this.setState(_this.state);
            
            // all other requests need id_token here as header
            _this.resetGapiToken();
            
            this.authenticationProvider.getCurrentUser().then((user) => {
                _this.state.isAlreadyMigrated = !! user.id;
                _this.setState(_this.state);
            }, (error) => {
                _this.state.isAlreadyMigrated = false;
                _this.setState(_this.state);
            });
        }, (err) => {
            console.error("Error in updating the preconditions for migration!");
            // all other requests need id_token here as header
            _this.resetGapiToken();
        });
        
    }

    signIn() {
        this.authenticationProvider.signInWithGoogle().then(function() {

        }, (error) => {
            console.error("Sign in failed.");
        });
    }

    signOut() {
        this.authenticationProvider.signOut().then(function() {
            
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
        this.state.migrationStatus = null;
        this.setState(this.state);
        gapi.client.qdacityusermigration.migrateFromGoogleIdentityToCustomAuthentication({
            idToken: this.id_token
        }).then((success) => {
            _this.state.migrationStatus = true;
            _this.setState(_this.state);
            
            // all other requests need id_token here as header
            _this.resetGapiToken();
        }, (failure) => {
            _this.state.migrationStatus = false;
            _this.setState(_this.state);
            
            // all other requests need id_token here as header
            _this.resetGapiToken();
        });
    }

    resetGapiToken() {
        gapi.client.setToken({
            access_token: this.id_token + ' GOOGLE'
        });
    }

    render() {
        /* ------------------- Google Sign In Button --------------- */
        const GoogleSignIn = ({show}) => (
            show ? <div>
                <StyledSignInButtonWrapper>
                    <StyledSignInButton className="btn btn-primary" onClick={() => {this.signIn()}}>
                        Sign-In with Google
                    </StyledSignInButton>
                </StyledSignInButtonWrapper>
            </div>: null
        );

        /* ------------------- Profile Info --------------- */
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

        /* ------------------- Migration Preconditions --------------- */
        const MigrationPreconditions = ({show}) => (
            show ? <div>
                <div className="col-xs-12">
                    <StyledHeader3>Preconditions for Migration:</StyledHeader3>
                    <PreconditionStatusLoading show={this.state.isRegistered === null || this.state.isAlreadyMigrated === null} />
                    <MigrationPrecondisionsList show={this.state.isRegistered !== null && this.state.isAlreadyMigrated !== null} />
                </div>
                <MigrationNotPossible show={(!this.state.isRegistered || this.state.isAlreadyMigrated) && this.state.isRegistered !== null && this.state.isAlreadyMigrated !== null}/>
            </div>: null
        );
        const MigrationPrecondisionsList = ({show}) => (
            show ? <div>
                <p>
                    <PreconditionsStatus fulfilled={this.state.isRegistered} />
                    You are registered at QDAcity with an old account (2017 or before)
                </p>
                <p>
                    <PreconditionsStatus fulfilled={!this.state.isAlreadyMigrated} />
                    You are not migrated yet 
                </p>
            </div> : null
        );

        const PreconditionsStatus = ({fulfilled}) => (
            fulfilled === null ? <StyledPreconditionsStatus className="fa fa-question" aria-hidden="true" /> : fulfilled ? <StyledPreconditionsStatus className="fa fa-check" aria-hidden="true" /> : <StyledPreconditionsStatus className="fa fa-times" aria-hidden="true" />
        );
        const PreconditionStatusLoading = ({show}) => (
            show ? <ReactLoading show={show} color={'#000000'}/> : null
        );
        const MigrationNotPossible = ({show}) => (
            show ? <div>
                <ErrorMsg><strong><StyledPreconditionsStatus className="fa fa-exclamation-triangle" aria-hidden="true" /> Preconditions are not met! Please choose another account to migrate.</strong></ErrorMsg>
            </div> : null 
        );

        /* ------------------- Migration --------------- */
        const MigrationButton = ({show}) => (
            show ? <div>
                <div className="col-xs-12">
                    <div className="col-md-3"/>
                    <div className="col-md-4">
                        <StyledButton className="btn btn-primary col-xs-3" onClick={() => {this.migrate();}}>
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

        /* ------------------- render --------------- */
        return (
            <StyledContent>
                <StyledHeader1>User Migration</StyledHeader1>
                <StyledMigrationDescription>
                    <p>Thank you for participating in our user migration! Please follow the steps below:</p>
                    <ol>
                        <li>Use the <strong>Google-Sign-In-Button</strong> below to sign-in. You should then see your profile information displayed!</li>
                        <li>Then click the <strong>Migration-Button</strong> in order to trigger the migration.</li>
                        <li>Wait until the status displays that the migration was <strong>'successful'</strong></li>
                    </ol>
                </StyledMigrationDescription>
                <StyledMigrationFunctionality>
                    
                    <GoogleSignIn show={!this.state.isSignedIn}/>
                    <ProfileInfo show={this.state.isSignedIn}/>
                    <MigrationPreconditions  show={this.state.isSignedIn}/>
                    <MigrationButton show={this.state.isRegistered && !this.state.isAlreadyMigrated && !this.state.migrationStatus}/>
                    <MigrationMessage show={this.state.isRegistered && !this.state.isAlreadyMigrated && this.state.migrationStatus !== null} successful={this.state.migrationStatus} />

                </StyledMigrationFunctionality>
            </StyledContent>
        );
    }
}