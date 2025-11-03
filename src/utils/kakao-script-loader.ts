/**
 * Kakao Maps SDK Dynamic Script Loader
 * Loads the SDK dynamically from React instead of index.html
 * This works better in iframe environments like Figma
 */

declare global {
  interface Window {
    kakao: any;
    KAKAO_SDK_LOADED?: boolean;
  }
}

const KAKAO_MAP_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';
const KAKAO_APP_KEY = '94e86b9b6ddf71039ab09c9902d2d79f';

let loadPromise: Promise<void> | null = null;
let isLoading = false;
let isLoaded = false;
let scriptAdded = false; // NEW: Track if we've already added the script to DOM

/**
 * Dynamically load Kakao Maps SDK
 * Uses singleton pattern to ensure only one load attempt
 */
export function loadKakaoMapScript(): Promise<void> {
  // Already loaded successfully
  if (isLoaded && window.kakao && window.kakao.maps) {
    return Promise.resolve();
  }

  // Currently loading - return existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Script already added to DOM - don't add again!
  if (scriptAdded || document.querySelector('script[src*="dapi.kakao.com"]')) {
    // Check if kakao exists now
    if (window.kakao && window.kakao.maps) {
      isLoaded = true;
      scriptAdded = true;
      return Promise.resolve();
    }
    
    // Script exists but not working - silently fail (REST API fallback will be used)
    scriptAdded = true;
    return Promise.reject(new Error('Kakao Maps SDK script in DOM but not loading'));
  }

  isLoading = true;
  scriptAdded = true; // Mark as added immediately

  loadPromise = new Promise((resolve, reject) => {
    // Create script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `${KAKAO_MAP_SDK_URL}?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`;
    script.async = true;

    // Success handler
    script.onload = () => {
      // Wait for kakao object to be available
      if (window.kakao && window.kakao.maps) {
        // Use load() for autoload=false
        try {
          window.kakao.maps.load(() => {
            isLoaded = true;
            isLoading = false;
            window.KAKAO_SDK_LOADED = true;
            resolve();
          });
        } catch (error) {
          isLoading = false;
          reject(error);
        }
      } else {
        // Silently fail - this is expected in Figma preview environment
        // The app will automatically use REST API fallback
        isLoading = false;
        reject(new Error('Kakao SDK not available'));
      }
    };

    // Error handler
    script.onerror = () => {
      // Silently fail - this is expected in Figma preview environment
      // The app will automatically use REST API fallback
      isLoading = false;
      reject(new Error('Failed to load Kakao Maps SDK script'));
    };

    // Add to DOM
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Wait for Kakao Maps SDK to be ready
 */
export async function waitForKakaoMaps(timeoutMs: number = 15000): Promise<void> {
  
  // First, try to load the script
  try {
    await loadKakaoMapScript();
    return;
  } catch (error) {
    // Silently fail - REST API fallback will be used
  }

  // Fallback: wait for it to appear
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkInterval = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        clearInterval(checkInterval);
        isLoaded = true;
        resolve();
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        
        // Silently timeout - REST API fallback will be used
        reject(new Error('Kakao Maps SDK timeout'));
      }
    }, 100);
  });
}

/**
 * Check if SDK is ready (synchronous)
 */
export function isKakaoMapsReady(): boolean {
  return !!(window.kakao && window.kakao.maps);
}

/**
 * Get Kakao Maps API
 */
export function getKakaoMaps() {
  if (!isKakaoMapsReady()) {
    throw new Error('Kakao Maps SDK not ready. Call waitForKakaoMaps() first.');
  }
  return window.kakao.maps;
}

/**
 * Remove script from DOM (for cleanup/retry)
 */
export function removeKakaoScript() {
  const scripts = document.querySelectorAll('script[src*="dapi.kakao.com"]');
  scripts.forEach(script => script.remove());
  isLoading = false;
  isLoaded = false;
  loadPromise = null;
  scriptAdded = false;
  window.KAKAO_SDK_LOADED = false;
}
