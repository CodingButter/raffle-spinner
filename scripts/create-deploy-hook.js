#!/usr/bin/env node

/**
 * Create Vercel Deploy Hook
 *
 * This script creates a deploy hook for your Vercel project
 */

const { execSync } = require('child_process');
const https = require('https');

const PROJECT_ID = 'prj_REvWjwDl5e0h67CimJLOJuxgdVr3';
const TEAM_ID = 'team_CvKS3H5YdYlivHBECdrVmnKt';

async function getVercelToken() {
  try {
    // Try to get token from Vercel CLI config
    const authPath = `${process.env.HOME}/.local/share/com.vercel.cli/auth.json`;
    const fs = require('fs');

    if (fs.existsSync(authPath)) {
      const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
      return auth.token;
    }

    // Alternative: Get from environment
    if (process.env.VERCEL_TOKEN) {
      return process.env.VERCEL_TOKEN;
    }

    // Try to get it via CLI
    console.log('Please authenticate with Vercel first:');
    console.log('Run: vercel login');
    process.exit(1);
  } catch (error) {
    console.error('Could not get Vercel token:', error.message);
    return null;
  }
}

async function createDeployHook(token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: 'Directus Auto Deploy',
      ref: 'main',
    });

    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/deploy-hooks?teamId=${TEAM_ID}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const result = JSON.parse(responseData);
          resolve(result);
        } else {
          reject(new Error(`API returned ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log('🚀 Creating Vercel Deploy Hook...\n');
    console.log('Project ID:', PROJECT_ID);
    console.log('Team ID:', TEAM_ID);
    console.log('');

    // Get token
    const token = await getVercelToken();
    if (!token) {
      console.error('❌ Could not get Vercel token');
      console.log('\nPlease run: vercel login');
      process.exit(1);
    }

    console.log('✅ Got authentication token\n');

    // Create deploy hook
    console.log('📝 Creating deploy hook...');
    const result = await createDeployHook(token);

    console.log('\n✅ Deploy hook created successfully!\n');
    console.log('🔗 Deploy Hook URL:');
    console.log(`   ${result.url}\n`);

    console.log('📋 Hook Details:');
    console.log(`   Name: ${result.name}`);
    console.log(`   ID: ${result.id}`);
    console.log(`   Branch: ${result.ref}`);
    console.log(`   Created: ${result.createdAt}`);
    console.log('');

    // Save to file
    const fs = require('fs');
    const envContent = `\n# Vercel Deploy Hook (Created: ${new Date().toISOString()})\nVERCEL_DEPLOY_HOOK=${result.url}\n`;

    fs.appendFileSync('.env.local', envContent);
    console.log('💾 Saved to .env.local\n');

    // Update scripts
    console.log('📝 To use this deploy hook:\n');
    console.log('1. Manual deploy:');
    console.log(`   curl -X POST "${result.url}"\n`);

    console.log('2. With the script:');
    console.log(`   VERCEL_DEPLOY_HOOK="${result.url}" node scripts/trigger-deploy.js deploy\n`);

    console.log('3. Set as environment variable:');
    console.log(`   export VERCEL_DEPLOY_HOOK="${result.url}"\n`);

    // Test it
    console.log('🧪 Testing the deploy hook...');
    const testReq = https.request(result.url, { method: 'POST' }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Test deployment triggered successfully!');
        console.log(
          '🔗 Check deployment at: https://vercel.com/codingbutters-projects/drawday.app'
        );
      } else {
        console.log('⚠️  Test returned status:', res.statusCode);
      }
    });
    testReq.end();
  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('401')) {
      console.log('\n🔑 Authentication failed. Please run: vercel login');
    } else if (error.message.includes('404')) {
      console.log('\n❓ Project not found. Make sure you have access to the project.');
    }

    process.exit(1);
  }
}

// Run the script
main();
