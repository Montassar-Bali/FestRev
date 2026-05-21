import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA1GwY_Cn-w2jHvLvwS7-nbDQYnEDkyJTA",
  authDomain: "fest-rev.firebaseapp.com",
  databaseURL: "https://fest-rev-default-rtdb.firebaseio.com",
  projectId: "fest-rev",
  storageBucket: "fest-rev.firebasestorage.app",
  messagingSenderId: "270598995249",
  appId: "1:270598995249:web:add8ebe7d5a8f150c10410",
  measurementId: "G-W17D2EDCQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Analytics (safely checking for window to support build environments)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default db;
