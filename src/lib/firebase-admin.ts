// src/lib/firebase-admin.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!serviceAccount.project_id) {
  throw new Error('Firebase service account no configurado');
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

export const adminAuth = getAuth(app);
