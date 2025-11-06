/**
 * Test script to verify Strava sync is working
 * Run with: node scripts/test-sync.js
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

async function testSync() {
  console.log('🔍 Testing Strava sync data in Firebase...\n');

  try {
    // Test 1: Check overall stats
    console.log('📊 Test 1: Checking overall stats...');
    const overallDoc = await db.collection('stats').doc('overall').get();
    
    if (overallDoc.exists) {
      const data = overallDoc.data();
      console.log('✅ Overall stats found!');
      console.log('   Teams:', data.teams?.length || 0);
      console.log('   Last updated:', data.lastUpdated?.toDate?.() || 'N/A');
      
      if (data.teams && data.teams.length > 0) {
        console.log('\n   Team details:');
        data.teams.forEach((team, index) => {
          console.log(`   ${index + 1}. ${team.name}:`);
          console.log(`      - Members: ${team.members || 0}`);
          console.log(`      - Hours: ${team.totalHours || 0}`);
          console.log(`      - Activities: ${team.totalActivities || 0}`);
        });
      }
    } else {
      console.log('⚠️  Overall stats NOT found');
    }

    // Test 2: Check weekly stats
    console.log('\n📅 Test 2: Checking weekly stats...');
    const statsSnapshot = await db.collection('stats').get();
    
    const weekDocs = [];
    statsSnapshot.forEach((doc) => {
      if (doc.id.startsWith('week-')) {
        weekDocs.push({ id: doc.id, data: doc.data() });
      }
    });

    if (weekDocs.length > 0) {
      console.log(`✅ Found ${weekDocs.length} weekly stat documents`);
      
      // Show the most recent week
      weekDocs.sort((a, b) => b.id.localeCompare(a.id));
      const latestWeek = weekDocs[0];
      
      console.log(`\n   Latest week: ${latestWeek.id}`);
      console.log(`   Week number: ${latestWeek.data.week || 'N/A'}`);
      console.log(`   Week start: ${latestWeek.data.weekStart || 'N/A'}`);
      console.log(`   Week end: ${latestWeek.data.weekEnd || 'N/A'}`);
      console.log(`   Last updated: ${latestWeek.data.lastUpdated?.toDate?.() || 'N/A'}`);
      
      if (latestWeek.data.teams && latestWeek.data.teams.length > 0) {
        console.log('\n   Team details for this week:');
        latestWeek.data.teams.forEach((team, index) => {
          console.log(`   ${index + 1}. ${team.teamName}:`);
          console.log(`      - Members: ${team.members || 0}`);
          console.log(`      - Hours: ${team.hours || 0}`);
          console.log(`      - Activities: ${team.activities || 0}`);
          console.log(`      - Points: ${team.points || 0}`);
        });
      }
      
      console.log('\n   All weeks found:');
      weekDocs.forEach((doc) => {
        console.log(`   - ${doc.id} (Week ${doc.data.week || '?'})`);
      });
    } else {
      console.log('⚠️  No weekly stats found');
    }

    // Test 3: Check current week calculation
    console.log('\n🗓️  Test 3: Current week calculation...');
    const CHALLENGE_START_DATE = new Date('2025-11-03T00:00:00Z');
    const today = new Date();
    let currentWeekStart = new Date(CHALLENGE_START_DATE);
    
    while (currentWeekStart <= today) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      if (today >= currentWeekStart && today <= weekEnd) {
        const weekId = `${currentWeekStart.getFullYear()}-${String(currentWeekStart.getMonth() + 1).padStart(2, '0')}-${String(currentWeekStart.getDate()).padStart(2, '0')}`;
        console.log(`   Current week ID should be: week-${weekId}`);
        console.log(`   Week starts: ${currentWeekStart.toISOString()}`);
        console.log(`   Week ends: ${weekEnd.toISOString()}`);
        
        const currentWeekDoc = await db.collection('stats').doc(`week-${weekId}`).get();
        if (currentWeekDoc.exists) {
          console.log('   ✅ Current week data EXISTS in Firebase');
        } else {
          console.log('   ⚠️  Current week data NOT FOUND in Firebase');
          console.log('   💡 You need to run the sync to populate this week\'s data');
        }
        break;
      }
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    console.log('\n✅ Test completed!\n');

  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

testSync();

