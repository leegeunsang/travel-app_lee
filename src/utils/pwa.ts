// PWA utilities

export const registerServiceWorker = async () => {
  // Check if we're in a supported environment
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported in this browser');
    return null;
  }

  // Skip Service Worker registration in Figma preview environment
  if (window.location.hostname.includes('figma.site') || 
      window.location.hostname.includes('localhost')) {
    console.log('⚠️ Service Worker skipped in preview environment');
    console.log('💡 Deploy to Vercel/Netlify to enable PWA features');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('✅ Service Worker registered successfully:', registration);
    
    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New content available, please refresh.');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    // Gracefully handle registration errors
    console.log('⚠️ Service Worker registration failed (this is normal in preview)');
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
