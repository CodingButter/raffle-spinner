import { Metadata } from 'next';
import { Card, CardContent } from '@drawday/ui';
// Terms of service would be fetched from Directus in production

export const metadata: Metadata = {
  title: 'Terms of Service - DrawDay Spinner',
  description:
    'Terms of Service for DrawDay Spinner - Professional live draw management for UK competitions',
};

export default async function TermsOfServicePage() {
  // This runs at build time, not on each request
  // TODO: Fetch from Directus once backend is configured
  const tos = {
    id: '1',
    title: 'Terms of Service',
    content: '',
    version: '1.0.0',
    effectiveDate: '2024-01-01',
    lastUpdated: '2024-01-01',
    sections: [
      {
        id: 'acceptance',
        title: 'Acceptance of Terms',
        content:
          'By using DrawDay Spinner, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.',
        order: 1,
      },
      {
        id: 'service-description',
        title: 'Service Description',
        content:
          'DrawDay Spinner is a Chrome extension designed to facilitate live draws for UK competitions. The service allows users to import participant data, conduct randomized selections, and track winners.',
        order: 2,
      },
      {
        id: 'use-restrictions',
        title: 'Use Restrictions',
        content:
          'You agree to use DrawDay Spinner only for lawful purposes and in accordance with these Terms. You may not:\n• Use the service for any illegal or unauthorized purpose\n• Violate any laws in your jurisdiction\n• Attempt to interfere with the proper working of the service',
        order: 3,
      },
      {
        id: 'intellectual-property',
        title: 'Intellectual Property',
        content:
          'The DrawDay Spinner service and its original content, features, and functionality are owned by DrawDay and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.',
        order: 4,
      },
      {
        id: 'disclaimer',
        title: 'Disclaimer',
        content:
          'DrawDay Spinner is provided "as is" without any warranties, express or implied. We do not warrant that the service will be uninterrupted, timely, secure, or error-free.',
        order: 5,
      },
      {
        id: 'changes',
        title: 'Changes to Terms',
        content:
          'We reserve the right to modify these terms at any time. We will notify users of any material changes by updating the "Last Updated" date of these Terms of Service.',
        order: 6,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{tos.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Version: {tos.version}</span>
              <span>Effective Date: {new Date(tos.effectiveDate).toLocaleDateString('en-GB')}</span>
              <span>Last Updated: {new Date(tos.lastUpdated).toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {tos.sections.map((section) => (
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
              By using DrawDay Spinner, you agree to these Terms of Service.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
