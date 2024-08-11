import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: "AIzaSyBDV-atQmVNF1eSQyx8UkEwCiDDkjPA_tI",
    authDomain: "pantry-tracking-app-eba3e.firebaseapp.com",
    projectId: "pantry-tracking-app-eba3e",
    storageBucket: "pantry-tracking-app-eba3e.appspot.com",
    messagingSenderId: "871318388015",
    appId: "1:871318388015:web:a646c370e73964918335da"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
export {db}