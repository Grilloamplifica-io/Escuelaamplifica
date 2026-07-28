import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBgQ0ydpovCM6qhwwJ8CtZjU0hLCMVyTHw',
  authDomain: 'amplifica-academia.firebaseapp.com',
  databaseURL: 'https://amplifica-academia-default-rtdb.firebaseio.com',
  projectId: 'amplifica-academia',
  storageBucket: 'amplifica-academia.firebasestorage.app',
  messagingSenderId: '289568804283',
  appId: '1:289568804283:web:c168387b3d42cab97b889e',
};

export const DB_URL = firebaseConfig.databaseURL;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let currentUser: User | null = null;

// Login anónimo silencioso: solo sirve para cumplir la regla ".read/.write": "auth != null"
// de la Realtime Database. El login real (por RUT) lo maneja AppContext, no Firebase Auth.
const readyPromise = new Promise<void>((resolve) => {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) resolve();
  });
  signInAnonymously(auth).catch((err) => console.error('Firebase: login anónimo falló', err));
});

export async function obtenerIdToken(): Promise<string> {
  await readyPromise;
  if (!currentUser) throw new Error('Firebase: no autenticado');
  return currentUser.getIdToken();
}
