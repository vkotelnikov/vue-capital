
import { initializeApp } from "firebase/app";
import * as firebaseui from "firebaseui";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"; 
import firebaseConfig from "./firebaseConfig.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


const fireBaseApp = initializeApp(firebaseConfig);


import { createApp } from 'vue';
import App from './App.vue';

const auth = getAuth(fireBaseApp);
// connectAuthEmulator(auth, "http://localhost:3099");
const db = getFirestore();
// connectFirestoreEmulator(db, 'localhost', 3010);
onAuthStateChanged(auth, (user) => {
  if (user) {
    //   console.log(user);
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    const app = createApp(App);
    // app.use(axios);

    app.mount('#app');
    if(document.getElementById('loader')) {
        document.getElementById('loader')!.style.display = 'none';
    }
    if(document.getElementById('cbr-daily')) {
        document.getElementById('cbr-daily')!.style.display = 'none';
    }
    // ...
  } else {
      const uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult: any, redirectUrl: any) {
              // console.log(authResult, redirectUrl);
              // User successfully signed in.
              // Return type determines whether we continue the redirect automatically
              // or whether we leave that to developer to handle.
              return false;
          },
          uiShown: function() {
              // The widget is rendered.
              // Hide the loader.
              if(document.getElementById('loader')) {
                  document.getElementById('loader')!.style.display = 'none';
              }
              if(document.getElementById('cbr-daily')) {
                  document.getElementById('cbr-daily')!.style.display = 'none';
              }
          }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        GoogleAuthProvider.PROVIDER_ID,
        //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        //   firebase.auth.GithubAuthProvider.PROVIDER_ID,
        //   firebase.auth.EmailAuthProvider.PROVIDER_ID,
        //   firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '',
        // Privacy policy url.
        privacyPolicyUrl: ''
    };
    

    const authUi = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    authUi.start('#firebaseui-auth-container', uiConfig);
  }
});



