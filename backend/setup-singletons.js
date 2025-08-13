#!/usr/bin/env node

/**
 * Setup singleton collections for website content management
 * These collections will hold content for the main website pages
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

// Create a singleton collection
async function createSingletonCollection(collection) {
  try {
    await axios.post(
      `${DIRECTUS_URL}/collections`,
      collection,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`✅ Created singleton: ${collection.collection}`);
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`⚠️  Singleton already exists: ${collection.collection}`);
    } else {
      console.error(`❌ Failed to create singleton ${collection.collection}:`, error.response?.data || error.message);
    }
  }
}

// Create fields for a collection
async function createFields(collectionName, fields) {
  for (const field of fields) {
    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/${collectionName}`,
        field,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`  ✅ Created field: ${field.field}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`  ⚠️  Field already exists: ${field.field}`);
      } else {
        console.error(`  ❌ Failed to create field ${field.field}:`, error.response?.data || error.message);
      }
    }
  }
}

// Create initial content for singleton
async function createSingletonContent(collection, content) {
  try {
    // First check if content already exists
    const existing = await axios.get(
      `${DIRECTUS_URL}/items/${collection}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (existing.data.data && (existing.data.data.length > 0 || existing.data.data.id)) {
      console.log(`  ⚠️  Content already exists for ${collection}`);
      return;
    }
  } catch (error) {
    // No content exists, continue
  }

  try {
    await axios.post(
      `${DIRECTUS_URL}/items/${collection}`,
      content,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`  ✅ Created initial content for ${collection}`);
  } catch (error) {
    console.error(`  ❌ Failed to create content for ${collection}:`, error.response?.data || error.message);
  }
}

async function setupSingletons() {
  await authenticate();

  // Homepage Singleton
  console.log('\n🏠 Setting up Homepage singleton...');
  await createSingletonCollection({
    collection: 'homepage',
    meta: {
      collection: 'homepage',
      icon: 'home',
      note: 'Homepage content management',
      singleton: true,
      translations: null,
    },
    schema: {
      name: 'homepage',
      comment: 'Homepage content and settings'
    },
    fields: [
      {
        field: 'id',
        type: 'integer',
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid'],
        },
        schema: {
          is_primary_key: true,
          has_auto_increment: true,
        },
      },
    ],
  });

  await createFields('homepage', [
    {
      field: 'hero_title',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
        options: {
          placeholder: 'Main headline for the hero section',
        },
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'hero_subtitle',
      type: 'text',
      meta: {
        interface: 'input-multiline',
        required: true,
        options: {
          placeholder: 'Supporting text for the hero section',
        },
      },
    },
    {
      field: 'hero_cta_text',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 100,
      },
    },
    {
      field: 'hero_cta_link',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'features_title',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'features_subtitle',
      type: 'text',
      meta: {
        interface: 'input-multiline',
      },
    },
    {
      field: 'features_list',
      type: 'json',
      meta: {
        interface: 'list',
        special: ['cast-json'],
        options: {
          fields: [
            {
              field: 'icon',
              name: 'Icon',
              type: 'string',
              meta: {
                interface: 'select-dropdown',
                options: {
                  choices: [
                    { text: 'Sparkles', value: 'sparkles' },
                    { text: 'Shield', value: 'shield' },
                    { text: 'Zap', value: 'zap' },
                    { text: 'Users', value: 'users' },
                    { text: 'Trophy', value: 'trophy' },
                    { text: 'Settings', value: 'settings' },
                  ],
                },
              },
            },
            {
              field: 'title',
              name: 'Title',
              type: 'string',
              meta: {
                interface: 'input',
                required: true,
              },
            },
            {
              field: 'description',
              name: 'Description',
              type: 'text',
              meta: {
                interface: 'input-multiline',
                required: true,
              },
            },
          ],
        },
      },
    },
    {
      field: 'cta_title',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'cta_description',
      type: 'text',
      meta: {
        interface: 'input-multiline',
      },
    },
    {
      field: 'cta_button_text',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 100,
      },
    },
    {
      field: 'cta_button_link',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'seo_title',
      type: 'string',
      meta: {
        interface: 'input',
        options: {
          placeholder: 'SEO title for the homepage',
        },
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'seo_description',
      type: 'text',
      meta: {
        interface: 'input-multiline',
        options: {
          placeholder: 'SEO meta description',
        },
      },
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        hidden: true,
        special: ['date-updated'],
      },
    },
  ]);

  // Features Page Singleton
  console.log('\n✨ Setting up Features Page singleton...');
  await createSingletonCollection({
    collection: 'features_page',
    meta: {
      collection: 'features_page',
      icon: 'star',
      note: 'Features page content management',
      singleton: true,
    },
    schema: {
      name: 'features_page',
      comment: 'Features page content'
    },
    fields: [
      {
        field: 'id',
        type: 'integer',
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
        },
        schema: {
          is_primary_key: true,
          has_auto_increment: true,
        },
      },
    ],
  });

  await createFields('features_page', [
    {
      field: 'page_title',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'page_subtitle',
      type: 'text',
      meta: {
        interface: 'input-multiline',
      },
    },
    {
      field: 'features',
      type: 'json',
      meta: {
        interface: 'list',
        special: ['cast-json'],
        options: {
          fields: [
            {
              field: 'category',
              name: 'Category',
              type: 'string',
              meta: {
                interface: 'input',
                required: true,
              },
            },
            {
              field: 'title',
              name: 'Title',
              type: 'string',
              meta: {
                interface: 'input',
                required: true,
              },
            },
            {
              field: 'description',
              name: 'Description',
              type: 'text',
              meta: {
                interface: 'input-multiline',
                required: true,
              },
            },
            {
              field: 'image_url',
              name: 'Image URL',
              type: 'string',
              meta: {
                interface: 'input',
              },
            },
            {
              field: 'is_pro',
              name: 'Pro Feature',
              type: 'boolean',
              meta: {
                interface: 'toggle',
                default_value: false,
              },
            },
          ],
        },
      },
    },
    {
      field: 'pricing_section_title',
      type: 'string',
      meta: {
        interface: 'input',
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'pricing_plans',
      type: 'json',
      meta: {
        interface: 'list',
        special: ['cast-json'],
        options: {
          fields: [
            {
              field: 'name',
              name: 'Plan Name',
              type: 'string',
              meta: {
                interface: 'input',
                required: true,
              },
            },
            {
              field: 'price',
              name: 'Price',
              type: 'string',
              meta: {
                interface: 'input',
                required: true,
              },
            },
            {
              field: 'period',
              name: 'Billing Period',
              type: 'string',
              meta: {
                interface: 'input',
              },
            },
            {
              field: 'features',
              name: 'Features List',
              type: 'json',
              meta: {
                interface: 'tags',
              },
            },
            {
              field: 'cta_text',
              name: 'Button Text',
              type: 'string',
              meta: {
                interface: 'input',
              },
            },
            {
              field: 'is_popular',
              name: 'Popular Badge',
              type: 'boolean',
              meta: {
                interface: 'toggle',
                default_value: false,
              },
            },
          ],
        },
      },
    },
    {
      field: 'seo_title',
      type: 'string',
      meta: {
        interface: 'input',
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'seo_description',
      type: 'text',
      meta: {
        interface: 'input-multiline',
      },
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        hidden: true,
        special: ['date-updated'],
      },
    },
  ]);

  // Demo Page Singleton
  console.log('\n🎮 Setting up Demo Page singleton...');
  await createSingletonCollection({
    collection: 'demo_page',
    meta: {
      collection: 'demo_page',
      icon: 'play_circle',
      note: 'Demo page content management',
      singleton: true,
    },
    schema: {
      name: 'demo_page',
      comment: 'Demo page content'
    },
    fields: [
      {
        field: 'id',
        type: 'integer',
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
        },
        schema: {
          is_primary_key: true,
          has_auto_increment: true,
        },
      },
    ],
  });

  await createFields('demo_page', [
    {
      field: 'page_title',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'page_subtitle',
      type: 'text',
      meta: {
        interface: 'input-multiline',
      },
    },
    {
      field: 'demo_instructions',
      type: 'text',
      meta: {
        interface: 'input-rich-text-html',
      },
    },
    {
      field: 'sample_data_title',
      type: 'string',
      meta: {
        interface: 'input',
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'sample_data_description',
      type: 'text',
      meta: {
        interface: 'input-multiline',
      },
    },
    {
      field: 'video_url',
      type: 'string',
      meta: {
        interface: 'input',
        options: {
          placeholder: 'YouTube or Vimeo embed URL',
        },
      },
      schema: {
        max_length: 500,
      },
    },
    {
      field: 'testimonials',
      type: 'json',
      meta: {
        interface: 'list',
        special: ['cast-json'],
        options: {
          fields: [
            {
              field: 'author',
              name: 'Author Name',
              type: 'string',
              meta: {
                interface: 'input',
                required: true,
              },
            },
            {
              field: 'company',
              name: 'Company',
              type: 'string',
              meta: {
                interface: 'input',
              },
            },
            {
              field: 'content',
              name: 'Testimonial',
              type: 'text',
              meta: {
                interface: 'input-multiline',
                required: true,
              },
            },
            {
              field: 'rating',
              name: 'Rating',
              type: 'integer',
              meta: {
                interface: 'select-dropdown',
                options: {
                  choices: [
                    { text: '5 Stars', value: 5 },
                    { text: '4 Stars', value: 4 },
                    { text: '3 Stars', value: 3 },
                  ],
                },
                default_value: 5,
              },
            },
          ],
        },
      },
    },
    {
      field: 'seo_title',
      type: 'string',
      meta: {
        interface: 'input',
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'seo_description',
      type: 'text',
      meta: {
        interface: 'input-multiline',
      },
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        hidden: true,
        special: ['date-updated'],
      },
    },
  ]);

  // Site Settings Singleton
  console.log('\n⚙️ Setting up Site Settings singleton...');
  await createSingletonCollection({
    collection: 'site_settings',
    meta: {
      collection: 'site_settings',
      icon: 'settings',
      note: 'Global site settings and configuration',
      singleton: true,
    },
    schema: {
      name: 'site_settings',
      comment: 'Global site settings'
    },
    fields: [
      {
        field: 'id',
        type: 'integer',
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
        },
        schema: {
          is_primary_key: true,
          has_auto_increment: true,
        },
      },
    ],
  });

  await createFields('site_settings', [
    {
      field: 'site_name',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
        default_value: 'DrawDay Spinner',
      },
    },
    {
      field: 'tagline',
      type: 'string',
      meta: {
        interface: 'input',
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'logo_url',
      type: 'string',
      meta: {
        interface: 'input',
      },
      schema: {
        max_length: 500,
      },
    },
    {
      field: 'favicon_url',
      type: 'string',
      meta: {
        interface: 'input',
      },
      schema: {
        max_length: 500,
      },
    },
    {
      field: 'social_links',
      type: 'json',
      meta: {
        interface: 'key-value',
        special: ['cast-json'],
        options: {
          keyPlaceholder: 'Platform (twitter, facebook, etc.)',
          valuePlaceholder: 'URL',
        },
      },
    },
    {
      field: 'analytics_id',
      type: 'string',
      meta: {
        interface: 'input',
        options: {
          placeholder: 'Google Analytics ID',
        },
      },
      schema: {
        max_length: 50,
      },
    },
    {
      field: 'maintenance_mode',
      type: 'boolean',
      meta: {
        interface: 'toggle',
        default_value: false,
      },
      schema: {
        default_value: false,
      },
    },
    {
      field: 'maintenance_message',
      type: 'text',
      meta: {
        interface: 'input-multiline',
      },
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        hidden: true,
        special: ['date-updated'],
      },
    },
  ]);

  console.log('\n✅ All singletons have been created successfully!');

  // Add initial content
  console.log('\n📝 Adding initial content...');

  // Homepage content
  await createSingletonContent('homepage', {
    hero_title: 'Turn Your Live Draws Into Unforgettable Experiences',
    hero_subtitle: 'The professional Chrome extension trusted by UK competition hosts for fair, transparent, and exciting winner selection.',
    hero_cta_text: 'Start Free Trial',
    hero_cta_link: 'https://chrome.google.com/webstore',
    features_title: 'Everything You Need for Professional Live Draws',
    features_subtitle: 'Designed specifically for UK competition requirements with features that make your draws memorable',
    features_list: [
      {
        icon: 'sparkles',
        title: 'Beautiful Animations',
        description: 'Smooth 60fps spinner wheel with customizable themes and effects',
      },
      {
        icon: 'shield',
        title: 'Transparent & Fair',
        description: 'Pre-calculated results ensure complete fairness and transparency',
      },
      {
        icon: 'zap',
        title: 'Lightning Fast',
        description: 'Handles 5000+ participants without breaking a sweat',
      },
      {
        icon: 'users',
        title: 'Easy Import',
        description: 'Smart CSV import with automatic column detection',
      },
    ],
    cta_title: 'Ready to Transform Your Live Draws?',
    cta_description: 'Join thousands of UK competition hosts who trust DrawDay Spinner',
    cta_button_text: 'Get Started Free',
    cta_button_link: 'https://chrome.google.com/webstore',
    seo_title: 'DrawDay Spinner - Professional Live Draw Chrome Extension',
    seo_description: 'The trusted Chrome extension for UK competition live draws. Fair, transparent, and exciting winner selection with beautiful animations.',
  });

  // Features page content
  await createSingletonContent('features_page', {
    page_title: 'Features',
    page_subtitle: 'Everything you need to run professional live draws',
    features: [
      {
        category: 'Core Features',
        title: 'Smart CSV Import',
        description: 'Intelligent column mapping automatically detects your data structure',
        is_pro: false,
      },
      {
        category: 'Core Features',
        title: 'Session Winners',
        description: 'Track all winners during your live stream session',
        is_pro: false,
      },
      {
        category: 'Customization',
        title: 'Custom Branding',
        description: 'Add your logo and company information',
        is_pro: true,
      },
      {
        category: 'Customization',
        title: 'Theme Designer',
        description: 'Create unlimited custom themes for your brand',
        is_pro: true,
      },
    ],
    pricing_section_title: 'Choose Your Plan',
    pricing_plans: [
      {
        name: 'Free',
        price: '£0',
        period: 'forever',
        features: ['Basic spinner', 'Up to 100 participants', 'Session tracking'],
        cta_text: 'Get Started',
        is_popular: false,
      },
      {
        name: 'Pro',
        price: '£19',
        period: 'per month',
        features: ['Unlimited participants', 'Custom branding', 'Priority support', 'Advanced analytics'],
        cta_text: 'Start Free Trial',
        is_popular: true,
      },
    ],
    seo_title: 'Features - DrawDay Spinner',
    seo_description: 'Explore all features of DrawDay Spinner. Smart CSV import, custom branding, beautiful animations, and more.',
  });

  // Demo page content
  await createSingletonContent('demo_page', {
    page_title: 'Try DrawDay Spinner',
    page_subtitle: 'Experience the power of professional live draws',
    demo_instructions: '<p>Click the "Spin" button below to see DrawDay Spinner in action. This demo uses sample data to show you how smooth and exciting your live draws can be.</p>',
    sample_data_title: 'Sample Competition Data',
    sample_data_description: 'This demo includes 50 sample participants to demonstrate the spinner functionality',
    testimonials: [
      {
        author: 'Sarah Johnson',
        company: 'UK Competitions Ltd',
        content: 'DrawDay Spinner has transformed our live draws. Our audience loves the excitement!',
        rating: 5,
      },
      {
        author: 'Mike Thompson',
        company: 'Prize Draws UK',
        content: 'The fairness and transparency features give our participants complete confidence.',
        rating: 5,
      },
    ],
    seo_title: 'Demo - Try DrawDay Spinner',
    seo_description: 'Try DrawDay Spinner with our interactive demo. See how easy it is to run professional live draws.',
  });

  // Site settings
  await createSingletonContent('site_settings', {
    site_name: 'DrawDay Spinner',
    tagline: 'Professional Live Draws Made Easy',
    logo_url: '/logo.svg',
    favicon_url: '/favicon.png',
    social_links: {
      twitter: 'https://twitter.com/drawday',
      facebook: 'https://facebook.com/drawday',
      linkedin: 'https://linkedin.com/company/drawday',
    },
    analytics_id: '',
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance. We\'ll be back shortly!',
  });

  console.log('\n✅ Initial content added successfully!');
}

// Run the setup
setupSingletons().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});