#!/usr/bin/env node

/**
 * Seed test data for DrawDay Backend
 * This script adds sample users, subscriptions, and content
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'drawday';

let accessToken = null;
let adminUserId = null;

// Authenticate with Directus
async function authenticate() {
  try {
    const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    accessToken = response.data.data.access_token;
    console.log('✅ Authenticated with Directus');
    
    // Get admin user ID
    const userResponse = await axios.get(`${DIRECTUS_URL}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    adminUserId = userResponse.data.data.id;
    
    return accessToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Create test users
async function createTestUsers() {
  console.log('\n👥 Creating test users...');
  
  const testUsers = [
    {
      email: 'free@drawday.app',
      password: 'freeuser123',
      first_name: 'Free',
      last_name: 'User',
      role: null, // Will use default role
      description: 'Test free tier user',
    },
    {
      email: 'pro@drawday.app',
      password: 'prouser123',
      first_name: 'Pro',
      last_name: 'User',
      role: null,
      description: 'Test pro tier user',
    },
    {
      email: 'trial@drawday.app',
      password: 'trialuser123',
      first_name: 'Trial',
      last_name: 'User',
      role: null,
      description: 'Test trial user',
    },
  ];

  const createdUsers = [];

  for (const user of testUsers) {
    try {
      const response = await axios.post(
        `${DIRECTUS_URL}/users`,
        user,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      createdUsers.push(response.data.data);
      console.log(`  ✅ Created user: ${user.email}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
        // User already exists, fetch their ID
        try {
          const existingUser = await axios.get(
            `${DIRECTUS_URL}/users?filter[email][_eq]=${user.email}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (existingUser.data.data.length > 0) {
            createdUsers.push(existingUser.data.data[0]);
            console.log(`  ⚠️  User already exists: ${user.email}`);
          }
        } catch (fetchError) {
          console.error(`  ❌ Failed to fetch existing user ${user.email}:`, fetchError.response?.data || fetchError.message);
        }
      } else {
        console.error(`  ❌ Failed to create user ${user.email}:`, error.response?.data || error.message);
      }
    }
  }

  return createdUsers;
}

// Create subscriptions
async function createSubscriptions(users) {
  console.log('\n💳 Creating subscriptions...');

  const now = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  // Find user IDs
  const freeUser = users.find(u => u.email === 'free@drawday.app');
  const proUser = users.find(u => u.email === 'pro@drawday.app');
  const trialUser = users.find(u => u.email === 'trial@drawday.app');

  const subscriptions = [
    // Admin user - has all products active
    {
      user: adminUserId,
      product: 'spinner',
      status: 'active',
      starts_at: now.toISOString(),
      ends_at: oneYearFromNow.toISOString(),
    },
    {
      user: adminUserId,
      product: 'streaming',
      status: 'active',
      starts_at: now.toISOString(),
      ends_at: oneYearFromNow.toISOString(),
    },
    {
      user: adminUserId,
      product: 'websites',
      status: 'active',
      starts_at: now.toISOString(),
      ends_at: oneYearFromNow.toISOString(),
    },
  ];

  // Pro user - has spinner active
  if (proUser) {
    subscriptions.push({
      user: proUser.id,
      product: 'spinner',
      status: 'active',
      starts_at: now.toISOString(),
      ends_at: oneMonthFromNow.toISOString(),
    });
  }

  // Trial user - has spinner trial
  if (trialUser) {
    subscriptions.push({
      user: trialUser.id,
      product: 'spinner',
      status: 'trial',
      starts_at: now.toISOString(),
      ends_at: oneWeekFromNow.toISOString(),
    });
  }

  // Free user - no active subscriptions, but one expired
  if (freeUser) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    subscriptions.push({
      user: freeUser.id,
      product: 'spinner',
      status: 'expired',
      starts_at: oneMonthAgo.toISOString(),
      ends_at: yesterday.toISOString(),
    });
  }

  // Create subscriptions
  for (const subscription of subscriptions) {
    try {
      await axios.post(
        `${DIRECTUS_URL}/items/subscriptions`,
        subscription,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const userEmail = subscription.user === adminUserId ? ADMIN_EMAIL : 
                       users.find(u => u.id === subscription.user)?.email || 'Unknown';
      console.log(`  ✅ Created subscription: ${userEmail} - ${subscription.product} (${subscription.status})`);
    } catch (error) {
      console.error(`  ❌ Failed to create subscription:`, error.response?.data || error.message);
    }
  }
}

// Create Terms of Service
async function createTermsOfService() {
  console.log('\n📜 Creating Terms of Service...');

  const tos = {
    version: '1.0.0',
    status: 'active',
    effective_date: new Date().toISOString(),
    content: `
      <h1>DrawDay Terms of Service</h1>
      <p><strong>Effective Date: ${new Date().toLocaleDateString()}</strong></p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using DrawDay Spinner ("Service"), you agree to be bound by these Terms of Service.</p>
      
      <h2>2. Description of Service</h2>
      <p>DrawDay Spinner is a Chrome extension designed for conducting fair and transparent live draws for UK competitions.</p>
      
      <h2>3. User Accounts</h2>
      <ul>
        <li>You must create an account to use the Service</li>
        <li>You are responsible for maintaining the security of your account</li>
        <li>You must provide accurate and complete information</li>
      </ul>
      
      <h2>4. Subscription Plans</h2>
      <h3>Free Plan</h3>
      <ul>
        <li>Basic spinner functionality</li>
        <li>Limited to standard features</li>
        <li>No customization options</li>
      </ul>
      
      <h3>Pro Plan</h3>
      <ul>
        <li>Full spinner functionality</li>
        <li>Custom branding and themes</li>
        <li>Priority support</li>
        <li>Advanced features</li>
      </ul>
      
      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any illegal purposes</li>
        <li>Violate any applicable laws or regulations</li>
        <li>Interfere with or disrupt the Service</li>
        <li>Attempt to gain unauthorized access</li>
      </ul>
      
      <h2>6. Privacy</h2>
      <p>Your use of the Service is also governed by our Privacy Policy.</p>
      
      <h2>7. Limitation of Liability</h2>
      <p>DrawDay shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
      
      <h2>8. Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.</p>
      
      <h2>9. Contact Information</h2>
      <p>For questions about these Terms, please contact us at legal@drawday.app</p>
    `,
  };

  try {
    await axios.post(
      `${DIRECTUS_URL}/items/terms_of_service`,
      tos,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`  ✅ Created Terms of Service v${tos.version}`);
  } catch (error) {
    console.error(`  ❌ Failed to create Terms of Service:`, error.response?.data || error.message);
  }
}

// Create Privacy Policy
async function createPrivacyPolicy() {
  console.log('\n🔒 Creating Privacy Policy...');

  const privacy = {
    version: '1.0.0',
    status: 'active',
    effective_date: new Date().toISOString(),
    content: `
      <h1>DrawDay Privacy Policy</h1>
      <p><strong>Last Updated: ${new Date().toLocaleDateString()}</strong></p>
      
      <h2>1. Information We Collect</h2>
      <h3>Account Information</h3>
      <ul>
        <li>Email address</li>
        <li>Name</li>
        <li>Account preferences</li>
      </ul>
      
      <h3>Usage Data</h3>
      <ul>
        <li>Feature usage statistics</li>
        <li>Performance metrics</li>
        <li>Error reports</li>
      </ul>
      
      <h3>Competition Data</h3>
      <ul>
        <li>Competition names and settings</li>
        <li>Participant information (stored locally)</li>
        <li>Draw results</li>
      </ul>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use the collected information to:</p>
      <ul>
        <li>Provide and maintain the Service</li>
        <li>Process subscriptions and payments</li>
        <li>Send important service updates</li>
        <li>Improve our Service</li>
        <li>Provide customer support</li>
      </ul>
      
      <h2>3. Data Storage</h2>
      <ul>
        <li>Competition data is stored locally in your browser</li>
        <li>Account data is stored on secure servers</li>
        <li>We use industry-standard encryption</li>
      </ul>
      
      <h2>4. Data Sharing</h2>
      <p>We do not sell, trade, or rent your personal information. We may share data with:</p>
      <ul>
        <li>Payment processors for subscription management</li>
        <li>Analytics services for usage insights</li>
        <li>Legal authorities when required by law</li>
      </ul>
      
      <h2>5. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Request data deletion</li>
        <li>Export your data</li>
        <li>Opt-out of marketing communications</li>
      </ul>
      
      <h2>6. Cookies</h2>
      <p>We use essential cookies for:</p>
      <ul>
        <li>Authentication</li>
        <li>Session management</li>
        <li>User preferences</li>
      </ul>
      
      <h2>7. Security</h2>
      <p>We implement appropriate technical and organizational measures to protect your data.</p>
      
      <h2>8. Children's Privacy</h2>
      <p>Our Service is not intended for children under 13 years of age.</p>
      
      <h2>9. Changes to This Policy</h2>
      <p>We may update this policy from time to time. We will notify you of any changes.</p>
      
      <h2>10. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, contact us at:</p>
      <p>Email: privacy@drawday.app</p>
    `,
  };

  try {
    await axios.post(
      `${DIRECTUS_URL}/items/privacy_policy`,
      privacy,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`  ✅ Created Privacy Policy v${privacy.version}`);
  } catch (error) {
    console.error(`  ❌ Failed to create Privacy Policy:`, error.response?.data || error.message);
  }
}

// Create sample contact submission
async function createContactSubmission() {
  console.log('\n📧 Creating sample contact submission...');

  const contact = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    subject: 'Question about Pro features',
    message: 'Hi, I would like to know more about the Pro plan features. Specifically, what customization options are available? Thanks!',
    status: 'new',
  };

  try {
    await axios.post(
      `${DIRECTUS_URL}/items/contact_submissions`,
      contact,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`  ✅ Created sample contact submission`);
  } catch (error) {
    console.error(`  ❌ Failed to create contact submission:`, error.response?.data || error.message);
  }
}

// Main function
async function seedData() {
  console.log('🌱 Starting data seeding...\n');
  
  await authenticate();
  
  const users = await createTestUsers();
  await createSubscriptions(users);
  await createTermsOfService();
  await createPrivacyPolicy();
  await createContactSubmission();
  
  console.log('\n✅ Data seeding completed!');
  console.log('\n📝 Test User Credentials:');
  console.log('  Admin: admin@drawday.app / drawday (All products active)');
  console.log('  Pro User: pro@drawday.app / prouser123 (Spinner active)');
  console.log('  Trial User: trial@drawday.app / trialuser123 (Spinner trial)');
  console.log('  Free User: free@drawday.app / freeuser123 (No active subscriptions)');
  console.log('\n📍 Access Directus at: http://localhost:8055');
}

// Run the seeding
seedData().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});