/**
 * DrawDay Solutions Homepage
 *
 * Main company website showcasing all services and products
 * Content is dynamically fetched from Directus CMS
 */

import DrawDayHomePageServer from '@/components/DrawDayHomePageServer';
import { directus, defaultContent } from '@/lib/directus';
import { Metadata } from 'next';

// Generate metadata from CMS content
export async function generateMetadata(): Promise<Metadata> {
  const content = await directus.getHomepage();

  return {
    title: content?.seo_title || defaultContent.homepage.seo_title,
    description: content?.seo_description || defaultContent.homepage.seo_description,
    keywords:
      'UK raffle software, competition technology, live draw software, streaming production, raffle websites',
  };
}

export default function Home() {
  return <DrawDayHomePageServer />;
}
