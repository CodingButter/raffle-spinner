import { Metadata } from 'next';
import { Card, CardContent } from '@drawday/ui';
// Privacy policy would be fetched from Directus in production

export const metadata: Metadata = {
  title: 'Privacy Policy - DrawDay Spinner',
  description: 'Privacy Policy for DrawDay Spinner - Your data protection and privacy rights',
};

export default async function PrivacyPolicyPage() {
  // This runs at build time, not on each request
  // TODO: Fetch from Directus once backend is configured
  const policy = {
    id: '1',
    title: 'Privacy Policy',
    content: '',
    version: '1.0.0',
    effectiveDate: '2024-01-01',
    lastUpdated: '2024-01-01',
    sections: [
      {
        id: 'intro',
        title: 'Introduction',
        content:
          'DrawDay Spinner ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Chrome extension.',
        order: 1,
      },
      {
        id: 'data-collection',
        title: 'Data Collection',
        content:
          'We collect minimal data necessary to provide our service. All competition data and participant information is stored locally in your browser using Chrome storage APIs. We do not transmit this data to external servers.',
        order: 2,
      },
      {
        id: 'data-use',
        title: 'How We Use Your Data',
        content:
          'Your data is used solely for the operation of the DrawDay Spinner extension. This includes:\n• Storing competition configurations\n• Managing participant lists\n• Tracking winners during live draws\n• Maintaining your preferences and settings',
        order: 3,
      },
      {
        id: 'data-security',
        title: 'Data Security',
        content:
          "We implement appropriate technical and organizational security measures to protect your data. All data is stored locally on your device using Chrome's secure storage mechanisms.",
        order: 4,
      },
      {
        id: 'contact',
        title: 'Contact Us',
        content:
          'If you have any questions about this Privacy Policy, please contact us at privacy@drawday.app',
        order: 5,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{policy.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Version: {policy.version}</span>
              <span>
                Effective Date: {new Date(policy.effectiveDate).toLocaleDateString('en-GB')}
              </span>
              <span>Last Updated: {new Date(policy.lastUpdated).toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {policy.sections.map((section) => (
              <section key={section.id} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-white">{section.title}</h2>
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
