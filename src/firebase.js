import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "<REDACTED>",
  authDomain: "<REDACTED>",
  databaseURL: "<REDACTED>",
  projectId: "<REDACTED>",
  storageBucket: "<REDACTED>",
  messagingSenderId: "<REDACTED>",
  appId: "<REDACTED>",
  measurementId: "<REDACTED>"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = firebaseApp.firestore();
