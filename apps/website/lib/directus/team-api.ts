/**
 * Team & Careers API for fetching team and career content from Directus
 */

import { BaseDirectusClient } from './base-client';
import { CareerPosting, TeamMember } from './types';

export class TeamAPI extends BaseDirectusClient {
  async getCareers(): Promise<CareerPosting[]> {
    return this.fetchWithCache('careers', async () => {
      const data = await this.fetchFromDirectus<CareerPosting[]>('careers');
      if (!data || !Array.isArray(data)) {
        return [];
      }
      return data.filter((career) => career.is_active);
    });
  }

  async getCareer(slug: string): Promise<CareerPosting | null> {
    return this.fetchWithCache(`career_${slug}`, async () => {
      const careers = await this.getCareers();
      return careers.find((career) => career.slug === slug) || null;
    });
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return this.fetchWithCache('team_members', async () => {
      const data = await this.fetchFromDirectus<TeamMember[]>('team_members');
      if (!data || !Array.isArray(data)) {
        return [];
      }
      return data.sort((a, b) => a.order - b.order);
    });
  }
}
