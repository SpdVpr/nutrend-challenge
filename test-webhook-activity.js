const https = require('https');

const activityId = process.argv[2];

if (!activityId) {
  console.error('Usage: node test-webhook-activity.js <activity_id>');
  process.exit(1);
}

console.log(`Testing webhook with activity ID: ${activityId}\n`);

const data = JSON.stringify({
  athleteId: 89686803,
  activityId: parseInt(activityId)
});

const options = {
  hostname: 'nutrend-challenge.vercel.app',
  path: '/api/test-webhook',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-secret-token-change-this-123',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  
  let response = '';
  res.on('data', (chunk) => { response += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(response);
      console.log('\nResponse:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Raw:', response);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();
