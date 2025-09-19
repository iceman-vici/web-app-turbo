#!/usr/bin/env node

/**
 * Helper script to base64 encode Google Service Account JSON
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log('Usage: node generate-service-account.js <path-to-service-account.json>');
  process.exit(1);
}

const filePath = path.resolve(args[0]);

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Validate JSON
  const parsed = JSON.parse(fileContent);
  
  if (!parsed.type || !parsed.project_id || !parsed.private_key) {
    console.error('Invalid service account JSON format');
    process.exit(1);
  }
  
  // Base64 encode
  const encoded = Buffer.from(fileContent).toString('base64');
  
  console.log('\n✅ Service account successfully encoded!');
  console.log('\nAdd this to your backend/.env file:');
  console.log('\nGOOGLE_SERVICE_ACCOUNT=' + encoded);
  console.log('\n⚠️  Keep this value secret and never commit it to version control!');
  
} catch (error) {
  console.error('Error processing file:', error.message);
  process.exit(1);
}