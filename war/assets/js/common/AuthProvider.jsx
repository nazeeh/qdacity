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

    /**
     * Updates the state -> the supplied authState
     * @returns {Promise}
     */
    updateUserStatus() {
        const _this = this;
        const promise = new Promise(
            function (resolve, reject) {
                const loginStatus = _this.authenticationProvider.isSignedIn();
                if(!loginStatus && !_this.state.isUserSignedIn) {
                    // no need to rerender!
                    resolve();
                    return;
                }

                _this.state.isUserSignedIn = loginStatus;
                // don't rerender here in order to not show "you are not logged in" prompt!
                if(!loginStatus) {
                    resolve();
                    return;
                }

                _this.authenticationProvider.getCurrentUser().then(function(user) {
                    _this.state.isUserRegistered = !!user;
                    _this.setState(_this.state); 
                    resolve();
                }, function(err) {
                    _this.state.isUserRegistered = false;
                    _this.setState(_this.state); 
                    resolve();
                })
            });
        return promise;
	}

    getChildContext() {
        return {
            getAuthState: () => this.state,
            updateUserStatus: () => { return this.updateUserStatus() },
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
    getAuthState: PropTypes.func.require,
    authenticationProvider: PropTypes.object.require,
    authorizationProvider: PropTypes.object.require,
    updateUserStatus: PropTypes.func.require
}
