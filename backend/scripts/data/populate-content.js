#!/usr/bin/env node

/**
 * Populate singleton collections with actual website content
 * This preserves all existing content from the website
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'drawday';

let accessToken = null;

// Authenticate with Directus
async function authenticate() {
  try {
    const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    accessToken = response.data.data.access_token;
    console.log('✅ Authenticated with Directus');
    return accessToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Update or create singleton content
async function upsertSingletonContent(collection, content) {
  try {
    // For singletons, we need to check if content exists first
    const existing = await axios.get(
      `${DIRECTUS_URL}/items/${collection}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (existing.data.data) {
      // Update existing
      await axios.patch(
        `${DIRECTUS_URL}/items/${collection}`,
        content,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`  ✅ Updated content for ${collection}`);
    } else {
      // Create new
      await axios.post(
        `${DIRECTUS_URL}/items/${collection}`,
        content,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`  ✅ Created content for ${collection}`);
    }
  } catch (error) {
    // If error, try to create
    try {
      await axios.post(
        `${DIRECTUS_URL}/items/${collection}`,
        { id: 1, ...content },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`  ✅ Created content for ${collection}`);
    } catch (createError) {
      console.error(`  ❌ Failed to upsert content for ${collection}:`, createError.response?.data || createError.message);
    }
  }
}

async function populateContent() {
  await authenticate();

  console.log('\n📝 Populating singleton collections with actual content...\n');

  // Homepage content - from DrawDayHomePage component
  console.log('🏠 Updating Homepage...');
  await upsertSingletonContent('homepage', {
    hero_title: 'DrawDay Solutions',
    hero_subtitle: 'The complete technology partner for UK raffle companies. From live draw software to streaming production and custom websites.',
    hero_cta_text: 'Explore Our Solutions',
    hero_cta_link: '#services',
    features_title: 'Complete Solutions for Modern Raffles',
    features_subtitle: 'Everything you need to run professional, compliant, and engaging prize draws',
    features_list: [
      {
        icon: 'sparkles',
        title: 'DrawDay Spinner',
        description: 'Professional live draw software with stunning animations, handling 5000+ entries at 60fps. Chrome extension for seamless integration.'
      },
      {
        icon: 'zap',
        title: 'Streaming Production',
        description: 'Professional streaming overlays, graphics, and production tools. Make your live draws look broadcast-quality on any platform.'
      },
      {
        icon: 'shield',
        title: 'Custom Websites',
        description: 'Bespoke competition websites built for conversion. Fast, secure, and optimized for selling tickets and building trust.'
      },
      {
        icon: 'trophy',
        title: 'UK Compliant',
        description: 'Built for Gambling Commission requirements. Transparent, fair, and auditable draw systems.'
      }
    ],
    cta_title: 'Ready to Transform Your Live Draws?',
    cta_description: 'Join the UK\'s leading raffle companies using DrawDay Solutions',
    cta_button_text: 'Get Started Today',
    cta_button_link: '/contact',
    seo_title: 'DrawDay Solutions - Technology Partner for UK Raffle Companies',
    seo_description: 'Complete technology solutions for UK raffle companies. Live draw software, streaming production, and custom websites. Trusted by companies giving away £10M+ in prizes.',
  });

  // Features page content
  console.log('✨ Updating Features Page...');
  await upsertSingletonContent('features_page', {
    page_title: 'Features',
    page_subtitle: 'Everything you need for professional live draws',
    features: [
      {
        category: 'Core Features',
        title: 'Professional Slot Machine Spinner',
        description: 'Cinema-quality animations with physics-based motion that captivates audiences. Smooth 60fps animations with customizable spin duration.',
        is_pro: false,
      },
      {
        category: 'Core Features',
        title: 'Smart CSV Import',
        description: 'Import participant data in seconds with intelligent column mapping. Auto-detects headers and handles 5000+ entries.',
        is_pro: false,
      },
      {
        category: 'Core Features',
        title: 'Competition Management',
        description: 'Organize multiple competitions and track winners across sessions. Export winner reports and quick competition switching.',
        is_pro: false,
      },
      {
        category: 'Customization',
        title: 'Custom Branding',
        description: 'Match your business identity with full customization options. Upload logo, custom colors, font selection.',
        is_pro: true,
      },
      {
        category: 'Customization',
        title: 'Theme Designer',
        description: 'Create unlimited custom themes for your brand. Save and switch between different looks for various events.',
        is_pro: true,
      },
      {
        category: 'Performance',
        title: 'Lightning Performance',
        description: 'Optimized for speed with intelligent rendering. Subset swapping algorithm handles large datasets instantly.',
        is_pro: false,
      },
      {
        category: 'Privacy',
        title: '100% Privacy Focused',
        description: 'All data stays local in your browser - no external servers. GDPR compliant with zero data collection.',
        is_pro: false,
      },
      {
        category: 'Advanced',
        title: 'Session Recording',
        description: 'Record your entire draw session for compliance and transparency. Export recordings for audit purposes.',
        is_pro: true,
      },
      {
        category: 'Advanced',
        title: 'Multi-Draw Support',
        description: 'Run multiple draws in sequence with different prize tiers. Perfect for complex competition structures.',
        is_pro: true,
      },
    ],
    pricing_section_title: 'Choose Your Plan',
    pricing_plans: [
      {
        name: 'Free',
        price: '£0',
        period: 'forever',
        features: [
          'Up to 100 participants',
          'Basic spinner animations',
          'CSV import',
          'Session tracking',
          'Local data storage'
        ],
        cta_text: 'Get Started',
        is_popular: false,
      },
      {
        name: 'Pro',
        price: '£29',
        period: 'per month',
        features: [
          'Unlimited participants',
          'Custom branding & themes',
          'Priority support',
          'Advanced animations',
          'Session recording',
          'Multi-draw support',
          'Export analytics'
        ],
        cta_text: 'Start 14-Day Trial',
        is_popular: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'contact us',
        features: [
          'Everything in Pro',
          'Custom integrations',
          'Dedicated support',
          'On-premise option',
          'Custom features',
          'SLA guarantee',
          'Training included'
        ],
        cta_text: 'Contact Sales',
        is_popular: false,
      },
    ],
    seo_title: 'Features - DrawDay Spinner | Professional Live Draw Software',
    seo_description: 'Explore all features of DrawDay Spinner. Smart CSV import, custom branding, beautiful animations, and more. Perfect for UK competition hosts.',
  });

  // Demo page content
  console.log('🎮 Updating Demo Page...');
  await upsertSingletonContent('demo_page', {
    page_title: 'Try DrawDay Spinner',
    page_subtitle: 'Experience the power of professional live draws',
    demo_instructions: `
      <h3>How to Use the Demo</h3>
      <ol>
        <li><strong>Select a Competition:</strong> Choose from our pre-loaded sample competitions or create your own.</li>
        <li><strong>Enter a Ticket Number:</strong> Type any ticket number from the participant list.</li>
        <li><strong>Click Spin:</strong> Watch the smooth slot machine animation in action.</li>
        <li><strong>See the Winner:</strong> Experience the winner reveal with celebration effects.</li>
      </ol>
      <p class="mt-4"><em>This demo uses sample data to demonstrate the spinner functionality. In the full version, you can import your own participant data via CSV.</em></p>
    `,
    sample_data_title: 'Sample Competition Data',
    sample_data_description: 'This demo includes 50 sample participants from a typical UK house competition draw. Try ticket numbers like "001", "025", or "050" to see different winners.',
    video_url: 'https://www.youtube.com/embed/demo-video-id',
    testimonials: [
      {
        author: 'Sarah Johnson',
        company: 'Elite Competitions UK',
        content: 'DrawDay Spinner has transformed our live draws. The professional animations and smooth performance give our viewers confidence in the fairness of our draws. Our engagement has increased by 300%!',
        rating: 5,
      },
      {
        author: 'Mike Thompson',
        company: 'Dream Car Giveaways',
        content: 'We\'ve tried multiple solutions, but DrawDay is by far the best. The CSV import saves us hours, and the custom branding makes our draws look incredibly professional.',
        rating: 5,
      },
      {
        author: 'Emma Williams',
        company: 'Prestige Prize Draws',
        content: 'The attention to detail is outstanding. From the physics-based animations to the winner celebration effects, everything feels premium. Our customers love it!',
        rating: 5,
      },
      {
        author: 'James Roberts',
        company: 'UK Competition Co',
        content: 'As someone giving away £1M+ in prizes annually, transparency is crucial. DrawDay\'s pre-calculated results and session recording give us complete audit trails.',
        rating: 5,
      },
    ],
    seo_title: 'Demo - Try DrawDay Spinner | Live Draw Software Demo',
    seo_description: 'Try DrawDay Spinner with our interactive demo. See how easy it is to run professional live draws for your UK competition business.',
  });

  // Site settings
  console.log('⚙️ Updating Site Settings...');
  await upsertSingletonContent('site_settings', {
    site_name: 'DrawDay Solutions',
    tagline: 'Professional Technology for UK Raffle Companies',
    logo_url: '/logo.svg',
    favicon_url: '/favicon.png',
    social_links: {
      twitter: 'https://twitter.com/drawdaysolutions',
      facebook: 'https://facebook.com/drawdaysolutions',
      linkedin: 'https://linkedin.com/company/drawday-solutions',
      youtube: 'https://youtube.com/@drawdaysolutions',
      instagram: 'https://instagram.com/drawdaysolutions'
    },
    analytics_id: '', // Add your GA4 ID when ready
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance to improve our services. We\'ll be back shortly!',
  });

  // Also populate the actual Terms of Service and Privacy Policy
  console.log('📜 Updating Terms of Service...');
  const tosContent = await upsertTermsOfService();
  
  console.log('🔒 Updating Privacy Policy...');
  const privacyContent = await upsertPrivacyPolicy();

  console.log('\n✅ All content has been populated successfully!');
  console.log('\n📝 Summary:');
  console.log('  - Homepage content updated with hero, features, and CTAs');
  console.log('  - Features page updated with comprehensive feature list and pricing');
  console.log('  - Demo page updated with instructions and testimonials');
  console.log('  - Site settings configured with branding and social links');
  console.log('  - Terms of Service and Privacy Policy updated');
  console.log('\n🎯 Next steps:');
  console.log('  1. Visit http://localhost:8055 to review and edit content');
  console.log('  2. Update frontend pages to fetch from Directus API');
  console.log('  3. Configure Vercel webhook for auto-deploy on content changes');
}

async function upsertTermsOfService() {
  try {
    // Check if there's already an active TOS
    const existing = await axios.get(
      `${DIRECTUS_URL}/items/terms_of_service?filter[status][_eq]=active`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (existing.data.data && existing.data.data.length > 0) {
      console.log('  ⚠️  Active Terms of Service already exists');
      return;
    }

    // Create new TOS
    await axios.post(
      `${DIRECTUS_URL}/items/terms_of_service`,
      {
        version: '2.0.0',
        status: 'active',
        effective_date: new Date().toISOString(),
        content: `
          <h1>DrawDay Solutions - Terms of Service</h1>
          <p><strong>Effective Date: ${new Date().toLocaleDateString()}</strong></p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using DrawDay Solutions products and services ("Services"), including DrawDay Spinner, streaming production tools, and custom website development, you agree to be bound by these Terms of Service.</p>
          
          <h2>2. Description of Services</h2>
          <h3>2.1 DrawDay Spinner</h3>
          <p>A Chrome extension designed for conducting fair and transparent live draws for UK competitions, featuring:</p>
          <ul>
            <li>Professional slot machine animations</li>
            <li>CSV data import and management</li>
            <li>Custom branding capabilities</li>
            <li>Local data processing</li>
          </ul>
          
          <h3>2.2 Streaming Production</h3>
          <p>Professional streaming overlays and graphics for live draw broadcasts.</p>
          
          <h3>2.3 Custom Websites</h3>
          <p>Bespoke competition website development and management services.</p>
          
          <h2>3. User Accounts</h2>
          <ul>
            <li>You must provide accurate and complete registration information</li>
            <li>You are responsible for maintaining account security</li>
            <li>You must notify us immediately of any unauthorized access</li>
            <li>One account per individual or organization</li>
          </ul>
          
          <h2>4. Subscription Plans</h2>
          <h3>4.1 Free Plan</h3>
          <ul>
            <li>Limited to 100 participants per draw</li>
            <li>Basic features only</li>
            <li>No custom branding</li>
            <li>Community support</li>
          </ul>
          
          <h3>4.2 Pro Plan (£29/month)</h3>
          <ul>
            <li>Unlimited participants</li>
            <li>Full customization options</li>
            <li>Priority support</li>
            <li>Advanced features</li>
            <li>14-day free trial available</li>
          </ul>
          
          <h3>4.3 Enterprise Plan</h3>
          <ul>
            <li>Custom pricing</li>
            <li>Dedicated support</li>
            <li>Custom integrations</li>
            <li>SLA guarantees</li>
          </ul>
          
          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal gambling operations</li>
            <li>Violate UK Gambling Commission regulations</li>
            <li>Manipulate or falsify draw results</li>
            <li>Reverse engineer or copy our software</li>
            <li>Resell or redistribute our services without permission</li>
          </ul>
          
          <h2>6. UK Gambling Compliance</h2>
          <p>Users are responsible for ensuring their use of our Services complies with all applicable UK gambling laws and regulations. DrawDay Solutions provides tools for transparent and fair draws but does not operate gambling services.</p>
          
          <h2>7. Data Protection</h2>
          <p>We are committed to protecting your data in accordance with GDPR. See our Privacy Policy for details.</p>
          
          <h2>8. Intellectual Property</h2>
          <p>All content, features, and functionality are owned by DrawDay Solutions and protected by international copyright, trademark, and other intellectual property laws.</p>
          
          <h2>9. Limitation of Liability</h2>
          <p>DrawDay Solutions shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.</p>
          
          <h2>10. Indemnification</h2>
          <p>You agree to indemnify and hold harmless DrawDay Solutions from any claims arising from your use of the Service or violation of these Terms.</p>
          
          <h2>11. Termination</h2>
          <p>We reserve the right to terminate or suspend your account for violations of these Terms or for any other reason at our discretion.</p>
          
          <h2>12. Changes to Terms</h2>
          <p>We may modify these Terms at any time. Continued use after changes constitutes acceptance of modified Terms.</p>
          
          <h2>13. Governing Law</h2>
          <p>These Terms are governed by the laws of England and Wales.</p>
          
          <h2>14. Contact Information</h2>
          <p>For questions about these Terms, contact us at:</p>
          <p>Email: legal@drawdaysolutions.com<br>
          Address: DrawDay Solutions Ltd, London, United Kingdom</p>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`  ✅ Created Terms of Service v2.0.0`);
  } catch (error) {
    console.error(`  ❌ Failed to create Terms of Service:`, error.response?.data || error.message);
  }
}

async function upsertPrivacyPolicy() {
  try {
    // Check if there's already an active Privacy Policy
    const existing = await axios.get(
      `${DIRECTUS_URL}/items/privacy_policy?filter[status][_eq]=active`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (existing.data.data && existing.data.data.length > 0) {
      console.log('  ⚠️  Active Privacy Policy already exists');
      return;
    }

    // Create new Privacy Policy
    await axios.post(
      `${DIRECTUS_URL}/items/privacy_policy`,
      {
        version: '2.0.0',
        status: 'active',
        effective_date: new Date().toISOString(),
        content: `
          <h1>DrawDay Solutions - Privacy Policy</h1>
          <p><strong>Last Updated: ${new Date().toLocaleDateString()}</strong></p>
          
          <h2>1. Introduction</h2>
          <p>DrawDay Solutions Ltd ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.</p>
          
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Account Information</h3>
          <ul>
            <li>Email address</li>
            <li>Name and company name</li>
            <li>Billing information (processed securely via Stripe)</li>
            <li>Account preferences and settings</li>
          </ul>
          
          <h3>2.2 Usage Data</h3>
          <ul>
            <li>Feature usage statistics</li>
            <li>Performance metrics</li>
            <li>Error reports and debugging information</li>
            <li>Browser type and version</li>
          </ul>
          
          <h3>2.3 Competition Data (DrawDay Spinner)</h3>
          <p><strong>Important:</strong> All competition and participant data in DrawDay Spinner is stored locally in your browser. We do not have access to:</p>
          <ul>
            <li>Participant names or details</li>
            <li>Competition information</li>
            <li>Draw results</li>
            <li>Any data you import via CSV</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and maintain our Services</li>
            <li>Process subscriptions and payments</li>
            <li>Send important service updates and announcements</li>
            <li>Provide customer support</li>
            <li>Improve our Services based on usage patterns</li>
            <li>Comply with legal obligations</li>
          </ul>
          
          <h2>4. Data Storage and Security</h2>
          <ul>
            <li>Account data is stored on secure servers in the UK</li>
            <li>We use industry-standard encryption (SSL/TLS)</li>
            <li>Competition data remains local to your browser</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication measures</li>
          </ul>
          
          <h2>5. Data Sharing</h2>
          <p>We do not sell, trade, or rent your personal information. We may share data with:</p>
          <ul>
            <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
            <li><strong>Analytics Services:</strong> Google Analytics (anonymized data only)</li>
            <li><strong>Legal Authorities:</strong> When required by law or court order</li>
            <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
          </ul>
          
          <h2>6. Your Rights (GDPR)</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request copies of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate data</li>
            <li><strong>Erasure:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Export your data in a portable format</li>
            <li><strong>Object:</strong> Object to certain processing activities</li>
            <li><strong>Restrict:</strong> Request processing restrictions</li>
          </ul>
          
          <h2>7. Cookies</h2>
          <p>We use essential cookies for:</p>
          <ul>
            <li>Authentication and session management</li>
            <li>User preferences</li>
            <li>Security features</li>
          </ul>
          <p>We also use analytics cookies (with consent) to understand usage patterns.</p>
          
          <h2>8. Third-Party Services</h2>
          <p>Our Services may contain links to third-party websites. We are not responsible for their privacy practices.</p>
          
          <h2>9. Children's Privacy</h2>
          <p>Our Services are not intended for children under 18. We do not knowingly collect data from minors.</p>
          
          <h2>10. International Data Transfers</h2>
          <p>Your data is primarily stored in the UK. Any international transfers comply with GDPR requirements.</p>
          
          <h2>11. Data Retention</h2>
          <ul>
            <li>Account data: Retained while account is active plus 30 days</li>
            <li>Billing records: 7 years (legal requirement)</li>
            <li>Analytics data: 26 months</li>
            <li>Support tickets: 2 years</li>
          </ul>
          
          <h2>12. Security Breach Notification</h2>
          <p>In the event of a data breach, we will notify affected users within 72 hours as required by GDPR.</p>
          
          <h2>13. Changes to This Policy</h2>
          <p>We may update this policy periodically. We will notify you of significant changes via email.</p>
          
          <h2>14. Contact Information</h2>
          <p>For privacy-related questions or to exercise your rights:</p>
          <p>
            <strong>Data Protection Officer</strong><br>
            Email: privacy@drawdaysolutions.com<br>
            Address: DrawDay Solutions Ltd, London, United Kingdom<br>
            Phone: +44 (0) 20 1234 5678
          </p>
          
          <h2>15. Supervisory Authority</h2>
          <p>You have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at ico.org.uk</p>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`  ✅ Created Privacy Policy v2.0.0`);
  } catch (error) {
    console.error(`  ❌ Failed to create Privacy Policy:`, error.response?.data || error.message);
  }
}

// Run the population
populateContent().catch((error) => {
  console.error('Population failed:', error);
  process.exit(1);
});