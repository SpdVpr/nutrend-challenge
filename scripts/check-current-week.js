/**
 * Check current week data in Firebase
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!serviceAccount.project_id) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set or invalid');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function checkCurrentWeek() {
  console.log('🔍 Checking current week data...\n');

  try {
    const weekDoc = await db.collection('stats').doc('week-2025-11-03').get();
    
    if (weekDoc.exists) {
      const data = weekDoc.data();
      console.log('✅ Document week-2025-11-03 exists!');
      console.log('\nFull data:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n📊 Teams data:');
      if (data.teams && data.teams.length > 0) {
        data.teams.forEach((team, index) => {
          console.log(`\n${index + 1}. ${team.teamName || team.name || 'Unknown'}:`);
          console.log(`   teamId: ${team.teamId || team.id || 'N/A'}`);
          console.log(`   members: ${team.members || 0}`);
          console.log(`   hours: ${team.hours || 0}`);
          console.log(`   activities: ${team.activities || 0}`);
          console.log(`   points: ${team.points || 0}`);
        });
      } else {
        console.log('⚠️  No teams data found');
      }
    } else {
      console.log('❌ Document week-2025-11-03 does NOT exist');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCurrentWeek();

