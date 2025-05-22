// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore instance
const firestoreDb = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(firestoreDb, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED // Optional: Or a specific size
})
  .then(() => {
    console.log("Firebase offline persistence enabled successfully.");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a a time.
      // This is a common scenario. You can choose to log it or inform the user.
      console.warn("Firebase persistence failed (failed-precondition). Multiple tabs open or other issue.");
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence.
      console.error("Firebase persistence failed (unimplemented). Browser doesn't support required features.");
    } else {
      console.error("Firebase persistence failed with error: ", err);
    }
  });

export const db = firestoreDb;