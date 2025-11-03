import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
// import { registerServiceWorker } from './utils/pwa';

// ⚠️ PWA TEMPORARILY DISABLED - Fixing deployment issues
// Service Worker will be re-enabled after deployment is confirmed working
console.log('⚠️ PWA features temporarily disabled');
console.log('📱 App will work normally, just without offline support');

// Register Service Worker for PWA
// Only in production (deployed sites)
// if (import.meta.env.PROD) {
//   console.log('[PWA] Production mode: Registering Service Worker...');
//   registerServiceWorker().then((registration) => {
//     if (registration) {
//       console.log('✅ PWA enabled! You can now install this app on your device.');
//       console.log('🔄 If you see old content, visit: /force-clear.html');
//     }
//   }).catch((error) => {
//     console.error('[PWA] Registration failed:', error);
//   });
// } else {
//   console.log('🔧 Development mode: Service Worker disabled');
//   console.log('💡 To enable PWA features, deploy to production (Vercel/Netlify)');
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
