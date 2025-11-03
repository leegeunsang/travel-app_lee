/**
 * Kakao REST API Utilities
 * These functions use the server-side REST API instead of the client-side SDK
 * This bypasses the domain registration requirement for the JavaScript SDK
 */

import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277`;

interface KakaoApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
  address: string;
  roadAddress: string;
}

interface PlaceDetails {
  name: string;
  address: string;
  roadAddress: string;
  phone: string;
  category: string;
  lat: number;
  lng: number;
  placeUrl: string;
  id: string;
}

interface DirectionsResult {
  distance: number; // meters
  duration: number; // seconds
  fare?: number;
  isFallback: boolean;
  error?: string;
}

/**
 * Convert address to coordinates using Kakao REST API
 * @param address - Korean address string
 * @returns Coordinates with lat, lng, and address info
 */
export async function addressToCoordinates(address: string): Promise<KakaoApiResponse<Coordinates>> {
  try {
    const response = await fetch(`${BASE_URL}/kakao/address-to-coord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ address })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Address to coordinates error:', result);
      return { success: false, error: result.error || 'Failed to convert address' };
    }

    return result;
  } catch (error) {
    console.error('Address to coordinates exception:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Get directions between two points using Kakao Mobility API
 * @param origin - Starting point {lat, lng}
 * @param destination - End point {lat, lng}
 * @param priority - Route priority: "RECOMMEND" | "TIME" | "DISTANCE"
 * @returns Distance, duration, and fare information
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  priority: 'RECOMMEND' | 'TIME' | 'DISTANCE' = 'RECOMMEND'
): Promise<KakaoApiResponse<DirectionsResult>> {
  try {
    const response = await fetch(`${BASE_URL}/kakao/directions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ origin, destination, priority })
    });

    const result = await response.json();
    
    if (!response.ok && !result.success) {
      console.error('Directions error:', result);
      return { success: false, error: result.error || 'Failed to get directions' };
    }

    return result;
  } catch (error) {
    console.error('Directions exception:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Get detailed information about a place by name
 * @param placeName - Name of the place to search
 * @param location - Optional location context (e.g., "서울", "부산")
 * @returns Place details including coordinates, address, phone, etc.
 */
export async function getPlaceDetails(
  placeName: string,
  location?: string
): Promise<KakaoApiResponse<PlaceDetails>> {
  try {
    const response = await fetch(`${BASE_URL}/kakao/place-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ placeName, location })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Place details error:', result);
      return { success: false, error: result.error || 'Failed to get place details' };
    }

    return result;
  } catch (error) {
    console.error('Place details exception:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Format distance for display
 * @param meters - Distance in meters
 * @returns Formatted string like "1.2km" or "500m"
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
}

/**
 * Format duration for display
 * @param seconds - Duration in seconds
 * @returns Formatted string like "1시간 30분" or "45분"
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }
  
  return `${minutes}분`;
}

/**
 * Calculate total route distance and duration
 * @param waypoints - Array of coordinates [{lat, lng}]
 * @returns Total distance and duration
 */
export async function calculateRouteStats(
  waypoints: Array<{ lat: number; lng: number }>
): Promise<{ totalDistance: number; totalDuration: number; isFallback: boolean }> {
  let totalDistance = 0;
  let totalDuration = 0;
  let isFallback = false;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const result = await getDirections(waypoints[i], waypoints[i + 1]);
    
    if (result.success && result.data) {
      totalDistance += result.data.distance;
      totalDuration += result.data.duration;
      isFallback = isFallback || result.data.isFallback;
    } else {
      // If API fails, use simple distance calculation
      const distance = calculateStraightLineDistance(
        waypoints[i].lat,
        waypoints[i].lng,
        waypoints[i + 1].lat,
        waypoints[i + 1].lng
      );
      totalDistance += distance;
      totalDuration += distance / 50; // Assume 50m/min walking speed
      isFallback = true;
    }
  }

  return {
    totalDistance: Math.round(totalDistance),
    totalDuration: Math.round(totalDuration),
    isFallback
  };
}

/**
 * Calculate straight-line distance between two points (fallback)
 * Uses Haversine formula
 */
function calculateStraightLineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
