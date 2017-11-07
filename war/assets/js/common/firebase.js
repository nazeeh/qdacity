import firebase from 'firebase';

var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
  apiKey: "AIzaSyA82H_jvzTlEiU-2UMjMzHZ1DiB_3weRqo",
  authDomain: "georg-schwarz-fau-amse-ws1718.firebaseapp.com",
  databaseURL: "https://georg-schwarz-fau-amse-ws1718.firebaseio.com",
  projectId: "georg-schwarz-fau-amse-ws1718",
  storageBucket: "georg-schwarz-fau-amse-ws1718.appspot.com",
  messagingSenderId: "385639345148"
};

var firebaseWrapper = {
  firebase: firebase.initializeApp(config),
  googleAuthProvider: new firebase.auth.GoogleAuthProvider()
};

export default firebaseWrapper;
