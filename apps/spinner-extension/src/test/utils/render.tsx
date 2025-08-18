/**
 * Custom Test Render Utilities
 * 
 * Provides enhanced render functions that wrap components
 * with necessary providers and mocks for testing.
 */

import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { CompetitionProvider } from '@raffle-spinner/contexts';
import { SettingsProvider } from '@raffle-spinner/contexts';
import { ThemeProvider } from '@raffle-spinner/contexts';
import { SessionProvider } from '@raffle-spinner/contexts';
import { SubscriptionProvider } from '@raffle-spinner/contexts';

/**
 * Custom render options extending RTL's options
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Initial provider states
  initialCompetition?: any;
  initialSettings?: any;
  initialTheme?: any;
  initialSession?: any;
  initialSubscription?: any;
  // Control which providers to include
  withProviders?: {
    competition?: boolean;
    settings?: boolean;
    theme?: boolean;
    session?: boolean;
    subscription?: boolean;
  };
}

/**
 * Test wrapper component that includes all necessary providers
 */
const createWrapper = (options: CustomRenderOptions) => {
  return ({ children }: { children: React.ReactNode }) => {
    let wrapped = children;

    const providers = options.withProviders || {
      competition: true,
      settings: true,
      theme: true,
      session: true,
      subscription: true,
    };

    if (providers.subscription) {
      wrapped = (
        <SubscriptionProvider>
          {wrapped}
        </SubscriptionProvider>
      );
    }

    if (providers.session) {
      wrapped = (
        <SessionProvider>
          {wrapped}
        </SessionProvider>
      );
    }

    if (providers.theme) {
      wrapped = (
        <ThemeProvider>
          {wrapped}
        </ThemeProvider>
      );
    }

    if (providers.settings) {
      wrapped = (
        <SettingsProvider>
          {wrapped}
        </SettingsProvider>
      );
    }

    if (providers.competition) {
      wrapped = (
        <CompetitionProvider>
          {wrapped}
        </CompetitionProvider>
      );
    }

    return <>{wrapped}</>;
  };
};

/**
 * Custom render function that wraps components with providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const Wrapper = createWrapper(options);
  
  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...options }),
    // Expose mock functions for testing
    mocks: {
      storage: global.chrome.storage.local,
      runtime: global.chrome.runtime,
      tabs: global.chrome.tabs,
    },
  };
};

/**
 * Render hook with providers
 */
export const renderHookWithProviders = (
  hook: () => any,
  options: CustomRenderOptions = {}
) => {
  const Wrapper = createWrapper(options);
  
  let result: any;
  const TestComponent = () => {
    result = hook();
    return null;
  };

  renderWithProviders(<TestComponent />, options);
  
  return {
    result,
    rerender: () => {
      renderWithProviders(<TestComponent />, options);
      return result;
    },
  };
};

/**
 * Utility to wait for Chrome storage operations
 */
export const waitForStorage = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Utility to simulate Chrome runtime messages
 */
export const simulateMessage = (message: any, sender?: any) => {
  const chrome = global.chrome as any;
  if (chrome.runtime._simulateMessage) {
    chrome.runtime._simulateMessage(message, sender);
  }
};

/**
 * Utility to setup storage with initial data
 */
export const setupStorage = (data: Record<string, any>) => {
  const chrome = global.chrome as any;
  if (chrome.storage.local._setData) {
    chrome.storage.local._setData(data);
  }
};

/**
 * Utility to get current storage state
 */
export const getStorageState = () => {
  const chrome = global.chrome as any;
  if (chrome.storage.local._getData) {
    return chrome.storage.local._getData();
  }
  return {};
};

// Re-export everything from RTL for convenience
export * from '@testing-library/react';
export { renderWithProviders as render };