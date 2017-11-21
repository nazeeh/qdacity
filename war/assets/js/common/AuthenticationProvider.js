import hello from 'hellojs';


const GOOGLE_CLIENT_ID = '385639345148-k8ph3ug699i8974d8f8vjcffd1tr9llg.apps.googleusercontent.com';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/userinfo.profile, https://www.googleapis.com/auth/userinfo.email'

/* ------------------------------- hello-js init ----------------------------------- */


/* ------------------------------- AuthenticationProvider ----------------------------------- */
export default class AuthenticationProvider {

  constructor() {
    hello.init({
      google: GOOGLE_CLIENT_ID
    })
    
    this.network = {
      google: 'google'
    }
  }


  /**
   * Signs-in on google account via a popup.
   *
   * @param callback
   * @return {Promise.<any>}
   */
  signInWithGoogle() {

    const _this = this;
    const promise = new Promise(
      function (resolve, reject) {
        hello.on('auth.login', function(auth) {
          _this.synchronizeTokenWithGapi();
          resolve();
        });

        hello(_this.network.google).login({
          display: 'popup',
          response_type: 'token id_token',
          scope: GOOGLE_SCOPES
        }).then(function() {
          // do nothing because the listener  gets the result.
        }, function(err) {
          console.log(err);
          reject(err);
        });
      }
    );
    return promise;
  }
  
  /**
   * Get the current user.
   *
   * @return Promise<any>
   */
  getProfile() {
    return hello(this.network.google).api('me');
  }

  /**
   * Checks if there is an logged-in user.
   *
   * @return {boolean}
   */
  isSignedIn() {
    let session = hello.getAuthResponse(this.network.google);
    let currentTime = (new Date()).getTime() / 1000;
    return session && session.access_token && session.expires > currentTime;
  }

  /**
   * Tries to sign out the current user.
   *
   * @return {Promise.<void>}
   */
  signOut() {
    return hello(this.network.google).logout();
  }

  /**
   * Always calls the given fkt if the auth state changes.
   *
   * @param fkt
   */
  addAuthStateListener(fkt) {
    hello.on('auth', fkt);
  };

  /**
   * Gets the newest id token and provides the gapi with it.
   *
   * @return {Promise}
   */
  synchronizeTokenWithGapi() {
    const _this = this;
    const promise = new Promise(
      function (resolve, reject) {
        if (!_this.isSignedIn()) {
          reject();
          return;
        }
        let session = hello.getAuthResponse(_this.network.google);
        let idToken = session.id_token;
        gapi.client.setToken({access_token: idToken});
        resolve();
      });
    return promise
  }
}
