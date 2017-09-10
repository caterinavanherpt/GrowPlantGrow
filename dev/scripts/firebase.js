import firebase from 'firebase';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDIfCDOTsfQWhUGsKN-asK9TuW4Vf4hdJ8",
  authDomain: "plantstuff-e9d9e.firebaseapp.com",
  databaseURL: "https://plantstuff-e9d9e.firebaseio.com",
  projectId: "plantstuff-e9d9e",
  storageBucket: "gs://plantstuff-e9d9e.appspot.com/",
  messagingSenderId: "671031793603"
};
firebase.initializeApp(config);

export default firebase; 
