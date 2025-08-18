# DrawDay Spinner Subscription System - User Experience Specification

## Overview

This document defines the complete user experience for the DrawDay Spinner subscription system, covering the interaction between the Chrome extension, website dashboard, and subscription management.

## User Journey

### 1. Account Creation & Initial Setup

#### 1.1 New User Registration

**Expected Behavior:**

- User visits drawday.app and creates an account
- Upon registration, user automatically gets a **Free Trial** status
- Free trial includes:
  - 7-day trial period
  - Access to basic spinner functionality
  - Limited to 100 contestants per raffle
  - Limited to 2 raffles total during trial
  - Basic branding/customization features
  - No API support

**Success Criteria:**

- ✅ User account created with trial status
- ✅ Trial expiration date set to 7 days from registration
- ✅ User receives welcome email with extension download link
- ✅ Dashboard shows trial status and remaining days

#### 1.2 Extension Installation

**Expected Behavior:**

- User downloads Chrome extension from dashboard or Chrome Web Store
- User installs extension and opens it
- Extension prompts for login with DrawDay account
- After login, extension automatically detects user's subscription status
- Extension UI adapts to show available features based on subscription

**Success Criteria:**

- ✅ Extension authenticates with user's DrawDay account
- ✅ Extension displays correct subscription tier in UI
- ✅ Extension shows trial countdown if user is on trial
- ✅ Features are enabled/disabled based on subscription limits

### 2. Subscription Management (Dashboard)

#### 2.1 Dashboard Subscription Overview

**Expected Behavior:**

- Dashboard clearly displays current subscription status:
  - **Free Trial**: Shows days remaining, trial features, upgrade prompt
  - **Starter Plan**: Shows plan features, usage statistics, upgrade options
  - **Pro Plan**: Shows full feature access, usage statistics, billing info
- Usage tracking shows:
  - Number of raffles conducted (with limits)
  - Total contestants processed
  - API calls made (Pro only)
- Clear upgrade/downgrade options

**Success Criteria:**

- ✅ Subscription status prominently displayed
- ✅ Usage statistics accurate and real-time
- ✅ Clear feature comparison between tiers
- ✅ One-click upgrade/downgrade functionality

#### 2.2 Subscription Purchase Flow

**Expected Behavior:**

- User clicks "Upgrade" from dashboard or trial banner
- Stripe checkout opens with plan options:
  - **Starter Plan**: £9.99/month
    - 1000 contestants per raffle
    - 50 raffles per month
    - Full branding/customization
    - Email support
  - **Pro Plan**: £19.99/month
    - Unlimited contestants
    - Unlimited raffles
    - API access
    - Priority support
    - Advanced analytics
- After successful payment:
  - Dashboard immediately reflects new subscription
  - Extension automatically unlocks new features
  - User receives confirmation email

**Success Criteria:**

- ✅ Smooth Stripe checkout experience
- ✅ Immediate activation after payment
- ✅ Automatic feature unlocking in extension
- ✅ Proper billing management (pause, cancel, change plan)

### 3. Extension Feature Behavior

#### 3.1 Feature Access Control

**Expected Behavior:**

##### Free Trial Users:

- ✅ Can import CSV files up to 100 contestants
- ✅ Can conduct up to 2 raffles total
- ✅ Basic spinner customization (colors, fonts)
- ✅ Basic branding (logo upload)
- ❌ Advanced customization locked
- ❌ API features disabled
- ❌ Bulk operations disabled

##### Starter Plan Users:

- ✅ Can import CSV files up to 1000 contestants
- ✅ Can conduct up to 50 raffles per month
- ✅ Full branding and customization features
- ✅ All spinner visual options
- ✅ Export winner data
- ❌ API features disabled
- ❌ Advanced analytics disabled

##### Pro Plan Users:

- ✅ Unlimited contestants per raffle
- ✅ Unlimited raffles per month
- ✅ All customization and branding features
- ✅ API access for integrations
- ✅ Advanced analytics and reporting
- ✅ Bulk raffle management
- ✅ Priority support features

#### 3.2 Limit Enforcement

**Expected Behavior:**

- When user approaches limits:
  - **90% of limit**: Show warning notification
  - **100% of limit**: Block action with upgrade prompt
- Specific limit checks:
  - CSV import validates contestant count before processing
  - Raffle creation checks monthly/total limits
  - API calls tracked and blocked when exceeded
- Clear error messages explain limits and upgrade benefits

**Success Criteria:**

- ✅ Limits enforced in real-time
- ✅ Clear warnings before hitting limits
- ✅ Graceful degradation when limits reached
- ✅ Helpful upgrade prompts with benefit explanations

### 4. Real-Time Synchronization

#### 4.1 Subscription Status Sync

**Expected Behavior:**

- Extension checks subscription status on:
  - Initial login/startup
  - Before each major action (import, raffle creation)
  - Every 5 minutes during active use
  - After receiving sync notification from dashboard
