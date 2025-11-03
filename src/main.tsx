import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { registerServiceWorker } from './utils/pwa';

// Register Service Worker for PWA
if (import.meta.env.PROD) {
  registerServiceWorker().then((registration) => {
    if (registration) {
      console.log('✅ PWA enabled! You can now install this app on your device.');
    }
  });
} else {
  console.log('🔧 Development mode: Service Worker disabled');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
