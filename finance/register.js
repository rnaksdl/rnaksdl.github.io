


// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDojYW2RMnItpPsREed_1vJ0fuW-cdt-zM",
  authDomain: "finance-rnaksdl.firebaseapp.com",
  projectId: "finance-rnaksdl",
  storageBucket: "finance-rnaksdl.appspot.com",
  messagingSenderId: "711058804808",
  appId: "1:711058804808:web:ec6a07691239e6a5e2c87d",
  measurementId: "G-C7NSTQF95G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app)