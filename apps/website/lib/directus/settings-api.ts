/**
 * Settings API for fetching site settings and company info from Directus
 */

import { BaseDirectusClient } from './base-client';
import { SiteSettings, CompanyInfo, SocialMediaProfile } from './types';
import { defaultContent } from './defaults';

export class SettingsAPI extends BaseDirectusClient {
  async getSiteSettings(): Promise<SiteSettings | null> {
    return this.fetchWithCache('site_settings', async () => {
      const data = await this.fetchFromDirectus<SiteSettings>('site_settings');
      if (!data) {
        console.log('Using default site settings');
        return defaultContent.siteSettings;
      }
      return data;
    });
  }

  async getCompanyInfo(): Promise<CompanyInfo | null> {
    return this.fetchWithCache('company_info', async () => {
      const data = await this.fetchFromDirectus<CompanyInfo>('company_info');
      if (!data) {
        console.log('No company info found');
        return null;
      }
      return data;
    });
  }

  async getSocialMedia(): Promise<SocialMediaProfile[]> {
    return this.fetchWithCache('social_media', async () => {
      const data = await this.fetchFromDirectus<SocialMediaProfile[]>('social_media');
      if (!data || !Array.isArray(data)) {
        return [];
      }
      return data.sort((a, b) => a.order - b.order);
    });
  }
}
