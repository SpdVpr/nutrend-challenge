// Debug script to test sync
const https = require('https');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/sync',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-secret-token-change-this-123',
    'Content-Type': 'application/json'
  }
};

console.log('Starting sync request...');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();