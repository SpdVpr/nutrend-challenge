#!/usr/bin/env node

/**
 * Helper script to extract Firebase Service Account credentials
 * for use in .env.local file
 * 
 * Usage:
 * 1. Download service account JSON from Firebase Console
 * 2. Run: node scripts/extract-service-account.js path/to/service-account.json
 * 3. Copy the output to your .env.local file
 */

const fs = require('fs');
const path = require('path');

// Get the JSON file path from command line argument
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('❌ Error: Please provide the path to your service account JSON file');
  console.log('\nUsage:');
  console.log('  node scripts/extract-service-account.js path/to/service-account.json');
  console.log('\nExample:');
  console.log('  node scripts/extract-service-account.js ~/Downloads/nutrend-challenge-firebase-adminsdk.json');
  process.exit(1);
}

// Resolve the full path
const fullPath = path.resolve(jsonFilePath);

// Check if file exists
if (!fs.existsSync(fullPath)) {
  console.error(`❌ Error: File not found: ${fullPath}`);
  process.exit(1);
}

try {
  // Read and parse the JSON file
  const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

  // Extract required fields
  const clientEmail = serviceAccount.client_email;
  const privateKey = serviceAccount.private_key;
  const projectId = serviceAccount.project_id;

  if (!clientEmail || !privateKey || !projectId) {
    console.error('❌ Error: Invalid service account JSON file');
    console.error('   Make sure you downloaded the correct file from Firebase Console');
    process.exit(1);
  }

  console.log('\n✅ Service Account credentials extracted successfully!\n');
  console.log('📋 Copy these lines to your .env.local file:\n');
  console.log('─'.repeat(80));
  console.log(`FIREBASE_CLIENT_EMAIL=${clientEmail}`);
  // Escape the private key for .env file (replace newlines with \n)
  const escapedPrivateKey = privateKey.replace(/\n/g, '\\n');
  console.log(`FIREBASE_PRIVATE_KEY="${escapedPrivateKey}"`);
  console.log('─'.repeat(80));
  console.log('\n⚠️  IMPORTANT: Keep these credentials secret! Never commit them to Git.\n');
  console.log(`Project ID: ${projectId}`);
  console.log(`Make sure NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local matches: ${projectId}\n`);

} catch (error) {
  console.error('❌ Error reading or parsing JSON file:', error.message);
  process.exit(1);
}