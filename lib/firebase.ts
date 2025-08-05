// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBarq0A_8vGrEa7JiCE_z65fL2v-vitBwY',
  authDomain: 'moody-172a0.firebaseapp.com',
  projectId: 'moody-172a0',
  storageBucket: 'moody-172a0.appspot.com',
  messagingSenderId: '655660087609',
  appId: '1:655660087609:web:6f83f0b03126ec5d23d0e8',
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)

