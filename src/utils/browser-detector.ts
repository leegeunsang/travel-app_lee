// Browser detection utilities

export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';

/**
 * Detect current browser
 */
export const detectBrowser = (): BrowserType => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.indexOf('edg/') > -1 || userAgent.indexOf('edge/') > -1) {
    return 'edge';
  }
  
  if (userAgent.indexOf('opr/') > -1 || userAgent.indexOf('opera/') > -1) {
    return 'opera';
  }
  
  if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edg/') === -1) {
    return 'chrome';
  }
  
  if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
    return 'safari';
  }
  
  if (userAgent.indexOf('firefox') > -1) {
    return 'firefox';
  }

  return 'unknown';
};

/**
 * Get location permission instructions for the current browser
 */
export const getLocationPermissionInstructions = (): {
  browser: string;
  emoji: string;
  steps: string[];
} => {
  const browser = detectBrowser();

  switch (browser) {
    case 'chrome':
      return {
        browser: 'Chrome',
        emoji: '🌐',
        steps: [
          '주소창 왼쪽의 자물쇠 아이콘 클릭',
          '"사이트 설정" 선택',
          '"위치" 권한을 "허용"으로 변경',
          '페이지 새로고침 (F5)',
        ],
      };
    
    case 'firefox':
      return {
        browser: 'Firefox',
        emoji: '🦊',
        steps: [
          '주소창 왼쪽의 자물쇠 아이콘 클릭',
          '"권한" > "위치 접근" 옆의 X 클릭',
          '페이지 새로고침하여 다시 허용',
        ],
      };
    
    case 'safari':
      return {
        browser: 'Safari',
        emoji: '🧭',
        steps: [
          'Safari > 환경설정 > 웹사이트 > 위치',
          '해당 사이트를 "허용"으로 변경',
          '페이지 새로고침',
        ],
      };
    
    case 'edge':
      return {
        browser: 'Edge',
        emoji: '🌊',
        steps: [
          '주소창 왼쪽의 자물쇠 아이콘 클릭',
          '"이 사이트의 권한" 선택',
          '"위치" 권한을 "허용"으로 변경',
          '페이지 새로고침',
        ],
      };
    
    case 'opera':
      return {
        browser: 'Opera',
        emoji: '🎭',
        steps: [
          '주소창 왼쪽의 자물쇠 아이콘 클릭',
          '"사이트 설정" 선택',
          '"위치" 권한을 "허용"으로 변경',
          '페이지 새로고침',
        ],
      };
    
    default:
      return {
        browser: '브라우저',
        emoji: '🌐',
        steps: [
          '브라우저 설정에서 위치 권한 찾기',
          '이 사이트의 위치 권한을 허용으로 변경',
          '페이지 새로고침',
        ],
      };
  }
};

/**
 * Check if browser is mobile
 */
export const isMobileBrowser = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};