- Dashboard updates immediately reflect in extension:
  - Plan upgrades unlock features instantly
  - Plan downgrades apply limits immediately
  - Billing issues pause features gracefully

**Success Criteria:**

- ✅ Subscription changes sync within 30 seconds
- ✅ Extension never shows stale subscription data
- ✅ Graceful handling of network interruptions
- ✅ Clear feedback when sync is happening

#### 4.2 Usage Tracking

**Expected Behavior:**

- Extension reports usage to backend:
  - Raffle completion (with contestant count)
  - API calls made
  - Feature usage statistics
- Dashboard shows real-time usage updates
- Monthly limits reset automatically
- Usage history maintained for billing transparency

**Success Criteria:**

- ✅ Accurate usage tracking and reporting
- ✅ Real-time dashboard updates
- ✅ Proper monthly reset functionality
- ✅ Historical usage data available

### 5. Error Handling & Edge Cases

#### 5.1 Payment Issues

**Expected Behavior:**

- Failed payments:
  - Grace period of 3 days for retry
  - Extension shows payment issue banner
  - Features remain active during grace period
  - Clear payment retry instructions
- Cancelled subscriptions:
  - Immediate downgrade to previous tier
  - Data preserved for 30 days
  - Re-subscription restores full access

#### 5.2 Network & Sync Issues

**Expected Behavior:**

- Offline extension use:
  - Continue with last known subscription level
  - Queue usage tracking for when online
  - Show "offline mode" indicator
- Sync conflicts:
  - Server data takes precedence
  - Clear user notification of changes
  - Graceful feature lock/unlock

### 6. User Interface Requirements

#### 6.1 Dashboard Subscription Section

**Required Elements:**

- Current plan badge with tier name and status
- Usage meters with clear progress bars
- Feature comparison table
- Billing history and next payment date
- One-click upgrade/downgrade buttons
- Cancel subscription option
- Support contact information

#### 6.2 Extension Subscription UI

**Required Elements:**

- Subscription tier indicator in header
- Usage counters for relevant limits
- Feature lock indicators with upgrade prompts
- Sync status indicator
- Quick link to dashboard subscription page

#### 6.3 Upgrade Prompts

**Required Elements:**

- Clear benefit explanations
- Pricing information
- "Upgrade Now" call-to-action
- "Learn More" link to pricing page
- Dismissible but persistent reminders

### 7. Success Metrics

#### 7.1 Conversion Metrics

- Trial to paid conversion rate > 15%
- Free to Starter conversion rate > 10%
- Starter to Pro upgrade rate > 25%
- Monthly churn rate < 5%

#### 7.2 User Experience Metrics

- Subscription sync time < 30 seconds
- Feature unlock time < 10 seconds after payment
- Support ticket reduction due to clear UX
- User satisfaction score > 4.5/5

### 8. Technical Implementation Requirements

#### 8.1 Data Flow

1. User registration creates subscription record with trial status
2. Extension authenticates and fetches subscription data
3. Extension caches subscription data with TTL
4. Dashboard subscription changes trigger extension sync
5. Usage events from extension update backend counters
6. Stripe webhooks update subscription status immediately

#### 8.2 API Endpoints Required

- `GET /api/auth/me` - User data with subscription info
- `POST /api/subscriptions/sync` - Force subscription sync
- `POST /api/usage/track` - Track feature usage
- `GET /api/usage/stats` - Get usage statistics
- `POST /api/subscriptions/upgrade` - Initiate plan upgrade
- `POST /api/subscriptions/cancel` - Cancel subscription

#### 8.3 Extension Architecture

- Subscription context provider for React components
- Background script for sync and usage tracking
- Storage layer for offline capability
- Feature guard components for conditional rendering
- Subscription service for API communication

## Implementation Checklist

### Phase 1: Foundation

- [ ] Update subscription data models
- [ ] Create subscription API endpoints
- [ ] Implement usage tracking system
- [ ] Build dashboard subscription section
- [ ] Set up Stripe integration

### Phase 2: Extension Integration

- [ ] Build subscription context for extension
- [ ] Implement feature guards and limits
- [ ] Add subscription sync mechanism
- [ ] Create upgrade prompts and UI
- [ ] Build usage tracking in extension

### Phase 3: Polish & Testing

- [ ] End-to-end subscription flow testing
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] User acceptance testing
- [ ] Documentation and support materials

## Definition of Done

The subscription system is complete when:

1. ✅ A new user can register, install extension, and use trial features
2. ✅ User can upgrade subscription from dashboard with immediate feature unlock
3. ✅ Extension enforces limits and prompts for upgrades appropriately
4. ✅ Subscription status syncs between dashboard and extension in real-time
5. ✅ Usage tracking is accurate and visible in dashboard
6. ✅ All edge cases (payment failures, cancellations) are handled gracefully
7. ✅ User experience is smooth and intuitive throughout the entire journey

This specification serves as the definitive guide for subscription system implementation and acceptance criteria.
