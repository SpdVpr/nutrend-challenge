const https = require('https');

console.log('Checking athlete data...\n');

https.get('https://nutrend-challenge.vercel.app/api/athlete/89686803', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Athlete:', json.athlete.firstname, json.athlete.lastname);
      console.log('Team:', json.athlete.teamId);
      console.log('Total Activities:', json.stats.totalActivities);
      console.log('Total Hours:', json.stats.totalHours);
      console.log('\nRecent Activities:');
      if (json.recentActivities.length === 0) {
        console.log('  No activities found!');
      } else {
        json.recentActivities.forEach(a => {
          console.log(`  - ${a.name} (${a.type}) - ${new Date(a.startDate).toLocaleString()}`);
        });
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
