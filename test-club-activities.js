// Test script to check what Strava /clubs/{id}/activities returns
const fetch = require('node-fetch');

async function getAccessToken() {
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function testClubActivities() {
  try {
    console.log('🔑 Getting access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained\n');

    // Test with Team Andullie (Club ID: 1469617)
    const clubId = 1469617;
    console.log(`📊 Fetching activities for club ${clubId}...\n`);

    const url = `https://www.strava.com/api/v3/clubs/${clubId}/activities?per_page=5`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.error('❌ Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Response:', errorText);
      return;
    }

    const activities = await response.json();
    console.log(`✅ Received ${activities.length} activities\n`);
    
    if (activities.length > 0) {
      console.log('📋 First activity structure:');
      console.log(JSON.stringify(activities[0], null, 2));
      
      console.log('\n🎯 Athlete info in first activity:');
      console.log(JSON.stringify(activities[0].athlete, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testClubActivities();