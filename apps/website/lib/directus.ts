/**
 * Directus API client for fetching CMS content
 */

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

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
    timezone: string;
    support_hours: string;
  };
  founded_year: number;
  about_text: string;
}

export interface SocialMediaProfile {
  id: number;
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok' | 'discord' | 'telegram' | 'github';
  username: string;
  url: string;
  display_in_footer: boolean;
  display_in_header: boolean;
  follower_count?: number;
  sort: number;
  status: 'active' | 'archived';
}

export interface CareerPosting {
  id: number;
  position_title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salary_range?: string;
  description: string;
  requirements: Array<{ requirement: string }>;
  benefits: Array<{ benefit: string }>;
  application_deadline?: string;
  posted_date: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  application_url: string;
  sort: number;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  bio?: string;
  photo_url?: string;
  email?: string;
  linkedin_url?: string;
  twitter_url?: string;
  display_on_about: boolean;
  is_founder: boolean;
  joined_date?: string;
  sort: number;
  status: 'active' | 'inactive';
}

class DirectusClient {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute cache

  constructor() {
    this.baseUrl = DIRECTUS_URL;
  }

  private async fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // If fetch fails and we have cached data, return it even if expired
      if (cached) {
        console.warn(`Using expired cache for ${key} due to fetch error:`, error);
        return cached.data as T;
      }
      throw error;
    }
  }

  async getHomepage(): Promise<HomepageContent | null> {
    return this.fetchWithCache('homepage', async () => {
      try {
        const response = await fetch(`${this.baseUrl}/items/homepage`, {
          next: { revalidate: 60 }, // Next.js ISR - revalidate every minute
        });

        if (!response.ok) {
          console.error('Failed to fetch homepage:', response.status);
          return null;
        }

        const data = await response.json();
        const content = data.data;

        // Parse JSON strings if needed
        if (typeof content.features_list === 'string') {
          content.features_list = JSON.parse(content.features_list);
        }

        return content;
      } catch (error) {
        console.error('Error fetching homepage:', error);
        return null;
      }
    });
  }

  async getFeaturesPage(): Promise<FeaturesPageContent | null> {
    return this.fetchWithCache('features_page', async () => {
      try {
        const response = await fetch(`${this.baseUrl}/items/features_page`, {
          next: { revalidate: 60 },
        });

        if (!response.ok) {
          console.error('Failed to fetch features page:', response.status);
          return null;
        }

        const data = await response.json();
        const content = data.data;

        // Parse JSON strings if needed
        if (typeof content.features === 'string') {
          content.features = JSON.parse(content.features);
        }
        if (typeof content.pricing_plans === 'string') {
          content.pricing_plans = JSON.parse(content.pricing_plans);
        }

        return content;
      } catch (error) {
        console.error('Error fetching features page:', error);
        return null;
      }
    });
  }

  async getDemoPage(): Promise<DemoPageContent | null> {
    return this.fetchWithCache('demo_page', async () => {
      try {
        const response = await fetch(`${this.baseUrl}/items/demo_page`, {
          next: { revalidate: 60 },
        });

        if (!response.ok) {
          console.error('Failed to fetch demo page:', response.status);
          return null;
        }

        const data = await response.json();
        const content = data.data;

        // Parse JSON strings if needed
        if (typeof content.testimonials === 'string') {
          content.testimonials = JSON.parse(content.testimonials);
        }

        return content;
      } catch (error) {
        console.error('Error fetching demo page:', error);
        return null;
      }
    });
  }

  async getSiteSettings(): Promise<SiteSettings | null> {
    return this.fetchWithCache('site_settings', async () => {
      try {
        const response = await fetch(`${this.baseUrl}/items/site_settings`, {
          next: { revalidate: 60 },
        });

        if (!response.ok) {
          console.error('Failed to fetch site settings:', response.status);
          return null;
        }

        const data = await response.json();
        const content = data.data;

        // Parse JSON strings if needed
        if (typeof content.social_links === 'string') {
          content.social_links = JSON.parse(content.social_links);
        }

        return content;
      } catch (error) {
        console.error('Error fetching site settings:', error);
        return null;
      }
    });
  }

  // Get company information
  async getCompanyInfo(): Promise<CompanyInfo | null> {
    return this.fetchWithCache('company_info', async () => {
      try {
        const response = await fetch(`${this.baseUrl}/items/company_info`, {
          next: { revalidate: 60 },
        });

        if (!response.ok) {
          console.error('Failed to fetch company info:', response.status);
          return null;
        }

        const data = await response.json();
        const content = data.data;

        // Parse JSON strings if needed
        if (typeof content.business_hours === 'string') {
          content.business_hours = JSON.parse(content.business_hours);
        }

        return content;
      } catch (error) {
        console.error('Error fetching company info:', error);
        return null;
      }
    });
  }

  // Get social media profiles
  async getSocialMedia(): Promise<SocialMediaProfile[]> {
    return this.fetchWithCache('social_media', async () => {
      try {
        const response = await fetch(`${this.baseUrl}/items/social_media?filter[status][_eq]=active&sort=sort`, {
          next: { revalidate: 60 },
        });

        if (!response.ok) {
          console.error('Failed to fetch social media:', response.status);
          return [];
        }

        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching social media:', error);
        return [];
      }
    });
  }

  // Get career postings
  async getCareers(): Promise<CareerPosting[]> {
    return this.fetchWithCache('careers', async () => {
      try {
        const response = await fetch(`${this.baseUrl}/items/careers?filter[status][_eq]=published&sort=sort`, {
          next: { revalidate: 60 },
        });

        if (!response.ok) {
          console.error('Failed to fetch careers:', response.status);
          return [];
        }

        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching careers:', error);
        return [];
      }
    });
  }

  // Get single career posting by slug
  async getCareer(slug: string): Promise<CareerPosting | null> {
    return this.fetchWithCache(`career_${slug}`, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/items/careers?filter[slug][_eq]=${slug}&filter[status][_eq]=published`,
          {
            next: { revalidate: 60 },
          }
        );

        if (!response.ok) {
          console.error('Failed to fetch career:', response.status);
          return null;
        }

        const data = await response.json();
        return data.data?.[0] || null;
      } catch (error) {
        console.error('Error fetching career:', error);
        return null;
      }
    });
  }

  // Get team members
  async getTeamMembers(): Promise<TeamMember[]> {
    return this.fetchWithCache('team_members', async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/items/team_members?filter[status][_eq]=active&filter[display_on_about][_eq]=true&sort=sort`,
          {
            next: { revalidate: 60 },
          }
        );

        if (!response.ok) {
          console.error('Failed to fetch team members:', response.status);
          return [];
        }

        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching team members:', error);
        return [];
      }
    });
  }

  // Helper method to check if backend is available
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/server/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const directus = new DirectusClient();

// Export default content for fallback
export const defaultContent = {
  homepage: {
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
    ],
    cta_title: 'Ready to Transform Your Live Draws?',
    cta_description: "Join the UK's leading raffle companies using DrawDay Solutions",
    cta_button_text: 'Get Started Today',
    cta_button_link: '/contact',
    seo_title: 'DrawDay Solutions - Technology Partner for UK Raffle Companies',
    seo_description: 'Complete technology solutions for UK raffle companies. Live draw software, streaming production, and custom websites.',
  },
  siteSettings: {
    site_name: 'DrawDay Solutions',
    tagline: 'Professional Technology for UK Raffle Companies',
    logo_url: '/logo.svg',
    favicon_url: '/favicon.png',
    social_links: {
      twitter: 'https://twitter.com/drawdaysolutions',
      facebook: 'https://facebook.com/drawdaysolutions',
      linkedin: 'https://linkedin.com/company/drawday-solutions',
      youtube: 'https://youtube.com/@drawdaysolutions',
    },
    analytics_id: '',
    maintenance_mode: false,
    maintenance_message: "We are currently performing scheduled maintenance. We'll be back shortly!",
  }
};