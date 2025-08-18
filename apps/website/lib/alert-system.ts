/**
 * CRITICAL: Alert System for Integration Health
 * Robert Wilson - Prevents 3 AM incidents with proactive alerting
 */

import { recordError } from './metrics-collector';

interface AlertThresholds {
  webhook_failure_rate: number; // Percentage
  api_response_time: number; // Milliseconds
  error_count_per_hour: number;
  circuit_breaker_open_duration: number; // Minutes
}

interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  message: string;
  threshold_breached: string;
  current_value: string;
  timestamp: string;
  acknowledged: boolean;
}

// Default thresholds that prevent 3 AM wake-ups
const DEFAULT_THRESHOLDS: AlertThresholds = {
  webhook_failure_rate: 5.0, // Alert if >5% webhooks fail
  api_response_time: 3000, // Alert if >3 seconds
  error_count_per_hour: 10, // Alert if >10 errors per hour
  circuit_breaker_open_duration: 5 // Alert if circuit breaker open >5 minutes
};

class AlertManager {
  private thresholds: AlertThresholds;
  private activeAlerts: Map<string, Alert> = new Map();

  constructor(thresholds: AlertThresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
  }

  /**
   * Check webhook metrics and trigger alerts if needed
   */
  async checkWebhookHealth(metrics: {
    success_rate: number;
    avg_processing_time: number;
    failed_count: number;
  }): Promise<void> {
    const failureRate = 100 - metrics.success_rate;
    
    // Check webhook failure rate
    if (failureRate > this.thresholds.webhook_failure_rate) {
      await this.triggerAlert({
        severity: failureRate > 15 ? 'critical' : 'high',
        service: 'webhook-processing',
        message: `Webhook failure rate is ${failureRate.toFixed(1)}%`,
        threshold_breached: `failure_rate > ${this.thresholds.webhook_failure_rate}%`,
        current_value: `${failureRate.toFixed(1)}%`
      });
    }

    // Check webhook processing time
    if (metrics.avg_processing_time > this.thresholds.api_response_time) {
      await this.triggerAlert({
        severity: metrics.avg_processing_time > 5000 ? 'high' : 'medium',
        service: 'webhook-processing',
        message: `Webhook processing time is ${metrics.avg_processing_time}ms`,
        threshold_breached: `processing_time > ${this.thresholds.api_response_time}ms`,
        current_value: `${metrics.avg_processing_time}ms`
      });
    }
  }

  /**
   * Check API health and trigger alerts
   */
  async checkApiHealth(service: string, metrics: {
    response_time: number;
    error_rate: number;
    status: string;
  }): Promise<void> {
    // Check if service is down
    if (metrics.status === 'down') {
      await this.triggerAlert({
        severity: 'critical',
        service,
        message: `${service} API is DOWN`,
        threshold_breached: 'service_status = down',
        current_value: 'down'
      });
      return;
    }

    // Check response time
    if (metrics.response_time > this.thresholds.api_response_time) {
      await this.triggerAlert({
        severity: metrics.response_time > 10000 ? 'high' : 'medium',
        service,
        message: `${service} API response time is ${metrics.response_time}ms`,
        threshold_breached: `response_time > ${this.thresholds.api_response_time}ms`,
        current_value: `${metrics.response_time}ms`
      });
    }

    // Check error rate
    if (metrics.error_rate > 1.0) {
      await this.triggerAlert({
        severity: metrics.error_rate > 5 ? 'high' : 'medium',
        service,
        message: `${service} API error rate is ${metrics.error_rate}%`,
        threshold_breached: 'error_rate > 1.0%',
        current_value: `${metrics.error_rate}%`
      });
    }
  }

