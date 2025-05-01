import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyDSYEv3QdEyYqAqYH4cquoe8RcH13PlAk4",
  authDomain: "restaurant-management-6d115.firebaseapp.com",
  projectId: "restaurant-management-6d115",
  storageBucket: "restaurant-management-6d115.appspot.com",
  messagingSenderId: "991196518301",
  appId: "1:991196518301:web:d07725b995a14bc134c174",
  measurementId: "G-NGPGVQK660"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Servisleri dışa aktar
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app); 