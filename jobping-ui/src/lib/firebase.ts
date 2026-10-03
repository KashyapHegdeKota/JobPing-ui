import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const publicConfig = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(publicConfig)
  .filter(([, value]) => !value?.trim())
  .map(([name]) => name);

if (process.env.NODE_ENV === 'production' && missingConfig.length > 0) {
  throw new Error(`Missing required Firebase public configuration: ${missingConfig.join(', ')}`);
}

const firebaseConfig = {
  apiKey: publicConfig.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock_key',
  authDomain: publicConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock_domain',
  projectId: publicConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock_project_id',
  storageBucket: publicConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock_bucket',
  messagingSenderId: publicConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'mock_sender',
  appId: publicConfig.NEXT_PUBLIC_FIREBASE_APP_ID || 'mock_app_id',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
