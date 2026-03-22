// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_WEB_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Check if all required config values are present
const requiredConfig = ['apiKey', 'authDomain', 'projectId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  console.error('❌ Missing Firebase configuration:', missingConfig);
  console.error('Environment variables loaded:', {
    apiKey: process.env.FIREBASE_WEB_API_KEY ? '✅' : '❌',
    projectId: process.env.FIREBASE_PROJECT_ID ? '✅' : '❌',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ? '✅' : '❌',
    appId: process.env.FIREBASE_APP_ID ? '✅' : '❌'
  });
  throw new Error('Firebase configuration is incomplete');
}

// Initialize Firebase
console.log('🚀 Initializing Firebase with project:', process.env.FIREBASE_PROJECT_ID);
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and get a reference to the service
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Optional: Add scopes if needed
googleProvider.addScope('email');
googleProvider.addScope('profile');

console.log('✅ Firebase initialized successfully');

export { auth, googleProvider };
export default app;