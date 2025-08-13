#!/usr/bin/env node

/**
 * Setup website information collections
 * Includes company info, social media, careers, and team members
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

async function createCollection(data) {
  try {
    const response = await axios.post(
      `${DIRECTUS_URL}/collections`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`  ✅ Created collection: ${data.collection}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠️  Collection ${data.collection} already exists`);
    } else {
      console.error(`  ❌ Failed to create collection ${data.collection}:`, error.response?.data || error.message);
    }
  }
}

async function createField(collection, field) {
  try {
    await axios.post(
      `${DIRECTUS_URL}/fields/${collection}`,
      field,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`    ✅ Created field: ${field.field}`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`    ⚠️  Field ${field.field} already exists`);
    } else {
      console.error(`    ❌ Failed to create field ${field.field}:`, error.response?.data || error.message);
    }
  }
}

async function setupCollections() {
  await authenticate();

  console.log('\n📦 Setting up website information collections...\n');

  // 1. Company Info Singleton
  console.log('🏢 Creating company_info singleton...');
  await createCollection({
    collection: 'company_info',
    meta: {
      collection: 'company_info',
      icon: 'business',
      note: 'Company contact and business information',
      display_template: '{{company_name}}',
      hidden: false,
      singleton: true,
      translations: null,
      archive_field: null,
      archive_app_filter: true,
      archive_value: null,
      unarchive_value: null,
      sort_field: null,
      accountability: 'all',
      color: '#2E7D32',
      item_duplication_fields: null,
      sort: null,
      group: null,
      collapse: 'open',
    },
    schema: {
      name: 'company_info',
    },
  });

  const companyInfoFields = [
    {
      field: 'company_name',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'Enter company name' },
        display: 'formatted-value',
        required: true,
      },
      schema: {
        is_nullable: false,
        default_value: 'DrawDay Solutions Ltd',
      },
    },
    {
      field: 'tagline',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'Company tagline' },
      },
    },
    {
      field: 'registration_number',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'Company registration number' },
      },
    },
    {
      field: 'vat_number',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'VAT number' },
      },
    },
    {
      field: 'email',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'contact@company.com' },
        validation: { _and: [{ email: { _nnull: true } }] },
      },
    },
    {
      field: 'phone',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: '+44 20 1234 5678' },
      },
    },
    {
      field: 'support_email',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'support@company.com' },
      },
    },
    {
      field: 'sales_email',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'sales@company.com' },
      },
    },
    {
      field: 'address_line_1',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'Street address' },
      },
    },
    {
      field: 'address_line_2',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'Suite, floor, etc.' },
      },
    },
    {
      field: 'city',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'City' },
      },
    },
    {
      field: 'postal_code',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'Postal code' },
      },
    },
    {
      field: 'country',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'Country' },
      },
    },
    {
      field: 'business_hours',
      type: 'json',
      meta: {
        interface: 'code',
        options: { language: 'json' },
        note: 'Business hours in JSON format',
      },
    },
    {
      field: 'founded_year',
      type: 'integer',
      meta: {
        interface: 'input',
        options: { placeholder: '2024' },
      },
    },
    {
      field: 'about_text',
      type: 'text',
      meta: {
        interface: 'input-rich-text-html',
        options: { toolbar: ['bold', 'italic', 'underline', 'link', 'bullist', 'numlist'] },
      },
    },
  ];

  for (const field of companyInfoFields) {
    await createField('company_info', field);
  }

  // 2. Social Media Collection
  console.log('\n📱 Creating social_media collection...');
  await createCollection({
    collection: 'social_media',
    meta: {
      collection: 'social_media',
      icon: 'share',
      note: 'Social media profiles and links',
      display_template: '{{platform}} - {{username}}',
      hidden: false,
      singleton: false,
      translations: null,
      archive_field: 'status',
      archive_app_filter: true,
      archive_value: 'archived',
      unarchive_value: 'active',
      sort_field: 'sort',
      accountability: 'all',
      color: '#1976D2',
    },
    schema: {
      name: 'social_media',
    },
  });

  const socialMediaFields = [
    {
      field: 'platform',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Twitter/X', value: 'twitter' },
            { text: 'Facebook', value: 'facebook' },
            { text: 'LinkedIn', value: 'linkedin' },
            { text: 'Instagram', value: 'instagram' },
            { text: 'YouTube', value: 'youtube' },
            { text: 'TikTok', value: 'tiktok' },
            { text: 'Discord', value: 'discord' },
            { text: 'Telegram', value: 'telegram' },
            { text: 'GitHub', value: 'github' },
          ],
        },
        required: true,
      },
      schema: {
        is_nullable: false,
      },
    },
    {
      field: 'username',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: '@username' },
        required: true,
      },
      schema: {
        is_nullable: false,
      },
    },
    {
      field: 'url',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'https://platform.com/username' },
        required: true,
      },
      schema: {
        is_nullable: false,
      },
    },
    {
      field: 'display_in_footer',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        options: { label: 'Show in website footer' },
      },
      schema: {
        default_value: true,
      },
    },
    {
      field: 'display_in_header',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        options: { label: 'Show in website header' },
      },
      schema: {
        default_value: false,
      },
    },
    {
      field: 'follower_count',
      type: 'integer',
      meta: {
        interface: 'input',
        options: { placeholder: 'Number of followers' },
      },
    },
    {
      field: 'sort',
      type: 'integer',
      meta: {
        interface: 'input',
        hidden: true,
      },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Active', value: 'active' },
            { text: 'Archived', value: 'archived' },
          ],
        },
      },
      schema: {
        default_value: 'active',
      },
    },
  ];

  for (const field of socialMediaFields) {
    await createField('social_media', field);
  }

  // 3. Careers Collection
  console.log('\n💼 Creating careers collection...');
  await createCollection({
    collection: 'careers',
    meta: {
      collection: 'careers',
      icon: 'work',
      note: 'Job postings and career opportunities',
      display_template: '{{position_title}} - {{department}} ({{status}})',
      hidden: false,
      singleton: false,
      translations: null,
      archive_field: 'status',
      archive_app_filter: true,
      archive_value: 'archived',
      unarchive_value: 'published',
      sort_field: 'sort',
      accountability: 'all',
      color: '#9C27B0',
    },
    schema: {
      name: 'careers',
    },
  });

  const careersFields = [
    {
      field: 'position_title',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'e.g., Senior Full Stack Developer' },
        required: true,
      },
      schema: {
        is_nullable: false,
      },
    },
    {
      field: 'slug',
      type: 'string',
      meta: {
        interface: 'input',
        options: { 
          placeholder: 'URL-friendly version',
          slug: true,
        },
        required: true,
      },
      schema: {
        is_nullable: false,
        is_unique: true,
      },
    },
    {
      field: 'department',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Engineering', value: 'engineering' },
            { text: 'Design', value: 'design' },
            { text: 'Marketing', value: 'marketing' },
            { text: 'Sales', value: 'sales' },
            { text: 'Customer Success', value: 'customer_success' },
            { text: 'Operations', value: 'operations' },
            { text: 'Product', value: 'product' },
          ],
        },
      },
    },
    {
      field: 'location',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'London, UK', value: 'london' },
            { text: 'Remote (UK)', value: 'remote_uk' },
            { text: 'Remote (Europe)', value: 'remote_eu' },
            { text: 'Remote (Global)', value: 'remote_global' },
            { text: 'Hybrid - London', value: 'hybrid_london' },
          ],
        },
      },
    },
    {
      field: 'employment_type',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Full-time', value: 'full_time' },
            { text: 'Part-time', value: 'part_time' },
            { text: 'Contract', value: 'contract' },
            { text: 'Internship', value: 'internship' },
          ],
        },
      },
      schema: {
        default_value: 'full_time',
      },
    },
    {
      field: 'experience_level',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Entry Level', value: 'entry' },
            { text: 'Mid Level', value: 'mid' },
            { text: 'Senior Level', value: 'senior' },
            { text: 'Lead/Principal', value: 'lead' },
            { text: 'Executive', value: 'executive' },
          ],
        },
      },
    },
    {
      field: 'salary_range',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'e.g., £60,000 - £80,000' },
      },
    },
    {
      field: 'description',
      type: 'text',
      meta: {
        interface: 'input-rich-text-html',
        options: { toolbar: ['bold', 'italic', 'underline', 'link', 'bullist', 'numlist', 'h2', 'h3'] },
      },
    },
    {
      field: 'requirements',
      type: 'json',
      meta: {
        interface: 'list',
        options: { 
          template: '{{requirement}}',
          fields: [
            {
              field: 'requirement',
              name: 'Requirement',
              type: 'string',
              meta: {
                interface: 'input',
                width: 'full',
              },
            },
          ],
        },
      },
    },
    {
      field: 'benefits',
      type: 'json',
      meta: {
        interface: 'list',
        options: { 
          template: '{{benefit}}',
          fields: [
            {
              field: 'benefit',
              name: 'Benefit',
              type: 'string',
              meta: {
                interface: 'input',
                width: 'full',
              },
            },
          ],
        },
      },
    },
    {
      field: 'application_deadline',
      type: 'date',
      meta: {
        interface: 'datetime',
      },
    },
    {
      field: 'posted_date',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
      },
      schema: {
        default_value: 'CURRENT_TIMESTAMP',
      },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Draft', value: 'draft' },
            { text: 'Published', value: 'published' },
            { text: 'Closed', value: 'closed' },
            { text: 'Archived', value: 'archived' },
          ],
        },
      },
      schema: {
        default_value: 'draft',
      },
    },
    {
      field: 'application_url',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'Link to application form or email' },
      },
    },
    {
      field: 'sort',
      type: 'integer',
      meta: {
        interface: 'input',
        hidden: true,
      },
    },
  ];

  for (const field of careersFields) {
    await createField('careers', field);
  }

  // 4. Team Members Collection
  console.log('\n👥 Creating team_members collection...');
  await createCollection({
    collection: 'team_members',
    meta: {
      collection: 'team_members',
      icon: 'groups',
      note: 'Team members for about us page',
      display_template: '{{name}} - {{position}}',
      hidden: false,
      singleton: false,
      translations: null,
      archive_field: 'status',
      archive_app_filter: true,
      archive_value: 'inactive',
      unarchive_value: 'active',
      sort_field: 'sort',
      accountability: 'all',
      color: '#FF6F00',
    },
    schema: {
      name: 'team_members',
    },
  });

  const teamMembersFields = [
    {
      field: 'name',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'Full name' },
        required: true,
      },
      schema: {
        is_nullable: false,
      },
    },
    {
      field: 'position',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'e.g., CEO & Founder' },
        required: true,
      },
      schema: {
        is_nullable: false,
      },
    },
    {
      field: 'department',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Leadership', value: 'leadership' },
            { text: 'Engineering', value: 'engineering' },
            { text: 'Design', value: 'design' },
            { text: 'Marketing', value: 'marketing' },
            { text: 'Sales', value: 'sales' },
            { text: 'Customer Success', value: 'customer_success' },
            { text: 'Operations', value: 'operations' },
          ],
        },
      },
    },
    {
      field: 'bio',
      type: 'text',
      meta: {
        interface: 'input-rich-text-html',
        options: { toolbar: ['bold', 'italic', 'link'] },
      },
    },
    {
      field: 'photo_url',
      type: 'string',
      meta: {
        interface: 'file-image',
        options: { folder: 'team_photos' },
      },
    },
    {
      field: 'email',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'email@company.com' },
      },
    },
    {
      field: 'linkedin_url',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'https://linkedin.com/in/username' },
      },
    },
    {
      field: 'twitter_url',
      type: 'string',
      meta: {
        interface: 'input',
        options: { placeholder: 'https://twitter.com/username' },
      },
    },
    {
      field: 'display_on_about',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        options: { label: 'Show on About Us page' },
      },
      schema: {
        default_value: true,
      },
    },
    {
      field: 'is_founder',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        options: { label: 'Founding team member' },
      },
      schema: {
        default_value: false,
      },
    },
    {
      field: 'joined_date',
      type: 'date',
      meta: {
        interface: 'datetime',
      },
    },
    {
      field: 'sort',
      type: 'integer',
      meta: {
        interface: 'input',
        hidden: true,
      },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Active', value: 'active' },
            { text: 'Inactive', value: 'inactive' },
          ],
        },
      },
      schema: {
        default_value: 'active',
      },
    },
  ];

  for (const field of teamMembersFields) {
    await createField('team_members', field);
  }

  console.log('\n✅ All website information collections created successfully!');
  console.log('\n📝 Next steps:');
  console.log('  1. Run populate-website-info.js to add initial data');
  console.log('  2. Run setup-website-permissions.js to set up public access');
  console.log('  3. Update frontend to fetch this data');
}

// Run the setup
setupCollections().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});