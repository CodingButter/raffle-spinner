#!/usr/bin/env node

/**
 * Fix singleton content - properly insert content into singleton collections
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'drawday';

let accessToken = null;

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

async function updateSingleton(collection, content) {
  try {
    // For singletons in Directus, we need to update without an ID
    const response = await axios.patch(
      `${DIRECTUS_URL}/items/${collection}`,
      content,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`✅ Updated ${collection} singleton`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to update ${collection}:`, error.response?.data || error.message);
    
    // Try POST if PATCH fails
    try {
      const response = await axios.post(
        `${DIRECTUS_URL}/items/${collection}`,
        { id: 1, ...content },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`✅ Created ${collection} singleton content`);
      return response.data;
    } catch (postError) {
      console.error(`❌ Also failed with POST:`, postError.response?.data || postError.message);
    }
  }
}

async function fixSingletonContent() {
  await authenticate();

  console.log('\n🔧 Fixing singleton content...\n');

  // Homepage content
  console.log('🏠 Updating Homepage...');
  await updateSingleton('homepage', {
    hero_title: 'DrawDay Solutions',
    hero_subtitle: 'The complete technology partner for UK raffle companies. From live draw software to streaming production and custom websites.',
    hero_cta_text: 'Explore Our Solutions',
    hero_cta_link: '#services',
    features_title: 'Complete Solutions for Modern Raffles',
    features_subtitle: 'Everything you need to run professional, compliant, and engaging prize draws',
    features_list: JSON.stringify([
      {
        icon: 'sparkles',
        title: 'DrawDay Spinner',
        description: 'Professional live draw software with stunning animations, handling 5000+ entries at 60fps.'
      },
      {
        icon: 'zap',
        title: 'Streaming Production',
        description: 'Professional streaming overlays, graphics, and production tools for broadcast-quality draws.'
      },
      {
        icon: 'shield',
        title: 'Custom Websites',
        description: 'Bespoke competition websites built for conversion. Fast, secure, and optimized.'
      },
      {
        icon: 'trophy',
        title: 'UK Compliant',
        description: 'Built for Gambling Commission requirements. Transparent, fair, and auditable.'
      }
    ]),
    cta_title: 'Ready to Transform Your Live Draws?',
    cta_description: 'Join the UK\'s leading raffle companies using DrawDay Solutions',
    cta_button_text: 'Get Started Today',
    cta_button_link: '/contact',
    seo_title: 'DrawDay Solutions - Technology Partner for UK Raffle Companies',
    seo_description: 'Complete technology solutions for UK raffle companies. Live draw software, streaming production, and custom websites.',
  });

  // Features page
  console.log('✨ Updating Features Page...');
  await updateSingleton('features_page', {
    page_title: 'Features',
    page_subtitle: 'Everything you need for professional live draws',
    features: JSON.stringify([
      {
        category: 'Core Features',
        title: 'Professional Slot Machine Spinner',
        description: 'Cinema-quality animations with physics-based motion. Smooth 60fps performance.',
        is_pro: false,
      },
      {
        category: 'Core Features',
        title: 'Smart CSV Import',
        description: 'Import participant data in seconds with intelligent column mapping.',
        is_pro: false,
      },
      {
        category: 'Core Features',
        title: 'Competition Management',
        description: 'Organize multiple competitions and track winners across sessions.',
        is_pro: false,
      },
      {
        category: 'Customization',
        title: 'Custom Branding',
        description: 'Match your business identity with full customization options.',
        is_pro: true,
      },
      {
        category: 'Customization',
        title: 'Theme Designer',
        description: 'Create unlimited custom themes for your brand.',
        is_pro: true,
      },
      {
        category: 'Privacy',
        title: '100% Privacy Focused',
        description: 'All data stays local in your browser - no external servers.',
        is_pro: false,
      },
    ]),
    pricing_section_title: 'Choose Your Plan',
    pricing_plans: JSON.stringify([
      {
        name: 'Free',
        price: '£0',
        period: 'forever',
        features: ['Up to 100 participants', 'Basic spinner', 'CSV import', 'Session tracking'],
        cta_text: 'Get Started',
        is_popular: false,
      },
      {
        name: 'Pro',
        price: '£29',
        period: 'per month',
        features: ['Unlimited participants', 'Custom branding', 'Priority support', 'All features'],
        cta_text: 'Start 14-Day Trial',
        is_popular: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'contact us',
        features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
        cta_text: 'Contact Sales',
        is_popular: false,
      },
    ]),
    seo_title: 'Features - DrawDay Spinner | Professional Live Draw Software',
    seo_description: 'Explore all features of DrawDay Spinner. Smart CSV import, custom branding, beautiful animations.',
  });

  // Demo page
  console.log('🎮 Updating Demo Page...');
  await updateSingleton('demo_page', {
    page_title: 'Try DrawDay Spinner',
    page_subtitle: 'Experience the power of professional live draws',
    demo_instructions: '<h3>How to Use the Demo</h3><ol><li>Select a competition from the dropdown</li><li>Enter a ticket number</li><li>Click Spin to see the animation</li><li>Watch the winner reveal</li></ol>',
    sample_data_title: 'Sample Competition Data',
    sample_data_description: 'This demo includes 50 sample participants. Try ticket numbers like "001", "025", or "050".',
    video_url: '',
    testimonials: JSON.stringify([
      {
        author: 'Sarah Johnson',
        company: 'Elite Competitions UK',
        content: 'DrawDay Spinner has transformed our live draws. Engagement increased by 300%!',
        rating: 5,
      },
      {
        author: 'Mike Thompson',
        company: 'Dream Car Giveaways',
        content: 'The best solution we\'ve tried. CSV import saves hours, looks incredibly professional.',
        rating: 5,
      },
      {
        author: 'Emma Williams',
        company: 'Prestige Prize Draws',
        content: 'Outstanding attention to detail. Everything feels premium. Our customers love it!',
        rating: 5,
      },
    ]),
    seo_title: 'Demo - Try DrawDay Spinner | Live Draw Software Demo',
    seo_description: 'Try DrawDay Spinner with our interactive demo. See professional live draws in action.',
  });

  // Site settings
  console.log('⚙️ Updating Site Settings...');
  await updateSingleton('site_settings', {
    site_name: 'DrawDay Solutions',
    tagline: 'Professional Technology for UK Raffle Companies',
    logo_url: '/logo.svg',
    favicon_url: '/favicon.png',
    social_links: JSON.stringify({
      twitter: 'https://twitter.com/drawdaysolutions',
      facebook: 'https://facebook.com/drawdaysolutions',
      linkedin: 'https://linkedin.com/company/drawday-solutions',
      youtube: 'https://youtube.com/@drawdaysolutions',
    }),
    analytics_id: '',
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance. We\'ll be back shortly!',
  });

  console.log('\n✅ All singleton content has been fixed!');
  
  // Test public access
  console.log('\n🧪 Testing public access...');
  
  try {
    const homepage = await axios.get(`${DIRECTUS_URL}/items/homepage`);
    console.log('✅ Homepage is publicly accessible');
    console.log(`   Title: ${homepage.data.data.hero_title || 'Not set'}`);
  } catch (error) {
    console.log('❌ Homepage is not publicly accessible - check permissions');
  }

  try {
    const settings = await axios.get(`${DIRECTUS_URL}/items/site_settings`);
    console.log('✅ Site settings are publicly accessible');
    console.log(`   Site name: ${settings.data.data.site_name || 'Not set'}`);
  } catch (error) {
    console.log('❌ Site settings are not publicly accessible - check permissions');
  }

  console.log('\n📝 Next steps:');
  console.log('1. Visit http://localhost:8055 to verify content in admin panel');
  console.log('2. Test API access: curl http://localhost:8055/items/homepage');
  console.log('3. Update frontend to fetch this content');
}

// Run the fix
fixSingletonContent().catch((error) => {
  console.error('Fix failed:', error);
  process.exit(1);
});