/**
 * Spinner Product Page
 *
 * The original spinner product showcase page
 * Now lives at /spinner as part of DrawDay Solutions suite
 */

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'DrawDay Spinner - Professional Live Draw Software',
  description:
    'The ultimate Chrome extension for UK raffle companies. Run fair, transparent, and exciting live draws with our professional spinner software.',
};

export default function SpinnerPage() {
  // Redirect to main page as content is now served from CMS
  redirect('/');
}
