import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbgfYoSKfdDRCOXfInqchIrj5RTnZbTFQ",
  authDomain: "hepbwin-app.firebaseapp.com",
  projectId: "hepbwin-app",
  storageBucket: "hepbwin-app.firebasestorage.app",
  messagingSenderId: "185492567783",
  appId: "1:185492567783:web:03c202126f3a56639f1442",
  measurementId: "G-C3V5MJMSLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore with memory cache for React Native (no IndexedDB warning)
const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

export { auth, db };
export default app;
