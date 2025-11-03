// Geolocation utility functions

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationAddress {
  region: string; // 시/도
  city: string; // 시/군/구
  fullAddress: string;
}

export class LocationPermissionError extends Error {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
  
  constructor(message: string, code: LocationPermissionError['code']) {
    super(message);
    this.name = 'LocationPermissionError';
    this.code = code;
  }
}

/**
 * Check if we should use default location (development mode)
 * Returns true if USE_DEFAULT_LOCATION is set or if we're in Figma Make environment
 */
const shouldUseDefaultLocation = (): boolean => {
  // Safely check for development mode flag
  let isDevelopment = false;
  try {
    isDevelopment = import.meta?.env?.VITE_USE_DEFAULT_LOCATION === 'true';
  } catch (e) {
    // import.meta might not be available in some environments
    isDevelopment = false;
  }
  
  // Check if we're in Figma Make or similar preview environment
  const isFigmaPreview = window.location.hostname.includes('figma') || 
                         window.location.hostname.includes('preview');
  
  return isDevelopment || isFigmaPreview;
};

/**
 * Get current position using browser Geolocation API
 * In development mode or Figma Make environment, returns Seoul City Hall coordinates
 */
export const getCurrentPosition = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    // Use default location in development/preview mode
    if (shouldUseDefaultLocation()) {
      console.log('[Geolocation] Using default location (Seoul City Hall) for development/preview');
      resolve({
        latitude: 37.5665,  // Seoul City Hall
        longitude: 126.9780
      });
      return;
    }

    if (!navigator.geolocation) {
      reject(new LocationPermissionError(
        'Geolocation is not supported by this browser',
        'NOT_SUPPORTED'
      ));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        let errorCode: LocationPermissionError['code'] = 'POSITION_UNAVAILABLE';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            errorCode = 'PERMISSION_DENIED';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            errorCode = 'POSITION_UNAVAILABLE';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            errorCode = 'TIMEOUT';
            break;
        }
        
        reject(new LocationPermissionError(errorMessage, errorCode));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Convert coordinates to address using server API
 */
export const coordsToAddress = async (
  coords: Coordinates,
  projectId: string,
  publicAnonKey: string
): Promise<LocationAddress> => {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/coords-to-address`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
    });

    if (!response.ok) {
      console.warn(`Server returned status ${response.status}, using fallback`);
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.warn('Server returned error, using fallback:', data.error);
      // Return fallback data from server
      return {
        region: data.region || '서울',
        city: data.city || '',
        fullAddress: data.fullAddress || '서울',
      };
    }

    return {
      region: data.region,
      city: data.city,
      fullAddress: data.fullAddress,
    };
  } catch (error) {
    // Use warn instead of error for network issues
    console.warn('Error converting coordinates to address:', error instanceof Error ? error.message : error);
    throw error;
  }
};

/**
 * Get current location and convert to region name
 */
export const getCurrentLocationRegion = async (
  projectId: string,
  publicAnonKey: string
): Promise<LocationAddress> => {
  try {
    const coords = await getCurrentPosition();
    const address = await coordsToAddress(coords, projectId, publicAnonKey);
    return address;
  } catch (error) {
    // Don't log permission denied errors to console as they're expected user actions
    if (error instanceof LocationPermissionError && error.code === 'PERMISSION_DENIED') {
      // Silently pass through permission errors
      throw error;
    }
    
    // Log other types of errors
    console.warn('Error getting current location region:', error);
    throw error;
  }
};
