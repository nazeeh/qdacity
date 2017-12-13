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

const LogoutButton = styled.div `
    margin: 20px;
`;

const StyledPreconditionsStatus = styled.i `
    margin-right: 7.5px;
`;

export default class UserMigration extends React.Component {
	constructor(props) {
        super(props);

        this.state = {
			name: '',
			email: '',
            picSrc: '',
            isSignedIn: false
        };

        const _this = this;
        this.props.account.addAuthStateListener(function() {
            // update on every auth state change
			_this.updateUserStatus();
		});
		
		// update on initialization
		this.updateUserStatus();
    }

    updateUserStatus() {
        const loginStatus = this.props.account.isSignedIn();
        console.log(loginStatus);
		if(loginStatus !== this.state.isSignedIn) {
            if(!loginStatus) {
                this.setState({
                    name: "",
                    email: "",
                    picSrc: "",
                    isSignedIn: false
                });
                return;
            }
            const _this = this;
            this.props.account.getProfile().then((profile) => {
                _this.setState({
                    name: profile.displayName,
                    email: profile.email,
                    picSrc: profile.thumbnail,
                    isSignedIn: loginStatus
                });
            })
		}
	}

    signIn() {
        this.props.account.signIn().then(function() {

        });
    }

    signOut() {
        this.props.account.signout().then(function() {
            
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
                    <LogoutButton className="btn btn-primary col-xs-3" onClick={() => {this.signOut()}}>
                        Sign-Out!
                    </LogoutButton>
                    <div className="col-xs-7"/>
                </div>
            </div> : null
        );

        const MigrationPreconditions = ({show}) => (
            show ? <div>
                <div className="col-xs-12">
                    <StyledHeader3>Preconditions for Migration:</StyledHeader3>
                    <p>
                        <PreconditionsStatus fulfilled={true} />
                        You are registered at QDAcity 
                    </p>
                    <p>
                        <PreconditionsStatus fulfilled={false} />
                        You are not migrated yet 
                    </p>
                </div>
            </div>: null
        );

        const PreconditionsStatus = ({fulfilled}) => (
            fulfilled ? <StyledPreconditionsStatus className="fa fa-check" aria-hidden="true" /> : <StyledPreconditionsStatus className="fa fa-times" aria-hidden="true" />
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

                </StyledMigrationFunctionality>
            </StyledContent>
        );
    }
}