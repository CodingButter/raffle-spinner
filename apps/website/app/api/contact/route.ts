import { NextRequest, NextResponse } from 'next/server';
import { ContactFormData, ContactFormResponse } from '@/lib/api/types';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields are required',
          error: 'Missing required fields',
        } as ContactFormResponse,
        { status: 400 }
      );
    }

    // Validate email format
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide a valid email address',
          error: 'Invalid email format',
        } as ContactFormResponse,
        { status: 400 }
      );
    }

    // Validate message length
    if (body.message.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'Message must be at least 10 characters long',
          error: 'Message too short',
        } as ContactFormResponse,
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock ticket ID
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Log the submission (in production, this would save to database)
    console.log('Contact form submission:', {
      ...body,
      ticketId,
      timestamp: new Date().toISOString(),
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We\'ll get back to you within 24-48 hours.',
      ticketId,
    } as ContactFormResponse);

  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while processing your request',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ContactFormResponse,
      { status: 500 }
    );
  }
}