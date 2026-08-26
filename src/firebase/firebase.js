import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyC3TEh3nN22q4Eb7TPTOU2dHP6_C4FtIhQ",
  authDomain: "instagramclone-23ceb.firebaseapp.com",
  projectId: "instagramclone-23ceb",
  storageBucket: "instagramclone-23ceb.firebasestorage.app",
  messagingSenderId: "260528032675",
  appId: "1:260528032675:web:69709f47dfe88dea70a816",
  measurementId: "G-GKLZ9CYQF5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
