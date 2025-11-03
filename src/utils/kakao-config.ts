/**
 * Kakao API Configuration
 * Safely retrieves Kakao API keys from environment variables
 */

/**
 * Get Kakao JavaScript Key for client-side map display
 * @returns Kakao JS Key or empty string if not configured
 */
export function getKakaoJsKey(): string {
  // Try to get from environment variable first
  const envKey = import.meta.env?.VITE_KAKAO_JS_KEY;
  
  // Fallback to hardcoded key if env var is not set
  const fallbackKey = "94e86b9b6ddf71039ab09c9902d2d79f";
  
  const key = envKey || fallbackKey;
  
  if (!envKey) {
    console.info("ℹ️ Using fallback Kakao JS Key (VITE_KAKAO_JS_KEY not set)");
  }
  
  return key;
}

/**
 * Check if Kakao Maps can be loaded
 * @returns true if API key is configured
 */
export function isKakaoMapsAvailable(): boolean {
  return !!getKakaoJsKey();
}
