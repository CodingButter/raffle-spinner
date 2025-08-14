/**
 * Main Directus Client that combines all API modules
 */

import { ContentAPI } from './content-api';
import { SettingsAPI } from './settings-api';
import { TeamAPI } from './team-api';

export class DirectusClient {
  public content: ContentAPI;
  public settings: SettingsAPI;
  public team: TeamAPI;

  constructor() {
    this.content = new ContentAPI();
    this.settings = new SettingsAPI();
    this.team = new TeamAPI();
  }

  // Convenience methods for backward compatibility
  async getHomepage() {
    return this.content.getHomepage();
  }

  async getFeaturesPage() {
    return this.content.getFeaturesPage();
  }

  async getDemoPage() {
    return this.content.getDemoPage();
  }

  async getFooterContent() {
    return this.content.getFooterContent();
  }

  async getSiteSettings() {
    return this.settings.getSiteSettings();
  }

  async getCompanyInfo() {
    return this.settings.getCompanyInfo();
  }

  async getSocialMedia() {
    return this.settings.getSocialMedia();
  }

  async getCareers() {
    return this.team.getCareers();
  }

  async getCareer(slug: string) {
    return this.team.getCareer(slug);
  }

  async getTeamMembers() {
    return this.team.getTeamMembers();
  }
}

// Export singleton instance
export const directus = new DirectusClient();
