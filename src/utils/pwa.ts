// PWA utilities

export const registerServiceWorker = async () => {
  // Check if we're in a supported environment
  if (!('serviceWorker' in navigator)) {
    console.log('❌ Service Workers not supported in this browser');
    return null;
  }

  // Skip Service Worker registration in development/preview environment
  if (window.location.hostname.includes('figma.site') || 
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1')) {
    console.log('⚠️ Service Worker skipped in preview/development environment');
    console.log('💡 Deploy to production (Vercel/Netlify) to enable PWA features');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // Always check for SW updates
    });
    
    console.log('✅ Service Worker registered successfully!');
    console.log('📱 PWA enabled! You can now install this app on your device.');
    
    // Force immediate update if available
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New version available! Auto-updating...');
            
            // Send message to skip waiting immediately
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            
            // Auto reload after 1 second
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      }
    });
    
    // Check for updates on focus
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      console.log('[PWA] Controller changed, reloading...');
      window.location.reload();
    });
    
    // Check for updates immediately and periodically
    registration.update();
    setInterval(() => {
      registration.update();
    }, 30000); // Check every 30 seconds

    return registration;
  } catch (error) {
    // Gracefully handle registration errors
    console.log('⚠️ Service Worker registration failed');
    console.error(error);
    console.log('💡 PWA features will work after deployment to production');
    return null;
  }
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service Worker unregistered');
  }
};

export const checkPWADisplayMode = () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInAppBrowser = 'standalone' in window.navigator && (window.navigator as any).standalone;
  
  return isStandalone || isInAppBrowser;
};

export const isPWAInstalled = () => {
  return checkPWADisplayMode();
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Show notification
export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
};

// Add to home screen prompt
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isInStandaloneMode = () => {
  return checkPWADisplayMode();
};
