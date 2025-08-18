import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionAuthProvider } from './providers/auth-provider';
import { SidePanelWithPersistence } from './pages/SidePanelWithPersistence';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ExtensionAuthProvider>
      <SidePanelWithPersistence />
    </ExtensionAuthProvider>
  </React.StrictMode>
);
