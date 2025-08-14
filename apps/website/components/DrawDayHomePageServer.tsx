/**
 * DrawDay Solutions Homepage - Server Component
 *
 * Fetches content from Directus CMS and renders the homepage
 */

import { directus, defaultContent } from '@/lib/directus';
import { Homepage } from '@/components/pages/homepage';
import type { HomepageContent } from '@/lib/directus';

export default async function DrawDayHomePageServer() {
  // Fetch content from Directus or use defaults
  let content: HomepageContent;
  try {
    const fetchedContent = await directus.getHomepage();
    content = fetchedContent || defaultContent.homepage;
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    content = defaultContent.homepage;
  }

  return <Homepage content={content} />;
}