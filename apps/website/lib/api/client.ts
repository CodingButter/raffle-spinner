/**
 * API Client for Website
 * 
 * This client will handle all API calls to the backend.
 * Currently uses Next.js API routes as placeholders.
 */

import { 
  TOSContent, 
  ContactFormData, 
  ContactFormResponse,
  PrivacyPolicyContent,
  ApiResponse 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchJson<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Fetch Terms of Service content
   */
  async getTOS(): Promise<ApiResponse<TOSContent>> {
    return this.fetchJson<TOSContent>('/tos');
  }

  /**
   * Fetch Privacy Policy content
   */
  async getPrivacyPolicy(): Promise<ApiResponse<PrivacyPolicyContent>> {
    return this.fetchJson<PrivacyPolicyContent>('/privacy');
  }

  /**
   * Submit contact form
   */
  async submitContactForm(formData: ContactFormData): Promise<ContactFormResponse> {
    const response = await this.fetchJson<ContactFormResponse>('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (response.success && response.data) {
      return response.data;
    }

    return {
      success: false,
      message: response.error || 'Failed to submit form',
      error: response.error,
    };
  }

  /**
   * Subscribe to newsletter
   */
  async subscribeNewsletter(email: string): Promise<ApiResponse<{ subscribed: boolean }>> {
    return this.fetchJson<{ subscribed: boolean }>('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;