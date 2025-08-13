import { NextResponse } from 'next/server';
import { PrivacyPolicyContent } from '@/lib/api/types';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Read Privacy Policy data from JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'privacy-policy.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const privacyData = JSON.parse(fileContent);
    
    // Transform to match PrivacyPolicyContent type
    const privacyContent: PrivacyPolicyContent = {
      id: '1',
      title: privacyData.title,
      content: '', // Main content is in sections
      version: '1.0.0',
      effectiveDate: privacyData.effectiveDate,
      lastUpdated: privacyData.lastUpdated,
      sections: privacyData.sections.map((section: any, index: number) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        order: index + 1,
      })),
    };
    
    return NextResponse.json(privacyContent);
  } catch (error) {
    console.error('Error reading Privacy Policy data:', error);
    
    // Fallback to basic privacy policy if file read fails
    const fallbackPolicy: PrivacyPolicyContent = {
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
    
    return NextResponse.json(fallbackPolicy);
  }
}