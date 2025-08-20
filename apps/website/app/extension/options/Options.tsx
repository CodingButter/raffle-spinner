import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionAuthProvider } from './providers/auth-provider';
import { OptionsPage } from './pages/OptionsPage';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ExtensionAuthProvider>
      <OptionsPage />
    </ExtensionAuthProvider>
  </React.StrictMode>
);
