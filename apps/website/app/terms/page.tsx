import { Metadata } from 'next';
import { Card, CardContent } from '@raffle-spinner/ui';
import { fetchTermsOfService } from '@/lib/api/server';

export const metadata: Metadata = {
  title: 'Terms of Service - DrawDay Spinner',
  description: 'Terms of Service for DrawDay Spinner - Professional live draw management for UK competitions',
};

export default async function TermsOfServicePage() {
  // This runs at build time, not on each request
  let tos;
  
  try {
    tos = await fetchTermsOfService();
  } catch (error) {
    // Fallback content if fetch fails
    tos = {
      id: '1',
      title: 'Terms of Service',
      content: '',
      version: '1.0.0',
      effectiveDate: '2024-01-01',
      lastUpdated: '2024-01-01',
      sections: [
        {
          id: 'error',
          title: 'Terms Temporarily Unavailable',
          content: 'We apologize, but our terms of service are temporarily unavailable. Please contact support@drawday.app for assistance.',
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
              By using DrawDay Spinner, you agree to these Terms of Service.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}