import firebase from 'firebase';

var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
  apiKey: "AIzaSyA82H_jvzTlEiU-2UMjMzHZ1DiB_3weRqo",
  authDomain: "georg-schwarz-fau-amse-ws1718.firebaseapp.com",
  databaseURL: "https://georg-schwarz-fau-amse-ws1718.firebaseio.com",
  projectId: "georg-schwarz-fau-amse-ws1718",
  storageBucket: "georg-schwarz-fau-amse-ws1718.appspot.com",
  messagingSenderId: "385639345148"
};

var googleAuthProvider = new firebase.auth.GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

var firebaseInstance = firebase.initializeApp(config);

/**
 * Always calls the given fkt if the auth state changes.
 *
 * @param fkt
 */
var addAuthStateListener = function(fkt) {
  firebaseInstance.auth().onAuthStateChanged(fkt);
};

/**
 * Gets the newest id token and provides the gapi with it.
 *
 * @return {Promise}
 */
var synchronizeTokenWithGapi = function() {
  var promise = new Promise(
    function (resolve, reject) {
      if (!isSignedIn()) {
        reject();
        return;
      }
      firebaseInstance.auth().currentUser.getIdToken(/* forceRefresh */ false).then(function (idToken) {
        gapi.client.setToken({access_token: idToken});
        resolve();
      }).catch(function (error) {
        reject(error);
      });
    });
  return promise
}

/**
 * Signs-in on google account via a popup.
 *
 * @param callback
 * @return {firebase.Promise.<firebase.auth.UserCredential>}
 */
var signInWithGoogle = function() {
   return firebaseInstance.auth().signInWithPopup(googleAuthProvider);
}

/**
 * Get the current firebase user.
 *
 * @return {firebase.User | any}
 */
var getProfile = function() {
  return firebaseInstance.auth().currentUser;
}

/**
 * Checks if there is an logged-in user.
 *
 * @return {boolean}
 */
var isSignedIn = function() {
  return !!firebaseInstance.auth().currentUser;
}

/**
 * Tries to sign out the current firebase user.
 *
 * @return {firebase.Promise.<void>}
 */
var signOut = function() {
  return firebaseInstance.auth().signOut();
}

var firebaseInstanceWrapper = {
  addAuthStateListener: addAuthStateListener,
  synchronizeTokenWithGapi: synchronizeTokenWithGapi,
  signInWithGoogle: signInWithGoogle,
  getProfile: getProfile,
  isSignedIn: isSignedIn,
  signOut: signOut
};

export default firebaseInstanceWrapper;
