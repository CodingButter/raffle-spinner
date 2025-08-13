/**
 * Server-side API functions for fetching data at build time
 * These functions will be used for static generation and will
 * eventually connect to the backend API
 */

import { TOSContent, PrivacyPolicyContent } from './types';
import fs from 'fs/promises';
import path from 'path';

// Base URL for the backend API (will be configured via environment variable)
const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001/api';

/**
 * Fetch Terms of Service from backend (currently reads from JSON file)
 * This function runs at build time for static generation
 */
export async function fetchTermsOfService(): Promise<TOSContent> {
  try {
    // TODO: Replace with actual backend API call when ready
    // const response = await fetch(`${API_BASE_URL}/legal/tos`, {
    //   next: { revalidate: 86400 } // Revalidate once per day
    // });
    // const data = await response.json();
    // return data;

    // For now, read from JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'terms-of-service.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const tosData = JSON.parse(fileContent);
    
    return {
      id: '1',
      title: tosData.title,
      content: '',
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
  } catch (error) {
    console.error('Error fetching Terms of Service:', error);
    throw new Error('Failed to fetch Terms of Service');
  }
}

/**
 * Fetch Privacy Policy from backend (currently reads from JSON file)
 * This function runs at build time for static generation
 */
export async function fetchPrivacyPolicy(): Promise<PrivacyPolicyContent> {
  try {
    // TODO: Replace with actual backend API call when ready
    // const response = await fetch(`${API_BASE_URL}/legal/privacy`, {
    //   next: { revalidate: 86400 } // Revalidate once per day
    // });
    // const data = await response.json();
    // return data;

    // For now, read from JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'privacy-policy.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const privacyData = JSON.parse(fileContent);
    
    return {
      id: '1',
      title: privacyData.title,
      content: '',
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
  } catch (error) {
    console.error('Error fetching Privacy Policy:', error);
    throw new Error('Failed to fetch Privacy Policy');
  }
}

/**
 * Submit contact form to backend
 * This will be called from the API route handler
 */
export async function submitContactFormToBackend(formData: any): Promise<any> {
  try {
    // TODO: Replace with actual backend API call when ready
    // const response = await fetch(`${API_BASE_URL}/contact`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(formData),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to submit contact form');
    // }
    // 
    // return await response.json();

    // For now, return mock response
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      success: true,
      message: 'Thank you for contacting us. We will get back to you within 24-48 hours.',
      ticketId,
      estimatedResponseTime: '24-48 hours',
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw new Error('Failed to submit contact form');
  }
}