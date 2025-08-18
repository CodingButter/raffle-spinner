import { NextRequest, NextResponse } from 'next/server';
import { alertManager } from '@/lib/alert-system';

export async function GET(request: NextRequest) {
  try {
    const activeAlerts = alertManager.getActiveAlerts();
    
    return NextResponse.json({
      alerts: activeAlerts,
      count: activeAlerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get alerts:', error);
    return NextResponse.json({
      error: 'Failed to retrieve alerts'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { alertId, action } = await request.json();
    
    if (action === 'acknowledge' && alertId) {
      alertManager.acknowledgeAlert(alertId);
      return NextResponse.json({ 
        success: true, 
        message: 'Alert acknowledged' 
      });
    }
    
    return NextResponse.json({
      error: 'Invalid action or missing alertId'
    }, { status: 400 });
  } catch (error) {
    console.error('Failed to process alert action:', error);
    return NextResponse.json({
      error: 'Failed to process alert action'
    }, { status: 500 });
  }
}