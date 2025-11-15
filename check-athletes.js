const https = require('https');

const options = {
  hostname: 'nutrend-challenge.vercel.app',
  path: '/api/debug-firebase',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-secret-token-change-this-123'
  }
};

https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Connected Athletes Count:', json.athletes ? json.athletes.length : 0);
      if (json.athletes) {
        console.log('\nAthletes:');
        json.athletes.forEach((a, i) => {
          console.log(`${i + 1}. ${a.firstname} ${a.lastname} (ID: ${a.athleteId})`);
        });
      }
    } catch (e) {
      console.log('Raw:', data);
    }
  });
}).end();
