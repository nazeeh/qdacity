import firebase from 'firebase';

/* --------------------------------- FIREBASE INIT -------------------------------- */

const config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
  apiKey: "AIzaSyA82H_jvzTlEiU-2UMjMzHZ1DiB_3weRqo",
  authDomain: "georg-schwarz-fau-amse-ws1718.firebaseapp.com",
  databaseURL: "https://georg-schwarz-fau-amse-ws1718.firebaseio.com",
  projectId: "georg-schwarz-fau-amse-ws1718",
  storageBucket: "georg-schwarz-fau-amse-ws1718.appspot.com",
  messagingSenderId: "385639345148"
};

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

const firebaseInstance = firebase.initializeApp(config);


/* ------------------------------- PROXY METHODS ----------------------------------- */
/**
 * Always calls the given fkt if the auth state changes.
 *
 * @param fkt
 */
const addAuthStateListener = function(fkt) {
  firebaseInstance.auth().onAuthStateChanged(fkt);
};

/**
 * Gets the newest id token and provides the gapi with it.
 *
 * @return {Promise}
 */
const synchronizeTokenWithGapi = function() {
  const promise = new Promise(
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
const signInWithGoogle = function() {
   return firebaseInstance.auth().signInWithPopup(googleAuthProvider);
}

/**
 * Get the current firebase user.
 *
 * @return {firebase.User | any}
 */
const getProfile = function() {
  return firebaseInstance.auth().currentUser;
}

/**
 * Checks if there is an logged-in user.
 *
 * @return {boolean}
 */
const isSignedIn = function() {
  return !!firebaseInstance.auth().currentUser;
}

/**
 * Tries to sign out the current firebase user.
 *
 * @return {firebase.Promise.<void>}
 */
const signOut = function() {
  return firebaseInstance.auth().signOut();
}

const AuthenticationProvider = {
  addAuthStateListener: addAuthStateListener,
  synchronizeTokenWithGapi: synchronizeTokenWithGapi,
  signInWithGoogle: signInWithGoogle,
  getProfile: getProfile,
  isSignedIn: isSignedIn,
  signOut: signOut
};

export default AuthenticationProvider;
