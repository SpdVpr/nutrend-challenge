/**
 * Debug script to check what Strava API returns
 * Run with environment variables set
 */

const TEAMS = [
  { id: 'spajkk', name: 'Team spajKK', stravaClubId: 1469610 },
  { id: 'andullie', name: 'Team Andullie', stravaClubId: 1469617 },
];

const CHALLENGE_START_DATE = new Date('2025-11-03T00:00:00Z');

async function getAccessToken() {
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Strava credentials not configured');
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Strava token');
  }

  const data = await response.json();
  return data.access_token;
}

async function debugStravaAPI() {
  console.log('🔍 Debugging Strava API...\n');

  try {
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained\n');

    // Test first team only
    const team = TEAMS[0];
    console.log(`📊 Testing ${team.name} (Club ID: ${team.stravaClubId})\n`);

    // Get activities for current week
    const weekStart = CHALLENGE_START_DATE;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    console.log(`📅 Week 1: ${weekStart.toISOString()} - ${weekEnd.toISOString()}\n`);

    const afterTimestamp = Math.floor(weekStart.getTime() / 1000);
    const url = `https://www.strava.com/api/v3/clubs/${team.stravaClubId}/activities?page=1&per_page=200&after=${afterTimestamp}`;

    console.log(`🌐 API URL: ${url}\n`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return;
    }

    const activities = await response.json();
    console.log(`✅ Received ${activities.length} activities\n`);

    if (activities.length === 0) {
      console.log('⚠️  No activities found for this week!');
      console.log('   This could mean:');
      console.log('   1. No activities were logged in this club for this week');
      console.log('   2. The club is private and activities are not visible');
      console.log('   3. The date range is incorrect\n');
      return;
    }

    // Show first activity in full to see structure
    console.log('📋 First activity (full structure):\n');
    console.log(JSON.stringify(activities[0], null, 2));
    console.log('\n');

    // Show first 5 activities
    console.log('📋 First 5 activities summary:\n');
    activities.slice(0, 5).forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.name}`);
      console.log(`   Type: ${activity.type}`);
      console.log(`   Available date fields:`, Object.keys(activity).filter(k => k.includes('date') || k.includes('time')));
      console.log('');
    });

    // Filter activities for Week 1
    const allowedTypes = ['Run', 'Walk', 'Hike', 'Workout'];
    const weekActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.start_date);
      return (
        activityDate >= weekStart &&
        activityDate <= weekEnd &&
        allowedTypes.includes(activity.type)
      );
    });

    console.log(`\n📊 Week 1 Summary:`);
    console.log(`   Total activities in week: ${weekActivities.length}`);
    
    if (weekActivities.length > 0) {
      const totalSeconds = weekActivities.reduce((sum, a) => sum + a.moving_time, 0);
      const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
      console.log(`   Total hours: ${totalHours}`);
      
      console.log(`\n   Activities by type:`);
      const byType = {};
      weekActivities.forEach((a) => {
        byType[a.type] = (byType[a.type] || 0) + 1;
      });
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
    } else {
      console.log('   ⚠️  No activities found in Week 1 date range');
    }

    // Check if there are activities BEFORE the challenge start
    const beforeStart = activities.filter((activity) => {
      const activityDate = new Date(activity.start_date);
      return activityDate < weekStart;
    });

    if (beforeStart.length > 0) {
      console.log(`\n⚠️  Found ${beforeStart.length} activities BEFORE challenge start date`);
      console.log(`   Oldest: ${new Date(beforeStart[beforeStart.length - 1].start_date).toISOString()}`);
      console.log(`   Newest: ${new Date(beforeStart[0].start_date).toISOString()}`);
    }

    // Check if there are activities AFTER the week end
    const afterEnd = activities.filter((activity) => {
      const activityDate = new Date(activity.start_date);
      return activityDate > weekEnd;
    });

    if (afterEnd.length > 0) {
      console.log(`\n✅ Found ${afterEnd.length} activities AFTER Week 1 end date`);
      console.log(`   (This is normal if we're past Week 1)`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugStravaAPI();

