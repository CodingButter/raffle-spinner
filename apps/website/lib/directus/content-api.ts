/**
 * Content API for fetching page content from Directus
 */

import { BaseDirectusClient } from './base-client';
import { HomepageContent, FeaturesPageContent, DemoPageContent, FooterContent } from './types';
import { defaultContent } from './defaults';

export class ContentAPI extends BaseDirectusClient {
  async getHomepage(): Promise<HomepageContent | null> {
    return this.fetchWithCache('homepage', async () => {
      const data = await this.fetchFromDirectus<HomepageContent>('homepage');
      if (!data) {
        console.log('Using default homepage content');
        return defaultContent.homepage;
      }
      return data;
    });
  }

  async getFeaturesPage(): Promise<FeaturesPageContent | null> {
    return this.fetchWithCache('features_page', async () => {
      const data = await this.fetchFromDirectus<FeaturesPageContent>('features_page');
      if (!data) {
        console.log('No features page content found');
        return null;
      }
      return data;
    });
  }

  async getDemoPage(): Promise<DemoPageContent | null> {
    return this.fetchWithCache('demo_page', async () => {
      const data = await this.fetchFromDirectus<DemoPageContent>('demo_page');
      if (!data) {
        console.log('No demo page content found');
        return null;
      }
      return data;
    });
  }

  async getFooterContent(): Promise<FooterContent | null> {
    return this.fetchWithCache('footer', async () => {
      const data = await this.fetchFromDirectus<FooterContent>('footer');
      if (!data) {
        console.log('No footer content found');
        return null;
      }
      return data;
    });
  }
}
