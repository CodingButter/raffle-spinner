import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionAuthProvider } from './providers/auth-provider';
import { OptionsPage } from './pages/OptionsPage';
import './app.css';

// Verify Chrome mocks in development mode
if (import.meta.env.DEV) {
  import('./dev/verify-mocks.js').then(module => {
    // eslint-disable-next-line no-console
    console.log('[Options] Chrome mocks verification:', module.default ? '✅' : '❌');
  }).catch(() => {
    // Verification module doesn't exist in production, which is fine
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ExtensionAuthProvider>
      <OptionsPage />
    </ExtensionAuthProvider>
  </React.StrictMode>
);
