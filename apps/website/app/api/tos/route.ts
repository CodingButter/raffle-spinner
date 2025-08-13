import { NextResponse } from 'next/server';
import { TOSContent } from '@/lib/api/types';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Read TOS data from JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'terms-of-service.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const tosData = JSON.parse(fileContent);
    
    // Transform to match TOSContent type
    const tosContent: TOSContent = {
      id: '1',
      title: tosData.title,
      content: '', // Main content is in sections
      version: '1.0.0',
      effectiveDate: tosData.effectiveDate,
      lastUpdated: tosData.lastUpdated,
      sections: tosData.sections.map((section: any, index: number) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        order: index + 1,
      })),
    };
    
    return NextResponse.json(tosContent);
  } catch (error) {
    console.error('Error reading TOS data:', error);
    
    // Fallback to basic TOS if file read fails
    const fallbackTos: TOSContent = {
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
    
    return NextResponse.json(fallbackTos);
  }
}