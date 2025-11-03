/**
 * Naver Search API Utilities
 * Get place images using Naver Image Search API
 */

import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277`;

interface NaverImageItem {
  title: string;
  link: string;
  thumbnail: string;
  sizeheight: string;
  sizewidth: string;
}

interface NaverImageSearchResult {
  items: NaverImageItem[];
  isFallback: boolean;
}

interface NaverApiResponse {
  success: boolean;
  data?: NaverImageSearchResult;
  error?: string;
}

/**
 * Search for place images using Naver Image Search
 * @param placeName - Name of the place
 * @param category - Category to narrow down search
 * @param display - Number of images to fetch (max 100, default 5)
 * @returns Array of image URLs
 */
export async function searchPlaceImages(
  placeName: string,
  category?: string,
  display: number = 5
): Promise<string[]> {
  try {
    // Build search query with category for better relevance
    const searchQuery = category 
      ? `${placeName} ${category}` 
      : placeName;

    console.log(`[Naver Image Search] Searching: "${searchQuery}"`);

    const response = await fetch(`${BASE_URL}/naver/image-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ 
        query: searchQuery, 
        display: Math.min(display, 100) // Naver API max is 100
      })
    });

    const result: NaverApiResponse = await response.json();

    if (!result.success || !result.data) {
      console.warn('[Naver Image Search] Failed to get images');
      return [];
    }

    if (result.data.isFallback) {
      console.warn('[Naver Image Search] API credentials not configured, using fallback');
      return [];
    }

    const imageUrls = result.data.items.map(item => item.link);
    console.log(`[Naver Image Search] ✅ Found ${imageUrls.length} images`);
    
    return imageUrls;
  } catch (error) {
    console.error('[Naver Image Search] Error:', error);
    return [];
  }
}

/**
 * Get a single representative image for a place
 * @param placeName - Name of the place
 * @param category - Category to narrow down search
 * @returns Single image URL or null
 */
export async function getPlaceImage(
  placeName: string,
  category?: string
): Promise<string | null> {
  const images = await searchPlaceImages(placeName, category, 1);
  return images.length > 0 ? images[0] : null;
}

/**
 * Batch fetch images for multiple places
 * @param places - Array of places with name and category
 * @returns Map of place names to image URLs
 */
export async function batchFetchPlaceImages(
  places: Array<{ name: string; category?: string }>
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  // Fetch images in parallel with rate limiting
  const chunkSize = 5; // Process 5 at a time to avoid rate limits
  for (let i = 0; i < places.length; i += chunkSize) {
    const chunk = places.slice(i, i + chunkSize);
    
    const promises = chunk.map(async (place) => {
      const image = await getPlaceImage(place.name, place.category);
      if (image) {
        imageMap.set(place.name, image);
      }
    });

    await Promise.all(promises);
    
    // Small delay between chunks to respect rate limits
    if (i + chunkSize < places.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return imageMap;
}
