// scripts/sync-local.js
// Node.js script for automatic local Strava sync

const SYNC_URL = process.env.SYNC_URL || 'http://localhost:3000/api/sync';
const SYNC_TOKEN = process.env.SYNC_SECRET_TOKEN || 'your-secret-token-change-this-123';
const INTERVAL_MINUTES = parseInt(process.env.SYNC_INTERVAL_MINUTES) || 5;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

async function triggerSync() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Triggering sync...`);
  
  try {
    const response = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SYNC_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`[${timestamp}] ✓ Sync successful!`);
      console.log(`  Message: ${data.message}`);
      console.log(`  Timestamp: ${data.timestamp}`);
    } else {
      console.error(`[${timestamp}] ✗ Sync failed!`);
      console.error(`  Status: ${response.status} ${response.statusText}`);
      console.error(`  Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`[${timestamp}] ✗ Error occurred!`);
    console.error(`  Message: ${error.message}`);
  }
  
  console.log('');
}

// Banner
console.log('');
console.log('═══════════════════════════════════════════════════');
console.log('  Nutrend Challenge - Local Sync Tool (Node.js)');
console.log('═══════════════════════════════════════════════════');
console.log('');
console.log(`Mode: Automatic (every ${INTERVAL_MINUTES} minutes)`);
console.log(`URL: ${SYNC_URL}`);
console.log('Press Ctrl+C to stop');
console.log('');

// First sync immediately
triggerSync();

// Then repeat every N minutes
setInterval(triggerSync, INTERVAL_MS);