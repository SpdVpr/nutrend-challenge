/**
 * Manual sync script to test Strava data synchronization
 * Run with: node scripts/manual-sync.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!serviceAccount.project_id) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set or invalid');
  console.error('💡 Make sure you have set up the environment variable correctly');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Import the sync function
async function runSync() {
  console.log('🚀 Starting manual Strava sync...\n');

  try {
    // Dynamically import the sync function
    const { syncStravaData } = await import('../lib/sync-strava.ts');
    
    console.log('📡 Calling syncStravaData()...\n');
    const result = await syncStravaData();
    
    console.log('\n✅ Sync completed successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('\n❌ Error during sync:', error);
    console.error('\nError details:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

runSync();

