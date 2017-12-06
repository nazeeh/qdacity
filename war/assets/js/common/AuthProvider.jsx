import React from 'react';
import PropTypes from 'prop-types';

import AuthenticationProvider from './AuthenticationProvider';
import AuthorizationProvider from './AuthorizationProvider';


export default class AuthProvider extends React.Component {
    constructor(props) {
        super(props);

        this.authenticationProvider = new AuthenticationProvider();
        this.authorizationProvider = new AuthorizationProvider();

        this.state = {
            isUserSignedIn: false,
            isUserRegistered: false
        }

        const _this = this;
        this.authenticationProvider.addAuthStateListener(function() {
			// update on every auth state change
			_this.updateUserStatus();
		});

        // on page reloads: also reload profile data		
		if(this.authenticationProvider.isSignedIn() && this.authenticationProvider.activeNetwork !== 'gapi') {
			_this.authenticationProvider.synchronizeTokenWithGapi();
		} else {
			// try silent sign in
			_this.authenticationProvider.silentSignInWithGoogle().then(function() {
                _this.authenticationProvider.synchronizeTokenWithGapi();
                _this.updateUserStatus() // somehow the auth state listener triggers too early!
			});
		}
    }

    updateUserStatus() {
		const _this = this;
        const loginStatus = this.authenticationProvider.isSignedIn();
        if(!loginStatus && !this.state.isUserSignedIn) {
            // no need to rerender!
            return;
        }

        this.state.isUserSignedIn = loginStatus;
        // don't rerender here in order to not show "you are not logged in" prompt!
        if(!loginStatus) {
            return;
        }

        this.authorizationProvider.getCurrentUser().then(function(user) {
            _this.state.isUserRegistered = !!user;
            _this.setState(_this.state); 
        }, function(err) {
            _this.state.isUserRegistered = false;
            _this.setState(_this.state); 
        })
	}

    getChildContext() {
        return {
            getAuthState: () => this.state,
            authenticationProvider: this.authenticationProvider,
            authorizationProvider: this.authorizationProvider
        };
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}



AuthProvider.childContextTypes = {
    getAuthState: PropTypes.object.require,
    authenticationProvider: PropTypes.object.require,
    authorizationProvider: PropTypes.object.require
}
