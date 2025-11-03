/**
 * Kakao Maps SDK Loader
 * Simple loader that waits for SDK preloaded in index.html
 */

declare global {
  interface Window {
    kakao: any;
    KAKAO_SDK_LOADED?: boolean;
  }
}

/**
 * Wait for Kakao Maps SDK to be ready
 * SDK should be preloaded in index.html
 */
export function loadKakaoMaps(): Promise<void> {
  console.log('[KakaoLoader] Checking SDK status...');
  
  // Already available
  if (window.kakao && window.kakao.maps) {
    console.log('[KakaoLoader] ✅ SDK is already available');
    return Promise.resolve();
  }

  console.log('[KakaoLoader] ⏳ Waiting for SDK to be available...');
  console.log('[KakaoLoader] window.kakao:', window.kakao);
  console.log('[KakaoLoader] KAKAO_SDK_LOADED flag:', window.KAKAO_SDK_LOADED);

  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds - increased timeout for better reliability
    
    const checkInterval = setInterval(() => {
      attempts++;

      if (window.kakao && window.kakao.maps) {
        clearInterval(checkInterval);
        console.log(`[KakaoLoader] ✅ SDK ready after ${attempts * 100}ms`);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        
        // Enhanced debugging information
        const scripts = document.querySelectorAll('script[src*="kakao"]');
        const scriptsSrc = Array.from(scripts).map((s: any) => s.src);
        
        console.error(`[KakaoLoader] ❌ Timeout after ${maxAttempts * 100}ms`);
        console.error('[KakaoLoader] Debug info:', {
          scriptsInDom: scripts.length,
          scriptUrls: scriptsSrc,
          windowKakao: typeof window.kakao,
          sdkLoadedFlag: window.KAKAO_SDK_LOADED,
          currentDomain: window.location.origin
        });
        
        console.error('[KakaoLoader] ');
        console.error('[KakaoLoader] 🚨 MOST COMMON ISSUE: Domain not registered!');
        console.error('[KakaoLoader] ');
        console.error('[KakaoLoader] 📋 TO FIX:');
        console.error('[KakaoLoader] 1️⃣ Visit: https://developers.kakao.com/');
        console.error('[KakaoLoader] 2️⃣ Select your app');
        console.error('[KakaoLoader] 3️⃣ Go to: Platform Settings → Web');
        console.error('[KakaoLoader] 4️⃣ Register domain: ' + window.location.origin);
        console.error('[KakaoLoader] 5️⃣ Save and refresh this page');
        console.error('[KakaoLoader] ');
        console.error('[KakaoLoader] 💡 For detailed diagnosis: ' + window.location.origin + '/#kakao-debug');
        
        reject(new Error(
          'Kakao Maps SDK not available. ' +
          'Most likely cause: Domain not registered at https://developers.kakao.com/. ' +
          'Current domain: ' + window.location.origin
        ));
      } else if (attempts % 20 === 0) {
        console.log(`[KakaoLoader] ⏳ Still waiting... (${attempts * 100}ms)`);
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
    throw new Error('Kakao Maps SDK not ready. Call loadKakaoMaps() first.');
  }
  return window.kakao.maps;
}
