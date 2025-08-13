import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@raffle-spinner/auth/client';
import { SidePanel } from './pages/SidePanel';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider config={{ mockMode: true }}>
      <SidePanel />
    </AuthProvider>
  </React.StrictMode>
);
