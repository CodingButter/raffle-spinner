import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/app.css';
import { chromeStorageMock } from '../src/test/mocks/chrome-storage';
import { chromeRuntimeMock } from '../src/test/mocks/chrome-runtime';
import { chromeTabsMock } from '../src/test/mocks/chrome-tabs';

// Setup Chrome API mocks for Storybook
(global as any).chrome = {
  storage: {
    local: chromeStorageMock,
    sync: chromeStorageMock,
    managed: chromeStorageMock,
    session: chromeStorageMock,
  },
  runtime: chromeRuntimeMock,
  tabs: chromeTabsMock,
  sidePanel: {
    open: () => Promise.resolve(),
    setOptions: () => Promise.resolve(),
    setPanelBehavior: () => Promise.resolve(),
  },
  action: {
    onClicked: {
      addListener: () => {},
      removeListener: () => {},
    },
    setBadgeText: () => Promise.resolve(),
    setBadgeBackgroundColor: () => Promise.resolve(),
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#1a1a2e',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
    viewport: {
      viewports: {
        extensionSidePanel: {
          name: 'Extension Side Panel',
          styles: {
            width: '400px',
            height: '600px',
          },
        },
        extensionOptions: {
          name: 'Extension Options Page',
          styles: {
            width: '1200px',
            height: '800px',
          },
        },
      },
      defaultViewport: 'extensionSidePanel',
    },
  },
  decorators: [
    (Story) => {
      // Reset mocks before each story
      chromeStorageMock._reset();
      chromeRuntimeMock._reset();
      chromeTabsMock._reset();
      
      return <Story />;
    },
  ],
};

export default preview;