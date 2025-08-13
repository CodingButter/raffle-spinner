/**
 * API Types for Website
 */

export interface TOSContent {
  id: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: TOSSection[];
}

export interface TOSSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: 'general' | 'support' | 'sales' | 'partnership' | 'other';
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  ticketId?: string;
  error?: string;
}

export interface PrivacyPolicyContent {
  id: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: PolicySection[];
}

export interface PolicySection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}