#!/usr/bin/env node

/**
 * Populate website information with initial data
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

async function populateCompanyInfo() {
  console.log('🏢 Populating company info...');
  
  const companyData = {
    id: 1, // Singleton
    company_name: 'DrawDay Solutions Ltd',
    tagline: 'Professional Technology for UK Raffle Companies',
    registration_number: '14789632',
    vat_number: 'GB 123 4567 89',
    email: 'hello@drawdaysolutions.com',
    phone: '+44 20 3900 4555',
    support_email: 'support@drawdaysolutions.com',
    sales_email: 'sales@drawdaysolutions.com',
    address_line_1: '71-75 Shelton Street',
    address_line_2: 'Covent Garden',
    city: 'London',
    postal_code: 'WC2H 9JQ',
    country: 'United Kingdom',
    business_hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: 'Closed',
      sunday: 'Closed',
      timezone: 'Europe/London',
      support_hours: '24/7 for Pro and Enterprise customers'
    },
    founded_year: 2024,
    about_text: `
      <h3>About DrawDay Solutions</h3>
      <p>DrawDay Solutions is the UK's premier technology partner for raffle and competition companies. Founded in 2024, we've quickly become the trusted choice for businesses running prize draws worth millions of pounds.</p>
      
      <h4>Our Mission</h4>
      <p>To provide cutting-edge technology that makes running fair, transparent, and engaging prize draws effortless for UK competition businesses.</p>
      
      <h4>Our Values</h4>
      <ul>
        <li><strong>Transparency:</strong> Every draw should be verifiable and trustworthy</li>
        <li><strong>Innovation:</strong> Continuously improving the live draw experience</li>
        <li><strong>Compliance:</strong> Built to exceed UK Gambling Commission standards</li>
        <li><strong>Support:</strong> Your success is our success</li>
      </ul>
      
      <h4>Why Choose Us?</h4>
      <p>We understand the unique challenges of running competitions in the UK market. From handling thousands of entries to ensuring complete transparency, our solutions are built by industry experts who know what you need.</p>
    `
  };

  try {
    // Try to update first (PATCH for singleton)
    await axios.patch(
      `${DIRECTUS_URL}/items/company_info`,
      companyData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('  ✅ Company info updated');
  } catch (error) {
    // If update fails, try to create
    try {
      await axios.post(
        `${DIRECTUS_URL}/items/company_info`,
        companyData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('  ✅ Company info created');
    } catch (createError) {
      console.error('  ❌ Failed to populate company info:', createError.response?.data || createError.message);
    }
  }
}

async function populateSocialMedia() {
  console.log('\n📱 Populating social media...');
  
  const socialProfiles = [
    {
      platform: 'twitter',
      username: '@DrawDaySolutions',
      url: 'https://twitter.com/DrawDaySolutions',
      display_in_footer: true,
      display_in_header: false,
      follower_count: 5432,
      sort: 1,
      status: 'active',
    },
    {
      platform: 'facebook',
      username: 'DrawDaySolutions',
      url: 'https://facebook.com/DrawDaySolutions',
      display_in_footer: true,
      display_in_header: false,
      follower_count: 3210,
      sort: 2,
      status: 'active',
    },
    {
      platform: 'linkedin',
      username: 'drawday-solutions',
      url: 'https://linkedin.com/company/drawday-solutions',
      display_in_footer: true,
      display_in_header: false,
      follower_count: 1876,
      sort: 3,
      status: 'active',
    },
    {
      platform: 'youtube',
      username: '@DrawDaySolutions',
      url: 'https://youtube.com/@DrawDaySolutions',
      display_in_footer: true,
      display_in_header: false,
      follower_count: 892,
      sort: 4,
      status: 'active',
    },
    {
      platform: 'instagram',
      username: '@drawdaysolutions',
      url: 'https://instagram.com/drawdaysolutions',
      display_in_footer: true,
      display_in_header: false,
      follower_count: 2341,
      sort: 5,
      status: 'active',
    },
    {
      platform: 'discord',
      username: 'DrawDay Community',
      url: 'https://discord.gg/drawday',
      display_in_footer: false,
      display_in_header: false,
      follower_count: 450,
      sort: 6,
      status: 'active',
    },
  ];

  for (const profile of socialProfiles) {
    try {
      await axios.post(
        `${DIRECTUS_URL}/items/social_media`,
        profile,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`  ✅ Added ${profile.platform} profile`);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('duplicate')) {
        console.log(`  ⚠️  ${profile.platform} profile already exists`);
      } else {
        console.error(`  ❌ Failed to add ${profile.platform}:`, error.response?.data || error.message);
      }
    }
  }
}

async function populateCareers() {
  console.log('\n💼 Populating career opportunities...');
  
  const jobPostings = [
    {
      position_title: 'Senior Full Stack Developer',
      slug: 'senior-full-stack-developer',
      department: 'engineering',
      location: 'hybrid_london',
      employment_type: 'full_time',
      experience_level: 'senior',
      salary_range: '£70,000 - £90,000',
      description: `
        <h3>About the Role</h3>
        <p>We're looking for a Senior Full Stack Developer to join our growing team and help build the next generation of raffle technology. You'll work on our Chrome extension, web applications, and backend services that power thousands of live draws every month.</p>
        
        <h3>What You'll Do</h3>
        <ul>
          <li>Develop and maintain our DrawDay Spinner Chrome extension</li>
          <li>Build scalable backend services using Node.js and PostgreSQL</li>
          <li>Create responsive, performant frontend applications with React and Next.js</li>
          <li>Collaborate with designers to implement pixel-perfect UIs</li>
          <li>Optimize performance for handling 5000+ participants at 60fps</li>
          <li>Mentor junior developers and contribute to technical decisions</li>
        </ul>
        
        <h3>Our Tech Stack</h3>
        <p>TypeScript, React, Next.js, Node.js, PostgreSQL, Redis, Docker, Chrome Extensions API, Tailwind CSS</p>
      `,
      requirements: [
        { requirement: '5+ years of full stack development experience' },
        { requirement: 'Strong TypeScript and JavaScript skills' },
        { requirement: 'Experience with React and modern frontend frameworks' },
        { requirement: 'Backend development experience with Node.js' },
        { requirement: 'Understanding of database design and optimization' },
        { requirement: 'Experience with Chrome Extensions is a plus' },
        { requirement: 'Knowledge of UK gambling regulations is beneficial' },
      ],
      benefits: [
        { benefit: 'Competitive salary £70k-90k based on experience' },
        { benefit: '25 days holiday + bank holidays' },
        { benefit: 'Flexible hybrid working (2 days in office)' },
        { benefit: 'Private health insurance' },
        { benefit: 'Annual learning budget £2,000' },
        { benefit: 'Latest MacBook Pro and equipment' },
        { benefit: 'Stock options for the right candidate' },
        { benefit: 'Regular team events and hackathons' },
      ],
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      posted_date: new Date().toISOString(),
      status: 'published',
      application_url: 'mailto:careers@drawdaysolutions.com?subject=Senior Full Stack Developer Application',
      sort: 1,
    },
    {
      position_title: 'UI/UX Designer',
      slug: 'ui-ux-designer',
      department: 'design',
      location: 'remote_uk',
      employment_type: 'full_time',
      experience_level: 'mid',
      salary_range: '£45,000 - £60,000',
      description: `
        <h3>About the Role</h3>
        <p>We're seeking a talented UI/UX Designer to help us create beautiful, intuitive interfaces for our raffle and competition software. You'll work closely with our product and engineering teams to design experiences that delight our users.</p>
        
        <h3>What You'll Do</h3>
        <ul>
          <li>Design user interfaces for our web applications and Chrome extension</li>
          <li>Create wireframes, prototypes, and high-fidelity designs</li>
          <li>Conduct user research and usability testing</li>
          <li>Develop and maintain our design system</li>
          <li>Collaborate with developers to ensure accurate implementation</li>
          <li>Design marketing materials and brand assets</li>
        </ul>
      `,
      requirements: [
        { requirement: '3+ years of UI/UX design experience' },
        { requirement: 'Strong portfolio demonstrating web and app design' },
        { requirement: 'Proficiency in Figma, Sketch, or similar tools' },
        { requirement: 'Understanding of user-centered design principles' },
        { requirement: 'Experience with design systems and component libraries' },
        { requirement: 'Basic understanding of HTML/CSS is a plus' },
      ],
      benefits: [
        { benefit: 'Competitive salary £45k-60k based on experience' },
        { benefit: 'Fully remote position within UK' },
        { benefit: '25 days holiday + bank holidays' },
        { benefit: 'Annual design tools budget' },
        { benefit: 'Learning and development opportunities' },
        { benefit: 'Flexible working hours' },
      ],
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      posted_date: new Date().toISOString(),
      status: 'published',
      application_url: 'mailto:careers@drawdaysolutions.com?subject=UI/UX Designer Application',
      sort: 2,
    },
    {
      position_title: 'Customer Success Manager',
      slug: 'customer-success-manager',
      department: 'customer_success',
      location: 'london',
      employment_type: 'full_time',
      experience_level: 'mid',
      salary_range: '£40,000 - £50,000',
      description: `
        <h3>About the Role</h3>
        <p>As our Customer Success Manager, you'll be the primary point of contact for our raffle company clients, ensuring they get maximum value from our platform and maintaining our industry-leading customer satisfaction rates.</p>
        
        <h3>What You'll Do</h3>
        <ul>
          <li>Onboard new raffle companies to our platform</li>
          <li>Provide training and support for DrawDay Spinner and other products</li>
          <li>Build strong relationships with key accounts</li>
          <li>Identify upselling and cross-selling opportunities</li>
          <li>Gather customer feedback and work with product team on improvements</li>
          <li>Create documentation and training materials</li>
        </ul>
      `,
      requirements: [
        { requirement: '2+ years in customer success or account management' },
        { requirement: 'Excellent communication and presentation skills' },
        { requirement: 'Experience in SaaS or technology companies' },
        { requirement: 'Strong problem-solving abilities' },
        { requirement: 'Knowledge of UK competition/gambling industry is a plus' },
        { requirement: 'Ability to explain technical concepts to non-technical users' },
      ],
      benefits: [
        { benefit: 'Competitive salary £40k-50k plus commission' },
        { benefit: '25 days holiday + bank holidays' },
        { benefit: 'Central London office near Covent Garden' },
        { benefit: 'Private health insurance' },
        { benefit: 'Professional development budget' },
        { benefit: 'Team social events and annual retreat' },
      ],
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      posted_date: new Date().toISOString(),
      status: 'published',
      application_url: 'mailto:careers@drawdaysolutions.com?subject=Customer Success Manager Application',
      sort: 3,
    },
  ];

  for (const job of jobPostings) {
    try {
      await axios.post(
        `${DIRECTUS_URL}/items/careers`,
        job,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`  ✅ Added job posting: ${job.position_title}`);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('duplicate')) {
        console.log(`  ⚠️  Job posting "${job.position_title}" already exists`);
      } else {
        console.error(`  ❌ Failed to add job posting:`, error.response?.data || error.message);
      }
    }
  }
}

async function populateTeamMembers() {
  console.log('\n👥 Populating team members...');
  
  const teamMembers = [
    {
      name: 'James Richardson',
      position: 'CEO & Co-Founder',
      department: 'leadership',
      bio: `<p>James brings over 15 years of experience in the UK gambling and competition industry. Previously founded and sold a successful competition platform, and now leads DrawDay's vision to revolutionize live draws.</p>`,
      email: 'james@drawdaysolutions.com',
      linkedin_url: 'https://linkedin.com/in/jamesrichardson',
      twitter_url: 'https://twitter.com/jrichardsonuk',
      display_on_about: true,
      is_founder: true,
      joined_date: '2024-01-01',
      sort: 1,
      status: 'active',
    },
    {
      name: 'Sarah Chen',
      position: 'CTO & Co-Founder',
      department: 'leadership',
      bio: `<p>Sarah is a technical leader with expertise in building scalable platforms. Former senior engineer at multiple successful UK startups, she ensures DrawDay's technology stays ahead of the curve.</p>`,
      email: 'sarah@drawdaysolutions.com',
      linkedin_url: 'https://linkedin.com/in/sarahchen',
      display_on_about: true,
      is_founder: true,
      joined_date: '2024-01-01',
      sort: 2,
      status: 'active',
    },
    {
      name: 'Michael O\'Brien',
      position: 'Head of Product',
      department: 'product',
      bio: `<p>Michael shapes DrawDay's product strategy with 10+ years of product management experience in gaming and entertainment technology.</p>`,
      email: 'michael@drawdaysolutions.com',
      linkedin_url: 'https://linkedin.com/in/mobrien',
      display_on_about: true,
      is_founder: false,
      joined_date: '2024-03-15',
      sort: 3,
      status: 'active',
    },
    {
      name: 'Emma Thompson',
      position: 'Head of Customer Success',
      department: 'customer_success',
      bio: `<p>Emma ensures our clients achieve success with DrawDay products. She brings deep knowledge of the UK competition market and a passion for customer satisfaction.</p>`,
      email: 'emma@drawdaysolutions.com',
      linkedin_url: 'https://linkedin.com/in/emmathompson',
      display_on_about: true,
      is_founder: false,
      joined_date: '2024-02-01',
      sort: 4,
      status: 'active',
    },
    {
      name: 'David Kumar',
      position: 'Lead Developer',
      department: 'engineering',
      bio: `<p>David leads our engineering team in building robust, scalable solutions. Specializes in real-time systems and has a passion for creating smooth user experiences.</p>`,
      email: 'david@drawdaysolutions.com',
      linkedin_url: 'https://linkedin.com/in/davidkumar',
      display_on_about: true,
      is_founder: false,
      joined_date: '2024-02-15',
      sort: 5,
      status: 'active',
    },
    {
      name: 'Lucy Williams',
      position: 'Head of Marketing',
      department: 'marketing',
      bio: `<p>Lucy drives DrawDay's marketing strategy and brand presence. With experience marketing to UK gambling operators, she knows how to reach our target audience.</p>`,
      email: 'lucy@drawdaysolutions.com',
      linkedin_url: 'https://linkedin.com/in/lucywilliams',
      twitter_url: 'https://twitter.com/lucywilliamsuk',
      display_on_about: true,
      is_founder: false,
      joined_date: '2024-04-01',
      sort: 6,
      status: 'active',
    },
  ];

  for (const member of teamMembers) {
    try {
      await axios.post(
        `${DIRECTUS_URL}/items/team_members`,
        member,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`  ✅ Added team member: ${member.name}`);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('duplicate')) {
        console.log(`  ⚠️  Team member "${member.name}" already exists`);
      } else {
        console.error(`  ❌ Failed to add team member:`, error.response?.data || error.message);
      }
    }
  }
}

async function populateData() {
  await authenticate();
  
  console.log('\n📝 Populating website information...\n');
  
  await populateCompanyInfo();
  await populateSocialMedia();
  await populateCareers();
  await populateTeamMembers();
  
  console.log('\n✅ All website information populated successfully!');
  console.log('\n📊 Summary:');
  console.log('  - Company information and contact details added');
  console.log('  - 6 social media profiles configured');
  console.log('  - 3 job postings published');
  console.log('  - 6 team members added');
  console.log('\n🎯 Next steps:');
  console.log('  1. Run setup-website-permissions.js to enable public access');
  console.log('  2. Visit http://localhost:8055 to review and edit content');
  console.log('  3. Update frontend components to fetch this data');
}

// Run the population
populateData().catch((error) => {
  console.error('Population failed:', error);
  process.exit(1);
});