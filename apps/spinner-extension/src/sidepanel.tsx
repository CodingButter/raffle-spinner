import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionAuthProvider } from './providers/auth-provider';
import { SidePanel } from './pages/SidePanel';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ExtensionAuthProvider>
      <SidePanel />
    </ExtensionAuthProvider>
  </React.StrictMode>
);
