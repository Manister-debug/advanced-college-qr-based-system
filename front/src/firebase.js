import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyAKlXWvOxmd67OS_3K3TJWg0a--5pOlKxY",
  authDomain: "uni-scan-994c1.firebaseapp.com",
  projectId: "uni-scan-994c1",
  storageBucket: "uni-scan-994c1.firebasestorage.app",
  messagingSenderId: "632908108532",
  appId: "1:632908108532:web:599114ca2f1b115f8a44a1",
  measurementId: "G-CQQJKDS3DX"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };