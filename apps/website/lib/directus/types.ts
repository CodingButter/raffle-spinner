/**
 * Directus CMS Type Definitions
 */

export interface HomepageContent {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  features_title: string;
  features_subtitle: string;
  features_list: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  cta_button_link: string;
  seo_title: string;
  seo_description: string;
}

export interface FeaturesPageContent {
  page_title: string;
  page_subtitle: string;
  features: Array<{
    category: string;
    title: string;
    description: string;
    is_pro: boolean;
  }>;
  pricing_section_title: string;
  pricing_plans: Array<{
    name: string;
    price: string;
    period: string;
    features: string[];
    cta_text: string;
    is_popular: boolean;
  }>;
  seo_title: string;
  seo_description: string;
}

export interface DemoPageContent {
  page_title: string;
  page_subtitle: string;
  demo_instructions: string;
  sample_data_title: string;
  sample_data_description: string;
  video_url?: string;
  testimonials: Array<{
    author: string;
    company: string;
    content: string;
    rating: number;
  }>;
  seo_title: string;
  seo_description: string;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  social_links: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
  };
  analytics_id?: string;
  maintenance_mode: boolean;
  maintenance_message?: string;
}

export interface CompanyInfo {
  company_name: string;
  tagline: string;
  registration_number: string;
  vat_number: string;
  email: string;
  phone: string;
  support_email: string;
  sales_email: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code: string;
  country: string;
  business_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export interface SocialMediaProfile {
  id?: string;
  platform: string;
  url: string;
  username?: string;
  icon?: string;
  order: number;
  display_in_footer?: boolean;
}

export interface CareerPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  benefits: string[];
  salary_range?: string;
  slug: string;
  posted_date: string;
  closing_date?: string;
  is_active: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  linkedin_url?: string;
  twitter_url?: string;
  order: number;
}

export interface FooterContent {
  copyright_text: string;
  description: string;
  newsletter_title: string;
  newsletter_subtitle: string;
  links: {
    column_1_title: string;
    column_1_links: Array<{ text: string; url: string }>;
    column_2_title: string;
    column_2_links: Array<{ text: string; url: string }>;
    column_3_title: string;
    column_3_links: Array<{ text: string; url: string }>;
  };
  legal_links: Array<{ text: string; url: string }>;
}
