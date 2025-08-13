import { Metadata } from 'next';
import { Card, CardContent } from '@raffle-spinner/ui';
import { fetchPrivacyPolicy } from '@/lib/api/server';

export const metadata: Metadata = {
  title: 'Privacy Policy - DrawDay Spinner',
  description: 'Privacy Policy for DrawDay Spinner - Your data protection and privacy rights',
};

export default async function PrivacyPolicyPage() {
  // This runs at build time, not on each request
  let policy;
  
  try {
    policy = await fetchPrivacyPolicy();
  } catch (error) {
    // Fallback content if fetch fails
    policy = {
      id: '1',
      title: 'Privacy Policy',
      content: '',
      version: '1.0.0',
      effectiveDate: '2024-01-01',
      lastUpdated: '2024-01-01',
      sections: [
        {
          id: 'error',
          title: 'Privacy Policy Temporarily Unavailable',
          content: 'We apologize, but our privacy policy is temporarily unavailable. Please contact privacy@drawday.app for assistance.',
          order: 1,
        }
      ],
    };
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{policy.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Version: {policy.version}</span>
              <span>Effective Date: {new Date(policy.effectiveDate).toLocaleDateString('en-GB')}</span>
              <span>Last Updated: {new Date(policy.lastUpdated).toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {policy.sections.map((section) => (
              <section key={section.id} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  {section.title}
                </h2>
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-400 text-center">
              Your privacy is important to us. Contact us at privacy@drawday.app with any questions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}