// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQTdFGmrM72jbENbvkcGoxdc-iQNftVz4",
  authDomain: "wecruit-84e4d.firebaseapp.com",
  projectId: "wecruit-84e4d",
  storageBucket: "wecruit-84e4d.appspot.com",
  messagingSenderId: "711061768320",
  appId: "1:711061768320:web:dacd6ab91f09d686f43e65"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
