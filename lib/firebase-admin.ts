import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: FirebaseFirestore.Firestore;

try {
  // Initialize Firebase Admin
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId) {
      throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
    }

    console.log('Initializing Firebase Admin with project:', projectId);

    // Try to use service account credentials if available
    if (clientEmail && privateKey) {
      console.log('Using service account credentials');
      adminApp = initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: clientEmail,
          // Private key needs to have escaped newlines replaced with actual newlines
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        projectId: projectId,
      });
    } else {
      console.log('Using Application Default Credentials (works on Vercel)');
      // For Vercel deployment or local emulator
      // Vercel automatically provides ADC
      // For local, you can set GOOGLE_APPLICATION_CREDENTIALS or use emulator
      adminApp = initializeApp({
        projectId: projectId,
      });
    }
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp);

  // Set settings (safely handle if already set)
  try {
    adminDb.settings({
      ignoreUndefinedProperties: true,
    });
  } catch (e) {
    // Settings already configured, ignore error
  }

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  throw error;
}

export { adminApp, adminDb };

