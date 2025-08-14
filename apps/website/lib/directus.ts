/**
 * Directus API client - Re-export from modular structure
 *
 * This file maintains backward compatibility while using the new modular structure
 */

export {
  directus,
  DirectusClient,
  defaultContent,
  type HomepageContent,
  type FeaturesPageContent,
  type DemoPageContent,
  type SiteSettings,
  type CompanyInfo,
  type SocialMediaProfile,
  type CareerPosting,
  type TeamMember,
  type FooterContent,
} from './directus/index';