  /**
   * Trigger an alert and handle notifications
   */
  private async triggerAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): Promise<void> {
    const alertId = `${alertData.service}_${alertData.severity}_${Date.now()}`;
    const alert: Alert = {
      ...alertData,
      id: alertId,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    // Prevent duplicate alerts for the same issue
    const existingAlertKey = `${alertData.service}_${alertData.threshold_breached}`;
    if (this.activeAlerts.has(existingAlertKey)) {
      console.log(`🔕 Suppressing duplicate alert: ${alertData.message}`);
      return;
    }

    this.activeAlerts.set(existingAlertKey, alert);

    // Log alert
    console.log(`🚨 ALERT [${alert.severity.toUpperCase()}] ${alert.service}: ${alert.message}`);

    // Record in error tracking system
    await recordError({
      service: alert.service,
      error_type: alert.severity === 'critical' ? 'critical' : 'warning',
      message: `ALERT: ${alert.message}`,
      timestamp: alert.timestamp,
      request_id: alert.id
    });

    // Send notifications based on severity
    await this.sendNotifications(alert);

    // Auto-clear alert after 1 hour to prevent spam
    setTimeout(() => {
      this.activeAlerts.delete(existingAlertKey);
    }, 60 * 60 * 1000);
  }

  /**
   * Send notifications via various channels
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    try {
      // Console notification (always)
      const severityEmoji = {
        low: '🔔',
        medium: '⚠️',
        high: '🚨',
        critical: '💥'
      };

      console.log(`${severityEmoji[alert.severity]} ALERT: ${alert.message}`);
      console.log(`   Service: ${alert.service}`);
      console.log(`   Threshold: ${alert.threshold_breached}`);
      console.log(`   Current: ${alert.current_value}`);
      console.log(`   Time: ${alert.timestamp}`);

      // TODO: Implement additional notification channels:
      
      // Email notifications for high/critical alerts
      if (alert.severity === 'high' || alert.severity === 'critical') {
        await this.sendEmailAlert(alert);
      }

      // Slack/Discord notifications for critical alerts
      if (alert.severity === 'critical') {
        await this.sendSlackAlert(alert);
      }

      // SMS/PagerDuty for critical production issues
      if (alert.severity === 'critical' && process.env.NODE_ENV === 'production') {
        await this.sendSMSAlert(alert);
      }

    } catch (error) {
      console.error('Failed to send alert notifications:', error);
    }
  }

  /**
   * Send email alert (placeholder implementation)
   */
  private async sendEmailAlert(alert: Alert): Promise<void> {
    // TODO: Implement actual email sending
    console.log(`📧 Email alert would be sent: ${alert.message}`);
    
    // Example implementation:
    // const emailService = new EmailService();
    // await emailService.send({
    //   to: process.env.ALERT_EMAIL,
    //   subject: `[${alert.severity.toUpperCase()}] DrawDay Alert: ${alert.service}`,
    //   body: `Alert: ${alert.message}\nTime: ${alert.timestamp}\nThreshold: ${alert.threshold_breached}`
    // });
  }

  /**
   * Send Slack alert (placeholder implementation)
   */
  private async sendSlackAlert(alert: Alert): Promise<void> {
    // TODO: Implement actual Slack webhook
    console.log(`💬 Slack alert would be sent: ${alert.message}`);
    
    // Example implementation:
    // const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    // if (slackWebhook) {
    //   await fetch(slackWebhook, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       text: `🚨 *${alert.severity.toUpperCase()} ALERT*`,
    //       attachments: [{
    //         color: alert.severity === 'critical' ? 'danger' : 'warning',
    //         fields: [
    //           { title: 'Service', value: alert.service, short: true },
    //           { title: 'Message', value: alert.message, short: false },
    //           { title: 'Current Value', value: alert.current_value, short: true },
    //           { title: 'Time', value: alert.timestamp, short: true }
    //         ]
    //       }]
    //     })
    //   });
    // }
  }

  /**
   * Send SMS alert (placeholder implementation)
   */
  private async sendSMSAlert(alert: Alert): Promise<void> {
    // TODO: Implement actual SMS/PagerDuty integration
    console.log(`📱 SMS alert would be sent: ${alert.message}`);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): void {
    for (const [key, alert] of this.activeAlerts.entries()) {
      if (alert.id === alertId) {
        alert.acknowledged = true;
        console.log(`✅ Alert acknowledged: ${alert.message}`);
        break;
      }
    }
  }
}

// Export singleton instance
export const alertManager = new AlertManager();

// Export types for use in other modules
export type { Alert, AlertThresholds };