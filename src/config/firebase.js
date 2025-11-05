import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD7Galv9E7DhPvQ3OLGYr2GvEYL8jwY1Zo",
  authDomain: "mainkam-915ac.firebaseapp.com",
  projectId: "mainkam-915ac",
  storageBucket: "mainkam-915ac.firebasestorage.app",
  messagingSenderId: "15171245735",
  appId: "1:15171245735:web:736f967fc705200326ed82",
  measurementId: "G-5L072KYBSK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (optional)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;

