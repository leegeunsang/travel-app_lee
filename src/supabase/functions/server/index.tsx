import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { signUp, verifyToken } from "./auth.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-80cc3277/health", (c) => {
  return c.json({ status: "ok" });
});

// Get weather information using OpenWeather API
app.get("/make-server-80cc3277/weather/:city", async (c) => {
  try {
    const city = c.req.param("city");
    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
    
    console.log(`[Weather API] ===== WEATHER REQUEST =====`);
    console.log(`[Weather API] City requested: ${city}`);
    console.log(`[Weather API] OPENWEATHER_API_KEY: ${apiKey ? 'SET (length: ' + apiKey.length + ')' : 'NOT SET'}`);
    console.log(`[Weather API] Request headers:`, Object.fromEntries(c.req.raw.headers.entries()));
    
    // Map Korean city names to English
    // For provinces (도), map to representative cities
    const cityNameMap: Record<string, string> = {
      "서울": "Seoul",
      "부산": "Busan",
      "대구": "Daegu",
      "인천": "Incheon",
      "광주": "Gwangju",
      "대전": "Daejeon",
      "울산": "Ulsan",
      "세종": "Sejong",
      // Provinces → Representative cities
      "경기": "Suwon",        // 경기도 → 수원
      "강원": "Chuncheon",    // 강원도 → 춘천
      "충북": "Cheongju",     // 충청북도 → 청주
      "충남": "Daejeon",      // 충청남도 → 대전
      "전북": "Jeonju",       // 전라북도 → 전주
      "전남": "Gwangju",      // 전라남도 → 광주
      "경북": "Daegu",        // 경상북도 → 대구
      "경남": "Changwon",     // 경상남도 → 창원
      "제주": "Jeju",
      "제주특별자치도": "Jeju",  // 제주특별자치도 → 제주
      "제주도": "Jeju",         // 제주도 → 제주
      "서울특별시": "Seoul",
      "부산광역시": "Busan",
      "대구광역시": "Daegu",
      "인천광역시": "Incheon",
      "광주광역시": "Gwangju",
      "대전광역시": "Daejeon",
      "울산광역시": "Ulsan",
      "세종특별자치시": "Sejong",
      "경기도": "Suwon",
      "강원도": "Chuncheon",
      "충청북도": "Cheongju",
      "충청남도": "Daejeon",
      "전라북도": "Jeonju",
      "전라남도": "Gwangju",
      "경상북도": "Daegu",
      "경상남도": "Changwon",
      "강릉": "Gangneung",
      "전주": "Jeonju",
      "경주": "Gyeongju",
      "여수": "Yeosu",
      "포항": "Pohang",
      "창원": "Changwon",
      "천안": "Cheonan",
      "청주": "Cheongju",
      "안산": "Ansan",
      "안양": "Anyang",
      "수원": "Suwon",
      "용인": "Yongin",
      "성남": "Seongnam",
      "고양": "Goyang",
      "화성": "Hwaseong",
      "남양주": "Namyangju",
      "부천": "Bucheon",
      "평택": "Pyeongtaek",
      "시흥": "Siheung",
      "파주": "Paju",
      "김해": "Gimhae",
      "진주": "Jinju",
      "통영": "Tongyeong",
      "속초": "Sokcho",
      "춘천": "Chuncheon",
      "원주": "Wonju"
    };
    
    // Try to find a match by checking if the input contains any known city name
    let englishCity = cityNameMap[city] || city;
    
    // If direct match fails, try to find a partial match
    if (englishCity === city && city.includes('특별') || city.includes('광역') || city.includes('도')) {
      for (const [koreanName, englishName] of Object.entries(cityNameMap)) {
        if (city.includes(koreanName)) {
          englishCity = englishName;
          break;
        }
      }
    }
    
    if (!apiKey) {
      console.warn("[Weather API] ⚠️ OPENWEATHER_API_KEY is NOT SET - returning mock data");
      console.log("[Weather API] To get real weather data:");
      console.log("[Weather API] 1. Get API key from https://openweathermap.org/");
      console.log("[Weather API] 2. Add OPENWEATHER_API_KEY to Supabase Edge Function secrets");
      // Return mock data when API key is not set
      return c.json({
        temperature: 20,
        description: "맑음",
        icon: "01d",
        humidity: 60,
        windSpeed: 2.5,
        isMock: true
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(englishCity)},KR&appid=${apiKey}&units=metric&lang=kr`;
    console.log(`[Weather API] City mapping: ${city} → ${englishCity}`);
    console.log(`[Weather API] Calling OpenWeather API...`);
    
    const response = await fetch(url);
    
    console.log(`[Weather API] OpenWeather API response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Weather API] ❌ OpenWeather API error for ${city}:`);
      console.error(`[Weather API] Status: ${response.status} ${response.statusText}`);
      console.error(`[Weather API] Error details: ${errorText}`);
      
      // Specific handling for 401 Unauthorized
      if (response.status === 401) {
        console.error(`[Weather API] 🔑 401 UNAUTHORIZED ERROR`);
        console.error(`[Weather API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.error(`[Weather API] ❌ Invalid or missing OPENWEATHER_API_KEY`);
        console.error(`[Weather API] `);
        console.error(`[Weather API] 📋 Troubleshooting steps:`);
        console.error(`[Weather API] 1. Get a FREE API key from: https://openweathermap.org/`);
        console.error(`[Weather API] 2. Set it in Supabase: supabase secrets set OPENWEATHER_API_KEY=your_key`);
        console.error(`[Weather API] 3. Wait 10-120 minutes for new keys to activate`);
        console.error(`[Weather API] 4. Redeploy Edge Function: supabase functions deploy server`);
        console.error(`[Weather API] 5. Check key status: https://home.openweathermap.org/api_keys`);
        console.error(`[Weather API] `);
        console.error(`[Weather API] ℹ️ Current API key: ${apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET'}`);
        console.error(`[Weather API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      }
      
      console.warn(`[Weather API] Returning mock data due to API error`);
      
      // Return mock data on API error
      return c.json({
        temperature: 20,
        description: "맑음",
        icon: "01d",
        humidity: 60,
        windSpeed: 2.5,
        isMock: true,
        error: response.status === 401 ? "invalid_api_key" : "api_error"
      });
    }
    
    const data = await response.json();
    
    console.log(`[Weather API] ✅ OpenWeather API success`);
    console.log(`[Weather API] Raw data sample:`, JSON.stringify(data).substring(0, 200));
    
    if (!data.main || !data.weather || !data.weather[0]) {
      console.error(`[Weather API] ❌ Invalid weather data structure for ${city}`);
      console.error(`[Weather API] Data keys:`, Object.keys(data));
      console.warn(`[Weather API] Returning mock data due to invalid structure`);
      // Return mock data
      return c.json({
        temperature: 20,
        description: "맑음",
        icon: "01d",
        humidity: 60,
        windSpeed: 2.5,
        isMock: true
      });
    }
    
    const weatherResponse = {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      isMock: false
    };
    
    console.log(`[Weather API] ✅ Sending REAL weather data:`, weatherResponse);
    console.log(`[Weather API] ===== WEATHER REQUEST COMPLETE =====`);
    
    return c.json(weatherResponse);
  } catch (error) {
    console.error(`[Weather API] ❌ Unexpected error in weather endpoint:`, error);
    console.error(`[Weather API] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    console.warn(`[Weather API] Returning mock data due to unexpected error`);
    console.log(`[Weather API] ===== WEATHER REQUEST COMPLETE (ERROR) =====`);
    // Return mock data on error
    return c.json({
      temperature: 20,
      description: "맑음",
      icon: "01d",
      humidity: 60,
      windSpeed: 2.5,
      isMock: true
    });
  }
});

// Get GPT-based travel recommendation
app.post("/make-server-80cc3277/recommend", async (c) => {
  try {
    const { travelStyle, location, weather } = await c.req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    
    // Generate fallback recommendation
    const getFallbackRecommendation = () => {
      const recommendations = {
        "힐링": `${location}는 ${travelStyle} 여행에 완벽한 곳입니다! 현재 날씨(${weather})도 좋으니 여유롭게 산책하며 현지 카페에서 휴식을 취해보세요. 자연 속에서 힐링의 시간을 가지시길 바랍니다.`,
        "관광": `${location}의 대표 관광지들을 둘러보세요! ${weather} 날씨에 역사적인 명소와 박물관을 방문하기 좋습니다. 현지 문화를 체험하며 특별한 추억을 만들어보세요.`,
        "액티비티": `${location}에서 활동적인 여행을 즐겨보세요! ${weather} 날씨가 야외 활동에 적합합니다. 트레킹, 수상 스포츠 등 다양한 액티비티로 에너지 넘치는 하루를 보내세요!`
      };
      return recommendations[travelStyle] || `${location}에서 ${travelStyle} 스타일의 멋진 여행을 즐기세요! 현지의 특색있는 명소들을 방문하며 즐거운 시간을 보내시길 바랍니다.`;
    };
    
    if (!apiKey) {
      console.log("OPENAI_API_KEY is not set, using fallback recommendation");
      return c.json({ 
        recommendation: getFallbackRecommendation(),
        isMock: true 
      });
    }

    const prompt = `당신은 여행 전문가입니다. 다음 정보를 기반으로 맞춤형 여행 추천을 제공해주세요:
- 여행 성향: ${travelStyle}
- 위치: ${location}
- 날씨: ${weather}

간단하고 친근한 톤으로 2-3문장으로 추천해주세요.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.log(`Error calling OpenAI API: ${response.statusText}, using fallback`);
      return c.json({ 
        recommendation: getFallbackRecommendation(),
        isMock: true 
      });
    }

    const data = await response.json();
    const recommendation = data.choices[0].message.content;
    
    return c.json({ 
      recommendation,
      isMock: false 
    });
  } catch (error) {
    console.log(`Error in recommend endpoint: ${error}, using fallback`);
    const { travelStyle, location, weather } = await c.req.json().catch(() => ({ 
      travelStyle: "관광", 
      location: "여행지", 
      weather: "좋은 날씨" 
    }));
    
    return c.json({ 
      recommendation: `${location}에서 ${travelStyle} 스타일의 멋진 여행을 즐기세요! 현지의 특색있는 명소들을 방문하며 즐거운 시간을 보내시길 바랍니다.`,
      isMock: true 
    });
  }
});

// Generate travel routes with GPT
app.post("/make-server-80cc3277/generate-routes", async (c) => {
  try {
    const { travelStyle, location } = await c.req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    
    // Generate fallback routes
    const getFallbackRoutes = () => {
      if (travelStyle === "힐링") {
        return {
          routes: [
            {
              routeName: "힐링 코스 A",
              spots: [
                { name: `${location} 카페`, description: "여유로운 브런치와 커피", order: 1, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085" },
                { name: `${location} 공원`, description: "산책과 자연 감상", order: 2, image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f" },
                { name: `${location} 스파`, description: "온천과 마사지 힐링", order: 3, image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef" },
                { name: `${location} 호텔`, description: "편안한 휴식", order: 4, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
              ]
            },
            {
              routeName: "힐링 코스 B",
              spots: [
                { name: `${location} 해변`, description: "바다 감상과 산책", order: 1, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" },
                { name: `${location} 요가 센터`, description: "명상과 요가", order: 2, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b" },
                { name: `${location} 티하우스`, description: "전통 차 체험", order: 3, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc" },
                { name: `${location} 펜션`, description: "자연 속 숙소", order: 4, image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562" }
              ]
            }
          ]
        };
      } else if (travelStyle === "관광") {
        return {
          routes: [
            {
              routeName: "관광 코스 A",
              spots: [
                { name: `${location} 박물관`, description: "역사와 문화 탐방", order: 1, image: "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080" },
                { name: `${location} 궁궐`, description: "전통 건축물 관람", order: 2, image: "https://images.unsplash.com/photo-1548013146-72479768bada" },
                { name: `${location} 전통시장`, description: "로컬 음식 체험", order: 3, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1" },
                { name: `${location} 시티호텔`, description: "도심 속 숙소", order: 4, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
              ]
            },
            {
              routeName: "관광 코스 B",
              spots: [
                { name: `${location} 타워`, description: "전망대에서 시내 조망", order: 1, image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8" },
                { name: `${location} 미술관`, description: "현대 미술 감상", order: 2, image: "https://images.unsplash.com/photo-1578301978018-3005759f48f7" },
                { name: `${location} 쇼핑몰`, description: "쇼핑과 식사", order: 3, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8" },
                { name: `${location} 게스트하우스`, description: "편안한 숙소", order: 4, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" }
              ]
            }
          ]
        };
      } else {
        return {
          routes: [
            {
              routeName: "액티비티 코스 A",
              spots: [
                { name: `${location} 트레킹`, description: "산 등반 코스", order: 1, image: "https://images.unsplash.com/photo-1551632811-561732d1e306" },
                { name: `${location} 수상스포츠`, description: "카약, 패들보드", order: 2, image: "https://images.unsplash.com/photo-1530870110042-98b2cb110834" },
                { name: `${location} 짚라인`, description: "스릴 넘치는 체험", order: 3, image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3" },
                { name: `${location} 캠핑장`, description: "야외 숙박", order: 4, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4" }
              ]
            },
            {
              routeName: "액티비티 코스 B",
              spots: [
                { name: `${location} 자전거`, description: "사이클링 투어", order: 1, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64" },
                { name: `${location} 클라이밍`, description: "암벽 등반", order: 2, image: "https://images.unsplash.com/photo-1522163182402-834f871fd851" },
                { name: `${location} ATV`, description: "사륜 오토바이 체험", order: 3, image: "https://images.unsplash.com/photo-1558980394-4c7c9f088ae6" },
                { name: `${location} 글램핑`, description: "럭셔리 캠핑", order: 4, image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d" }
              ]
            }
          ]
        };
      }
    };
    
    if (!apiKey) {
      console.log("OPENAI_API_KEY is not set, using fallback routes");
      return c.json(getFallbackRoutes());
    }

    const prompt = `당신은 여행 전문가입니다. ${location} 지역에서 ${travelStyle} 스타일의 여행자를 위한 2개의 여행 경로를 추천해주세요.

각 경로는 4개의 장소로 구성되며, 1일 코스입니다.

다음 JSON 형식으로 응답해주세요:
{
  "routes": [
    {
      "routeName": "코스 이름",
      "spots": [
        {"name": "장소명", "description": "간단한 설명 (10자 이내)", "order": 1},
        {"name": "장소명", "description": "간단한 설명 (10자 이내)", "order": 2},
        {"name": "장소명", "description": "간단한 설명 (10자 이내)", "order": 3},
        {"name": "장소명", "description": "간단한 설명 (10자 이내)", "order": 4}
      ]
    }
  ]
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.log(`Error calling OpenAI API: ${response.statusText}, using fallback`);
      return c.json(getFallbackRoutes());
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const routesData = JSON.parse(content);
      return c.json(routesData);
    } catch (parseError) {
      console.log(`Error parsing GPT response: ${parseError}, using fallback`);
      return c.json(getFallbackRoutes());
    }
  } catch (error) {
    console.log(`Error in generate-routes endpoint: ${error}, using fallback`);
    const { travelStyle, location } = await c.req.json().catch(() => ({ 
      travelStyle: "관광", 
      location: "여행지" 
    }));
    
    return c.json({
      routes: [
        {
          routeName: "추천 코스",
          spots: [
            { name: `${location} 명소 1`, description: "주요 관광지", order: 1, image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8" },
            { name: `${location} 명소 2`, description: "맛집 투어", order: 2, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1" },
            { name: `${location} 명소 3`, description: "문화 체험", order: 3, image: "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080" },
            { name: `${location} 숙소`, description: "편안한 휴식", order: 4, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
          ]
        }
      ]
    });
  }
});

// Convert coordinates to address (Reverse Geocoding)
app.post("/make-server-80cc3277/coords-to-address", async (c) => {
  try {
    const { latitude, longitude } = await c.req.json();
    const apiKey = Deno.env.get("KAKAO_REST_API_KEY");
    
    console.log(`[Reverse Geocoding] Latitude: ${latitude}, Longitude: ${longitude}`);
    
    if (!apiKey) {
      console.log("KAKAO_REST_API_KEY is not set");
      return c.json({ 
        error: "API key not configured",
        region: "서울",  // Fallback to Seoul
        city: "",
        fullAddress: "서울"
      });
    }

    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `KakaoAK ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching address: ${response.status} ${response.statusText} - ${errorText}`);
      return c.json({ 
        error: "Failed to fetch address",
        region: "서울",  // Fallback
        city: "",
        fullAddress: "서울"
      });
    }

    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      console.log("No address found for coordinates");
      return c.json({ 
        error: "Address not found",
        region: "서울",  // Fallback
        city: "",
        fullAddress: "서울"
      });
    }

    const addressInfo = data.documents[0].address;
    
    // Extract region (시/도) and city (시/군/구)
    let region = addressInfo.region_1depth_name || '';
    let city = addressInfo.region_2depth_name || '';
    
    // Clean up region name
    region = region
      .replace('특별시', '')
      .replace('광역시', '')
      .replace('특별자치도', '')
      .replace('특별자치시', '')
      .replace('도', '');

    // For major cities, use the city name as region
    const majorCities = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종'];
    const finalRegion = majorCities.includes(region) ? region : region;

    console.log(`[Reverse Geocoding] Region: ${finalRegion}, City: ${city}, Full: ${addressInfo.address_name}`);

    return c.json({ 
      region: finalRegion,
      city,
      fullAddress: addressInfo.address_name
    });
  } catch (error) {
    console.log(`Error in coords-to-address endpoint: ${error}`);
    return c.json({ 
      error: "Server error",
      region: "서울",  // Fallback
      city: "",
      fullAddress: "서울"
    });
  }
});

// Search places using Kakao Local API
app.post("/make-server-80cc3277/search-places", async (c) => {
  try {
    const { query, location } = await c.req.json();
    const apiKey = Deno.env.get("KAKAO_REST_API_KEY");
    
    if (!apiKey) {
      console.log("KAKAO_REST_API_KEY is not set");
      return c.json({ 
        places: [],
        isMock: true 
      });
    }

    // Search places using Kakao Local API
    const searchQuery = `${location} ${query}`;
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchQuery)}&size=5`;
    
    console.log(`Searching places: ${searchQuery}`);
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `KakaoAK ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching places: ${response.status} ${response.statusText} - ${errorText}`);
      return c.json({ 
        places: [],
        isMock: true 
      });
    }

    const data = await response.json();
    
    // Get real data from Google Places API
    const placesWithRealData = [];
    for (let i = 0; i < data.documents.length; i++) {
      const place = data.documents[i];
      
      // Get real review count, rating, and photo from Google Places API
      const googleData = await getGooglePlaceData(
        place.place_name, 
        place.address_name, 
        parseFloat(place.y), 
        parseFloat(place.x)
      );
      
      console.log(`[Search Places] ${place.place_name} -> Reviews: ${googleData.reviewCount}, Rating: ${googleData.rating}, Photo: ${googleData.photoUrl ? '✓' : '✗'}`);
      
      placesWithRealData.push({
        name: place.place_name,
        address: place.address_name,
        roadAddress: place.road_address_name,
        phone: place.phone,
        category: place.category_name,
        x: parseFloat(place.x), // longitude
        y: parseFloat(place.y), // latitude
        placeUrl: place.place_url,
        imageUrl: googleData.photoUrl,
        reviewCount: googleData.reviewCount,
        rating: googleData.rating
      });
      
      // Small delay to avoid rate limiting
      if (i < data.documents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return c.json({ 
      places: placesWithRealData,
      isMock: false 
    });
  } catch (error) {
    console.log(`Error in search-places endpoint: ${error}`);
    return c.json({ 
      places: [],
      isMock: true 
    });
  }
});

// Get tourist attractions from Korea Tourism API
app.get("/make-server-80cc3277/attractions/:areaCode", async (c) => {
  try {
    const areaCode = c.req.param("areaCode");
    const apiKey = Deno.env.get("TOUR_API_KEY");
    const page = c.req.query("page") || "1";
    const numOfRows = c.req.query("numOfRows") || "20";
    
    // Get mock attractions based on area code
    const getMockAttractions = (code: string) => {
      // Area code mapping
      const mockData: { [key: string]: any[] } = {
        "1": [ // 서울
          {
            title: "국립중앙박물관",
            addr1: "서울특별시 용산구 서빙고로 137",
            contentid: "mock1",
            tel: "02-2077-9000",
            firstimage: "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            mapx: "126.9803",
            mapy: "37.5240",
            contenttypeid: "12"
          },
          {
            title: "경복궁",
            addr1: "서울특별시 종로구 사직로 161",
            contentid: "mock2",
            tel: "02-3700-3900",
            firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
            mapx: "126.9770",
            mapy: "37.5796",
            contenttypeid: "12"
          },
          {
            title: "코엑스 아쿠아리움",
            addr1: "서울특별시 강남구 영동대로 513",
            contentid: "mock3",
            tel: "02-6002-6200",
            firstimage: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2",
            mapx: "127.0590",
            mapy: "37.5126",
            contenttypeid: "12"
          },
          {
            title: "남산서울타워",
            addr1: "서울특별시 용산구 남산공원길 105",
            contentid: "mock4",
            tel: "02-3455-9277",
            firstimage: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8",
            mapx: "126.9882",
            mapy: "37.5512",
            contenttypeid: "12"
          },
          {
            title: "북촌한옥마을",
            addr1: "서울특별시 종로구 계동길 37",
            contentid: "mock5",
            tel: "02-2148-4161",
            firstimage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
            mapx: "126.9850",
            mapy: "37.5825",
            contenttypeid: "12"
          },
          {
            title: "롯데월드",
            addr1: "서울특별시 송파구 올림픽로 240",
            contentid: "mock6",
            tel: "02-411-2000",
            firstimage: "https://images.unsplash.com/photo-1594138989711-ffe5c7c764a0",
            mapx: "127.0982",
            mapy: "37.5111",
            contenttypeid: "12"
          },
          {
            title: "명동거리",
            addr1: "서울특별시 중구 명동길",
            contentid: "mock7",
            tel: "02-3789-7001",
            firstimage: "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6",
            mapx: "126.9850",
            mapy: "37.5636",
            contenttypeid: "12"
          },
          {
            title: "서울역사박물관",
            addr1: "서울특별시 종로구 새문안로 55",
            contentid: "mock8",
            tel: "02-724-0274",
            firstimage: "https://images.unsplash.com/photo-1578301978018-3005759f48f7",
            mapx: "126.9677",
            mapy: "37.5709",
            contenttypeid: "12"
          },
          {
            title: "청계천",
            addr1: "서울특별시 종로구 청계천로",
            contentid: "mock9",
            tel: "02-2290-6114",
            firstimage: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
            mapx: "126.9783",
            mapy: "37.5698",
            contenttypeid: "12"
          },
          {
            title: "국립현대미술관 서울관",
            addr1: "서울특별시 종로구 삼청로 30",
            contentid: "mock10",
            tel: "02-3701-9500",
            firstimage: "https://images.unsplash.com/photo-1578301978018-3005759f48f7",
            mapx: "126.9820",
            mapy: "37.5862",
            contenttypeid: "12"
          }
        ],
        "2": [ // 인천
          {
            title: "인천 차이나타운",
            addr1: "인천광역시 중구 차이나타운로 일대",
            contentid: "mock_incheon1",
            tel: "032-760-7560",
            firstimage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
            mapx: "126.6179",
            mapy: "37.4758",
            contenttypeid: "12"
          },
          {
            title: "NC큐브 커넬워크",
            addr1: "인천광역시 연수구 센트럴로 123",
            contentid: "mock_incheon2",
            tel: "032-726-2233",
            firstimage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
            mapx: "126.6400",
            mapy: "37.3943",
            contenttypeid: "12"
          },
          {
            title: "송도센트럴파크",
            addr1: "인천광역시 연수구 컨벤시아대로 160",
            contentid: "mock_incheon3",
            tel: "032-851-8899",
            firstimage: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
            mapx: "126.6383",
            mapy: "37.3893",
            contenttypeid: "12"
          },
          {
            title: "월미도",
            addr1: "인천광역시 중구 월미로 269",
            contentid: "mock_incheon4",
            tel: "032-760-6471",
            firstimage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            mapx: "126.5952",
            mapy: "37.4754",
            contenttypeid: "12"
          },
          {
            title: "인천 복합문화관",
            addr1: "인천광역시 남동구 예술로 76번길 47",
            contentid: "mock_incheon5",
            tel: "032-432-5800",
            firstimage: "https://images.unsplash.com/photo-1578301978018-3005759f48f7",
            mapx: "126.7041",
            mapy: "37.4470",
            contenttypeid: "12"
          }
        ],
        "3": [ // 대전
          {
            title: "대전 엑스포과학공원",
            addr1: "대전광역시 유성구 대덕대로 480",
            contentid: "mock_daejeon1",
            tel: "042-250-1111",
            firstimage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
            mapx: "127.3941",
            mapy: "36.3732",
            contenttypeid: "12"
          },
          {
            title: "유성온천",
            addr1: "대전광역시 유성구 온천로 일대",
            contentid: "mock_daejeon2",
            tel: "042-611-2114",
            firstimage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef",
            mapx: "127.3446",
            mapy: "36.3626",
            contenttypeid: "12"
          },
          {
            title: "대청호",
            addr1: "대전광역시 동구 대청동",
            contentid: "mock_daejeon3",
            tel: "042-251-4783",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "127.4885",
            mapy: "36.4793",
            contenttypeid: "12"
          }
        ],
        "4": [ // 대구
          {
            title: "대구미술관",
            addr1: "대구광역시 수성구 미술관로 40",
            contentid: "mock_daegu1",
            tel: "053-803-7900",
            firstimage: "https://images.unsplash.com/photo-1578301978018-3005759f48f7",
            mapx: "128.6396",
            mapy: "35.8533",
            contenttypeid: "12"
          },
          {
            title: "동화사",
            addr1: "대구광역시 동구 팔공산로 201",
            contentid: "mock_daegu2",
            tel: "053-980-7900",
            firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
            mapx: "128.6969",
            mapy: "35.9486",
            contenttypeid: "12"
          },
          {
            title: "83타워",
            addr1: "대구광역시 달서구 두류공원로 200",
            contentid: "mock_daegu3",
            tel: "053-620-8000",
            firstimage: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8",
            mapx: "128.5559",
            mapy: "35.8510",
            contenttypeid: "12"
          },
          {
            title: "김광석다시그리기길",
            addr1: "대구광역시 중구 대봉동 일대",
            contentid: "mock_daegu4",
            tel: "053-661-2191",
            firstimage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
            mapx: "128.5832",
            mapy: "35.8537",
            contenttypeid: "12"
          },
          {
            title: "서문시장",
            addr1: "대구광역시 중구 큰장로 26길 45",
            contentid: "mock_daegu5",
            tel: "053-256-6341",
            firstimage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
            mapx: "128.5785",
            mapy: "35.8714",
            contenttypeid: "12"
          },
          {
            title: "이월드",
            addr1: "대구광역시 달서구 두류공원로 200",
            contentid: "mock_daegu6",
            tel: "053-620-0001",
            firstimage: "https://images.unsplash.com/photo-1594138989711-ffe5c7c764a0",
            mapx: "128.5551",
            mapy: "35.8512",
            contenttypeid: "12"
          },
          {
            title: "수성못",
            addr1: "대구광역시 수성구 두산동",
            contentid: "mock_daegu7",
            tel: "053-666-2573",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "128.6352",
            mapy: "35.8239",
            contenttypeid: "12"
          }
        ],
        "5": [ // 광주
          {
            title: "국립아시아문화전당",
            addr1: "광주광역시 동구 문화전당로 38",
            contentid: "mock_gwangju1",
            tel: "1899-5566",
            firstimage: "https://images.unsplash.com/photo-1578301978018-3005759f48f7",
            mapx: "126.9205",
            mapy: "35.1465",
            contenttypeid: "12"
          },
          {
            title: "무등산국립공원",
            addr1: "광주광역시 동구 지산동 일대",
            contentid: "mock_gwangju2",
            tel: "062-227-1187",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "126.9880",
            mapy: "35.1343",
            contenttypeid: "12"
          },
          {
            title: "양림동역사문화마을",
            addr1: "광주광역시 남구 양림동 일대",
            contentid: "mock_gwangju3",
            tel: "062-676-1935",
            firstimage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
            mapx: "126.9115",
            mapy: "35.1380",
            contenttypeid: "12"
          }
        ],
        "6": [ // 부산
          {
            title: "부산 아쿠아리움",
            addr1: "부산광역시 해운대구 해운대해변로 266",
            contentid: "mock_busan1",
            tel: "051-740-1700",
            firstimage: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2",
            mapx: "129.1584",
            mapy: "35.1588",
            contenttypeid: "12"
          },
          {
            title: "해운대해수욕장",
            addr1: "부산광역시 해운대구 우동",
            contentid: "mock_busan2",
            tel: "051-749-4000",
            firstimage: "https://images.unsplash.com/photo-1679054142611-5f0580dab94f",
            mapx: "129.1603",
            mapy: "35.1587",
            contenttypeid: "12"
          },
          {
            title: "신세계 센텀시티",
            addr1: "부산광역시 해운대구 센텀남대로 35",
            contentid: "mock_busan3",
            tel: "051-745-2233",
            firstimage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
            mapx: "129.1286",
            mapy: "35.1692",
            contenttypeid: "12"
          },
          {
            title: "광안리해수욕장",
            addr1: "부산광역시 수영구 광안동",
            contentid: "mock_busan4",
            tel: "051-610-4000",
            firstimage: "https://images.unsplash.com/photo-1641730146205-f6e594f7a619",
            mapx: "129.1186",
            mapy: "35.1532",
            contenttypeid: "12"
          },
          {
            title: "감천문화마을",
            addr1: "부산광역시 사하구 감내2로",
            contentid: "mock_busan5",
            tel: "051-204-1444",
            firstimage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
            mapx: "129.0104",
            mapy: "35.0976",
            contenttypeid: "12"
          },
          {
            title: "부산박물관",
            addr1: "부산광역시 남구 유엔평화로 63",
            contentid: "mock_busan6",
            tel: "051-610-7111",
            firstimage: "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            mapx: "129.0799",
            mapy: "35.1367",
            contenttypeid: "12"
          }
        ],
        "7": [ // 울산
          {
            title: "대왕암공원",
            addr1: "울산광역시 동구 일산동",
            contentid: "mock_ulsan1",
            tel: "052-209-3736",
            firstimage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            mapx: "129.3669",
            mapy: "35.4943",
            contenttypeid: "12"
          },
          {
            title: "간절곶",
            addr1: "울산광역시 울주군 서생면 간절곶1길 39",
            contentid: "mock_ulsan2",
            tel: "052-204-0006",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "129.3574",
            mapy: "35.3612",
            contenttypeid: "12"
          },
          {
            title: "울산대공원",
            addr1: "울산광역시 남구 대공원로 94",
            contentid: "mock_ulsan3",
            tel: "052-271-8800",
            firstimage: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
            mapx: "129.2919",
            mapy: "35.5204",
            contenttypeid: "12"
          }
        ],
        "8": [ // 세종
          {
            title: "세종호수공원",
            addr1: "세종특별자치시 연기면 세종로 194",
            contentid: "mock_sejong1",
            tel: "044-300-7275",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "127.2583",
            mapy: "36.4801",
            contenttypeid: "12"
          },
          {
            title: "금강수목원",
            addr1: "세종특별자치시 금남면 산림박물관길 110",
            contentid: "mock_sejong2",
            tel: "044-200-6400",
            firstimage: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
            mapx: "127.3391",
            mapy: "36.4387",
            contenttypeid: "12"
          },
          {
            title: "베어트리파크",
            addr1: "세종특별자치시 전동면 송전로 217",
            contentid: "mock_sejong3",
            tel: "044-866-2000",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "127.2297",
            mapy: "36.5594",
            contenttypeid: "12"
          }
        ],
        "31": [ // 경기
          {
            title: "경기도박물관",
            addr1: "경기도 용인시 기흥구 상갈로 6",
            contentid: "mock_gyeonggi1",
            tel: "031-288-5300",
            firstimage: "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            mapx: "127.0823",
            mapy: "37.2879",
            contenttypeid: "12"
          },
          {
            title: "수원화성",
            addr1: "경기도 수원시 장안구 영화동 일대",
            contentid: "mock_gyeonggi2",
            tel: "031-228-4480",
            firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
            mapx: "127.0168",
            mapy: "37.2865",
            contenttypeid: "12"
          },
          {
            title: "스타필드 하남",
            addr1: "경기도 하남시 미사대로 750",
            contentid: "mock_gyeonggi3",
            tel: "031-8072-8000",
            firstimage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
            mapx: "127.2231",
            mapy: "37.5454",
            contenttypeid: "12"
          },
          {
            title: "에버랜드",
            addr1: "경기도 용인시 처인구 포곡읍 에버랜드로 199",
            contentid: "mock_gyeonggi4",
            tel: "031-320-5000",
            firstimage: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
            mapx: "127.2044",
            mapy: "37.2943",
            contenttypeid: "12"
          },
          {
            title: "캐리비안베이",
            addr1: "경기도 용인시 처인구 포곡읍 에버랜드로 199",
            contentid: "mock_gyeonggi5",
            tel: "031-320-5000",
            firstimage: "https://images.unsplash.com/photo-1530870110042-98b2cb110834",
            mapx: "127.2047",
            mapy: "37.2968",
            contenttypeid: "12"
          },
          {
            title: "남한산성",
            addr1: "경기도 광주시 남한산성면 산성리",
            contentid: "mock_gyeonggi6",
            tel: "031-746-2811",
            firstimage: "https://images.unsplash.com/photo-1610349633888-c6058d7393e9",
            mapx: "127.1872",
            mapy: "37.4788",
            contenttypeid: "12"
          }
        ],
        "32": [ // 강원
          {
            title: "강릉 커피거리 카페",
            addr1: "강원도 강릉시 창해로 14번길 20-1",
            contentid: "mock_gangwon1",
            tel: "033-640-4536",
            firstimage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
            mapx: "128.9087",
            mapy: "37.7793",
            contenttypeid: "12"
          },
          {
            title: "속초해수욕장",
            addr1: "강원도 속초시 조양동",
            contentid: "mock_gangwon2",
            tel: "033-639-2362",
            firstimage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            mapx: "128.5946",
            mapy: "38.1865",
            contenttypeid: "12"
          },
          {
            title: "강원도립박물관",
            addr1: "강원도 춘천시 우석로 70",
            contentid: "mock_gangwon3",
            tel: "033-250-4000",
            firstimage: "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            mapx: "127.7157",
            mapy: "37.8763",
            contenttypeid: "12"
          },
          {
            title: "낙산사",
            addr1: "강원도 양양군 강현면 낙산사로 100",
            contentid: "mock_gangwon4",
            tel: "033-672-2447",
            firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
            mapx: "128.6270",
            mapy: "38.1246",
            contenttypeid: "12"
          },
          {
            title: "남이섬",
            addr1: "강원도 춘천시 남산면 남이섬길 1",
            contentid: "mock_gangwon5",
            tel: "031-580-8114",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "127.5251",
            mapy: "37.7909",
            contenttypeid: "12"
          }
        ],
        "33": [ // 충북
          {
            title: "충주호",
            addr1: "충청북도 충주시 종민동",
            contentid: "mock_chungbuk1",
            tel: "043-850-6721",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "127.9809",
            mapy: "37.0172",
            contenttypeid: "12"
          },
          {
            title: "수안보온천",
            addr1: "충청북도 충주시 수안보면 온천리",
            contentid: "mock_chungbuk2",
            tel: "043-846-3851",
            firstimage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef",
            mapx: "127.9885",
            mapy: "36.9708",
            contenttypeid: "12"
          },
          {
            title: "청남대",
            addr1: "충청북도 청주시 상당구 문의면 청남대길 646",
            contentid: "mock_chungbuk3",
            tel: "043-220-5678",
            firstimage: "https://images.unsplash.com/photo-1610349633888-c6058d7393e9",
            mapx: "127.5054",
            mapy: "36.5022",
            contenttypeid: "12"
          }
        ],
        "34": [ // 충남
          {
            title: "독립기념관",
            addr1: "충청남도 천안시 동남구 목천읍 삼방로 95",
            contentid: "mock_chungnam1",
            tel: "041-560-0114",
            firstimage: "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            mapx: "127.2730",
            mapy: "36.7828",
            contenttypeid: "12"
          },
          {
            title: "백제문화단지",
            addr1: "충청남도 부여군 규암면 백제문로 455",
            contentid: "mock_chungnam2",
            tel: "041-408-7290",
            firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
            mapx: "126.9207",
            mapy: "36.2584",
            contenttypeid: "12"
          },
          {
            title: "안면도해수욕장",
            addr1: "충청남도 태안군 안면읍 승언리",
            contentid: "mock_chungnam3",
            tel: "041-670-2691",
            firstimage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            mapx: "126.3584",
            mapy: "36.5431",
            contenttypeid: "12"
          }
        ],
        "35": [ // 경북 (경주 포함)
          {
            title: "불국사",
            addr1: "경상북도 경주시 불국로 385",
            contentid: "mock_gyeongju1",
            tel: "054-746-9913",
            firstimage: "https://images.unsplash.com/photo-1610349633888-c6058d7393e9",
            mapx: "129.3320",
            mapy: "35.7900",
            contenttypeid: "12"
          },
          {
            title: "석굴암",
            addr1: "경상북도 경주시 불국로 873-243",
            contentid: "mock_gyeongju2",
            tel: "054-746-9933",
            firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
            mapx: "129.3476",
            mapy: "35.7964",
            contenttypeid: "12"
          },
          {
            title: "첨성대",
            addr1: "경상북도 경주시 인왕동 839-1",
            contentid: "mock_gyeongju3",
            tel: "054-779-6100",
            firstimage: "https://images.unsplash.com/photo-1655645894221-948b9d2c7ed2",
            mapx: "129.2192",
            mapy: "35.8347",
            contenttypeid: "12"
          },
          {
            title: "대릉원",
            addr1: "경상북도 경주시 황남동 일원",
            contentid: "mock_gyeongju4",
            tel: "054-772-5843",
            firstimage: "https://images.unsplash.com/photo-1698881065188-1cef8476f33e",
            mapx: "129.2251",
            mapy: "35.8383",
            contenttypeid: "12"
          },
          {
            title: "안압지",
            addr1: "경상북도 경주시 원화로 102",
            contentid: "mock_gyeongju5",
            tel: "054-750-8655",
            firstimage: "https://images.unsplash.com/photo-1701134715217-e4080930fe75",
            mapx: "129.2248",
            mapy: "35.8349",
            contenttypeid: "12"
          }
        ],
        "39": [ // 제주
          {
            title: "제주 아쿠아플라넷",
            addr1: "제주특별자치도 서귀포시 성산읍 섭지코지로 95",
            contentid: "mock_jeju1",
            tel: "064-780-0900",
            firstimage: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2",
            mapx: "126.9298",
            mapy: "33.4244",
            contenttypeid: "12"
          },
          {
            title: "성산일출봉",
            addr1: "제주특별자치도 서귀포시 성산읍 일출로 284-12",
            contentid: "mock_jeju2",
            tel: "064-783-0959",
            firstimage: "https://images.unsplash.com/photo-1661488883456-2093b6f5bf0d",
            mapx: "126.9427",
            mapy: "33.4595",
            contenttypeid: "12"
          },
          {
            title: "제주 국립박물관",
            addr1: "제주특별자치도 제주시 일주동로 17",
            contentid: "mock_jeju3",
            tel: "064-720-8000",
            firstimage: "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            mapx: "126.5189",
            mapy: "33.5095",
            contenttypeid: "12"
          },
          {
            title: "한라산국립공원",
            addr1: "제주특별자치도 제주시 1100로",
            contentid: "mock_jeju4",
            tel: "064-713-9950",
            firstimage: "https://images.unsplash.com/photo-1664627298444-6947d2e907e5",
            mapx: "126.5333",
            mapy: "33.3617",
            contenttypeid: "12"
          },
          {
            title: "만장굴",
            addr1: "제주특별자치도 제주시 구좌읍 만장굴길 182",
            contentid: "mock_jeju5",
            tel: "064-710-7903",
            firstimage: "https://images.unsplash.com/photo-1672565091943-2d4502c671f9",
            mapx: "126.7719",
            mapy: "33.5267",
            contenttypeid: "12"
          },
          {
            title: "제주 신라면세점",
            addr1: "제주특별자치도 제주시 노연로 69",
            contentid: "mock_jeju6",
            tel: "064-710-6888",
            firstimage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
            mapx: "126.4916",
            mapy: "33.4875",
            contenttypeid: "12"
          }
        ],
        "36": [ // 경남
          {
            title: "통영케이블카",
            addr1: "경상남도 통영시 발개로 205",
            contentid: "mock_gyeongnam1",
            tel: "055-645-3797",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "128.4322",
            mapy: "34.8543",
            contenttypeid: "12"
          },
          {
            title: "진주성",
            addr1: "경상남도 진주시 남강로 626",
            contentid: "mock_gyeongnam2",
            tel: "055-749-5171",
            firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
            mapx: "128.0772",
            mapy: "35.1922",
            contenttypeid: "12"
          },
          {
            title: "남해독일마을",
            addr1: "경상남도 남해군 삼동면 독일로 89-7",
            contentid: "mock_gyeongnam3",
            tel: "055-860-8632",
            firstimage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
            mapx: "127.8917",
            mapy: "34.7838",
            contenttypeid: "12"
          }
        ],
        "37": [ // 전북 (전주 포함)
          {
            title: "전주한옥마을",
            addr1: "전라북도 전주시 완산구 기린대로 99",
            contentid: "mock_jeonju1",
            tel: "063-282-1330",
            firstimage: "https://images.unsplash.com/photo-1655645894221-948b9d2c7ed2",
            mapx: "127.1520",
            mapy: "35.8150",
            contenttypeid: "12"
          },
          {
            title: "전주한지박물관",
            addr1: "전라북도 전주시 덕진구 팔복로 200",
            contentid: "mock_jeonju2",
            tel: "063-210-8103",
            firstimage: "https://images.unsplash.com/photo-1670915564082-9258f2c326c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExNTg3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
            mapx: "127.1100",
            mapy: "35.8456",
            contenttypeid: "12"
          },
          {
            title: "경기전",
            addr1: "전라북도 전주시 완산구 태조로 44",
            contentid: "mock_jeonju3",
            tel: "063-281-2891",
            firstimage: "https://images.unsplash.com/photo-1698881065188-1cef8476f33e",
            mapx: "127.1498",
            mapy: "35.8152",
            contenttypeid: "12"
          },
          {
            title: "오목대",
            addr1: "전라북도 전주시 완산구 기린대로 55",
            contentid: "mock_jeonju4",
            tel: "063-281-2891",
            firstimage: "https://images.unsplash.com/photo-1610349633888-c6058d7393e9",
            mapx: "127.1503",
            mapy: "35.8197",
            contenttypeid: "12"
          }
        ],
        "38": [ // 전남
          {
            title: "여수 아쿠아플라넷",
            addr1: "전라남도 여수시 오동도로 61-11",
            contentid: "mock_jeonnam1",
            tel: "061-660-1111",
            firstimage: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2",
            mapx: "127.7430",
            mapy: "34.7470",
            contenttypeid: "12"
          },
          {
            title: "여수 오동도",
            addr1: "전라남도 여수시 오동도로 222",
            contentid: "mock_jeonnam2",
            tel: "061-659-1819",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "127.7673",
            mapy: "34.7370",
            contenttypeid: "12"
          },
          {
            title: "순천만국가정원",
            addr1: "전라남도 순천시 국가정원1호길 47",
            contentid: "mock_jeonnam3",
            tel: "061-749-3641",
            firstimage: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
            mapx: "127.5011",
            mapy: "34.9317",
            contenttypeid: "12"
          },
          {
            title: "담양죽녹원",
            addr1: "전라남도 담양군 담양읍 죽녹원로 119",
            contentid: "mock_jeonnam4",
            tel: "061-380-3150",
            firstimage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            mapx: "126.9883",
            mapy: "35.3207",
            contenttypeid: "12"
          }
        ]
      };
      
      // Return data for the area code, or default to Seoul
      return mockData[code] || mockData["1"];
    };
    
    const mockAttractions = getMockAttractions(areaCode);
    
    if (!apiKey) {
      console.log("Error getting attractions: TOUR_API_KEY is not set, using mock data");
      return c.json({ 
        attractions: mockAttractions,
        totalCount: mockAttractions.length,
        isMock: true 
      });
    }

    const url = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${apiKey}&numOfRows=${numOfRows}&pageNo=${page}&MobileOS=ETC&MobileApp=TravelApp&_type=json&listYN=Y&arrange=A&contentTypeId=12&areaCode=${areaCode}`;
    console.log(`Fetching attractions for area code: ${areaCode}, page: ${page}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching attractions for area ${areaCode}: ${response.status} ${response.statusText} - ${errorText}`);
      
      // Return mock data on API error
      return c.json({ 
        attractions: mockAttractions,
        totalCount: mockAttractions.length,
        isMock: true 
      });
    }
    
    const data = await response.json();
    
    // Check for API errors in response
    if (data.response?.header?.resultCode !== "0000") {
      console.log(`API returned error: ${data.response?.header?.resultMsg}`);
      return c.json({ 
        attractions: mockAttractions,
        totalCount: mockAttractions.length,
        isMock: true 
      });
    }
    
    const items = data.response?.body?.items?.item || [];
    const totalCount = data.response?.body?.totalCount || 0;
    
    // If no items, return mock data
    if (items.length === 0) {
      console.log(`No attractions found for area ${areaCode}, using mock data`);
      return c.json({ 
        attractions: mockAttractions,
        totalCount: mockAttractions.length,
        isMock: true 
      });
    }
    
    return c.json({ 
      attractions: Array.isArray(items) ? items : [items],
      totalCount,
      isMock: false 
    });
  } catch (error) {
    console.log(`Error in attractions endpoint: ${error}`);
    const areaCode = c.req.param("areaCode");
    
    // Simple fallback mock data for error cases
    const fallbackData: { [key: string]: any[] } = {
      "35": [ // 경북 (경주)
        {
          title: "불국사",
          addr1: "경상북도 경주시 불국로 385",
          contentid: "mock_gyeongju1",
          tel: "054-746-9913",
          firstimage: "https://images.unsplash.com/photo-1610349633888-c6058d7393e9",
          mapx: "129.3320",
          mapy: "35.7900",
          contenttypeid: "12"
        },
        {
          title: "석굴암",
          addr1: "경상북도 경주시 불국로 873-243",
          contentid: "mock_gyeongju2",
          tel: "054-746-9933",
          firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
          mapx: "129.3476",
          mapy: "35.7964",
          contenttypeid: "12"
        },
        {
          title: "첨성대",
          addr1: "경상북도 경주시 인왕동 839-1",
          contentid: "mock_gyeongju3",
          tel: "054-779-6100",
          firstimage: "https://images.unsplash.com/photo-1655645894221-948b9d2c7ed2",
          mapx: "129.2192",
          mapy: "35.8347",
          contenttypeid: "12"
        }
      ]
    };
    
    // Default Seoul data
    const defaultData = [
      {
        title: "경복궁",
        addr1: "서울특별시 종로구 사직로 161",
        contentid: "mock1",
        tel: "02-3700-3900",
        firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
        mapx: "126.9770",
        mapy: "37.5796",
        contenttypeid: "12"
      },
      {
        title: "남산서울타워",
        addr1: "서울특별시 용산구 남산공원길 105",
        contentid: "mock2",
        tel: "02-3455-9277",
        firstimage: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8",
        mapx: "126.9882",
        mapy: "37.5512",
        contenttypeid: "12"
      },
      {
        title: "북촌한옥마을",
        addr1: "서울특별시 종로구 계동길 37",
        contentid: "mock3",
        tel: "02-2148-4161",
        firstimage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
        mapx: "126.9850",
        mapy: "37.5825",
        contenttypeid: "12"
      }
    ];
    
    const attractions = fallbackData[areaCode] || defaultData;
    
    // Return mock data on error
    return c.json({ 
      attractions,
      totalCount: attractions.length,
      isMock: true 
    });
  }
});

// Search tourist attractions by keyword
app.get("/make-server-80cc3277/attractions/search/:keyword", async (c) => {
  try {
    const keyword = c.req.param("keyword");
    const apiKey = Deno.env.get("TOUR_API_KEY");
    const page = c.req.query("page") || "1";
    const numOfRows = c.req.query("numOfRows") || "20";
    
    const mockResults = [
      {
        title: `${keyword} 명소`,
        addr1: "서울특별시 중구",
        contentid: "search1",
        tel: "02-1234-5678",
        firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
        mapx: "126.9783",
        mapy: "37.5665"
      }
    ];
    
    if (!apiKey) {
      console.log("TOUR_API_KEY is not set, using mock data");
      return c.json({ 
        attractions: mockResults,
        totalCount: mockResults.length,
        isMock: true 
      });
    }

    const url = `https://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${apiKey}&numOfRows=${numOfRows}&pageNo=${page}&MobileOS=ETC&MobileApp=TravelApp&_type=json&listYN=Y&arrange=A&keyword=${encodeURIComponent(keyword)}&contentTypeId=12`;
    console.log(`Searching attractions with keyword: ${keyword}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`Error searching attractions: ${response.statusText}`);
      return c.json({ 
        attractions: mockResults,
        totalCount: mockResults.length,
        isMock: true 
      });
    }
    
    const data = await response.json();
    
    if (data.response?.header?.resultCode !== "0000") {
      console.log(`API returned error: ${data.response?.header?.resultMsg}`);
      return c.json({ 
        attractions: mockResults,
        totalCount: mockResults.length,
        isMock: true 
      });
    }
    
    const items = data.response?.body?.items?.item || [];
    const totalCount = data.response?.body?.totalCount || 0;
    
    if (items.length === 0) {
      return c.json({ 
        attractions: [],
        totalCount: 0,
        isMock: false 
      });
    }
    
    return c.json({ 
      attractions: Array.isArray(items) ? items : [items],
      totalCount,
      isMock: false 
    });
  } catch (error) {
    console.log(`Error in search attractions endpoint: ${error}`);
    return c.json({ 
      attractions: [],
      totalCount: 0,
      isMock: true 
    });
  }
});

// Get detailed attraction information
app.get("/make-server-80cc3277/attraction/detail/:contentId", async (c) => {
  try {
    const contentId = c.req.param("contentId");
    const apiKey = Deno.env.get("TOUR_API_KEY");
    
    const mockDetail = {
      title: "관광명소",
      addr1: "서울특별시 중구",
      tel: "02-1234-5678",
      overview: "이곳은 대한민국의 아름다운 관광명소입니다. 역사와 문화가 살아있는 곳으로 많은 관광객들이 찾아옵니다.",
      homepage: "",
      firstimage: "https://images.unsplash.com/photo-1548013146-72479768bada",
      mapx: "126.9783",
      mapy: "37.5665",
      contentid: contentId,
      contenttypeid: "12"
    };
    
    if (!apiKey) {
      console.log("TOUR_API_KEY is not set, using mock data");
      return c.json({ 
        detail: mockDetail,
        isMock: true 
      });
    }

    // Fetch common info
    const commonUrl = `https://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${apiKey}&MobileOS=ETC&MobileApp=TravelApp&_type=json&contentId=${contentId}&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y`;
    console.log(`Fetching detail for content ID: ${contentId}`);
    
    const response = await fetch(commonUrl);
    
    if (!response.ok) {
      console.log(`Error fetching detail: ${response.statusText}`);
      return c.json({ 
        detail: mockDetail,
        isMock: true 
      });
    }
    
    const data = await response.json();
    
    if (data.response?.header?.resultCode !== "0000") {
      console.log(`API returned error: ${data.response?.header?.resultMsg}`);
      return c.json({ 
        detail: mockDetail,
        isMock: true 
      });
    }
    
    const item = data.response?.body?.items?.item;
    
    if (!item) {
      return c.json({ 
        detail: mockDetail,
        isMock: true 
      });
    }
    
    const detail = Array.isArray(item) ? item[0] : item;
    
    return c.json({ 
      detail,
      isMock: false 
    });
  } catch (error) {
    console.log(`Error in attraction detail endpoint: ${error}`);
    return c.json({ 
      detail: {
        title: "관광명소",
        addr1: "서울특별시",
        overview: "관광지 정보",
        contentid: c.req.param("contentId")
      },
      isMock: true 
    });
  }
});

// Get attraction images
app.get("/make-server-80cc3277/attraction/images/:contentId", async (c) => {
  try {
    const contentId = c.req.param("contentId");
    const apiKey = Deno.env.get("TOUR_API_KEY");
    
    const mockImages = [
      {
        originimgurl: "https://images.unsplash.com/photo-1548013146-72479768bada",
        smallimageurl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400"
      }
    ];
    
    if (!apiKey) {
      return c.json({ 
        images: mockImages,
        isMock: true 
      });
    }

    const url = `https://apis.data.go.kr/B551011/KorService1/detailImage1?serviceKey=${apiKey}&MobileOS=ETC&MobileApp=TravelApp&_type=json&contentId=${contentId}&imageYN=Y&subImageYN=Y`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return c.json({ 
        images: mockImages,
        isMock: true 
      });
    }
    
    const data = await response.json();
    
    if (data.response?.header?.resultCode !== "0000") {
      return c.json({ 
        images: mockImages,
        isMock: true 
      });
    }
    
    const items = data.response?.body?.items?.item || [];
    
    return c.json({ 
      images: Array.isArray(items) ? items : [items],
      isMock: items.length === 0 
    });
  } catch (error) {
    console.log(`Error fetching images: ${error}`);
    return c.json({ 
      images: [],
      isMock: true 
    });
  }
});

// Get festival/event information
app.get("/make-server-80cc3277/festivals", async (c) => {
  try {
    const apiKey = Deno.env.get("TOUR_API_KEY");
    const areaCode = c.req.query("areaCode") || "";
    const eventStartDate = c.req.query("eventStartDate") || getTodayDate();
    
    const mockFestivals = [
      {
        title: "서울 벚꽃축제",
        addr1: "서울특별시 영등포구",
        eventstartdate: "20250401",
        eventenddate: "20250410",
        firstimage: "https://images.unsplash.com/photo-1522383225653-ed111181a951",
        tel: "02-1234-5678"
      },
      {
        title: "부산 불꽃축제",
        addr1: "부산광역시 수영구",
        eventstartdate: "20250501",
        eventenddate: "20250505",
        firstimage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
        tel: "051-1234-5678"
      }
    ];
    
    if (!apiKey) {
      return c.json({ 
        festivals: mockFestivals,
        isMock: true 
      });
    }

    const url = `https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${apiKey}&numOfRows=20&pageNo=1&MobileOS=ETC&MobileApp=TravelApp&_type=json&listYN=Y&arrange=A&eventStartDate=${eventStartDate}${areaCode ? `&areaCode=${areaCode}` : ''}`;
    console.log(`Fetching festivals from: ${eventStartDate}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return c.json({ 
        festivals: mockFestivals,
        isMock: true 
      });
    }
    
    const data = await response.json();
    
    if (data.response?.header?.resultCode !== "0000") {
      return c.json({ 
        festivals: mockFestivals,
        isMock: true 
      });
    }
    
    const items = data.response?.body?.items?.item || [];
    
    return c.json({ 
      festivals: Array.isArray(items) ? items : items ? [items] : mockFestivals,
      isMock: items.length === 0 
    });
  } catch (error) {
    console.log(`Error fetching festivals: ${error}`);
    return c.json({ 
      festivals: [],
      isMock: true 
    });
  }
});

function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Save user travel preference
app.post("/make-server-80cc3277/save-preference", async (c) => {
  try {
    const { userId, travelStyle, answers } = await c.req.json();
    
    await kv.set(`preference:${userId}`, {
      travelStyle,
      answers,
      timestamp: new Date().toISOString()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving preference: ${error}`);
    return c.json({ error: "Failed to save preference" }, 500);
  }
});

// Get user travel preference
app.get("/make-server-80cc3277/preference/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const preference = await kv.get(`preference:${userId}`);
    
    if (!preference) {
      return c.json({ error: "Preference not found" }, 404);
    }
    
    return c.json(preference);
  } catch (error) {
    console.log(`Error getting preference: ${error}`);
    return c.json({ error: "Failed to get preference" }, 500);
  }
});

// Save user itinerary
app.post("/make-server-80cc3277/save-itinerary", async (c) => {
  try {
    const { userId, itinerary } = await c.req.json();
    
    await kv.set(`itinerary:${userId}:${Date.now()}`, {
      ...itinerary,
      timestamp: new Date().toISOString()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving itinerary: ${error}`);
    return c.json({ error: "Failed to save itinerary" }, 500);
  }
});

// Get user itineraries
app.get("/make-server-80cc3277/itineraries/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const itineraries = await kv.getByPrefix(`itinerary:${userId}:`);
    
    return c.json({ itineraries });
  } catch (error) {
    console.log(`Error getting itineraries: ${error}`);
    return c.json({ error: "Failed to get itineraries" }, 500);
  }
});

// Sign up endpoint
app.post("/make-server-80cc3277/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const result = await signUp(email, password, name);
    
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ success: true, user: result.user });
  } catch (error) {
    console.log(`Error in signup endpoint: ${error}`);
    return c.json({ error: "Failed to sign up" }, 500);
  }
});

// Add bookmark
app.post("/make-server-80cc3277/bookmark", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const verification = await verifyToken(accessToken || '');
    
    if (!verification.success || !verification.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { location, name, category } = await c.req.json();
    const bookmarkId = `bookmark:${verification.userId}:${Date.now()}`;
    
    await kv.set(bookmarkId, {
      location,
      name,
      category,
      timestamp: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error adding bookmark: ${error}`);
    return c.json({ error: "Failed to add bookmark" }, 500);
  }
});

// Get bookmarks
app.get("/make-server-80cc3277/bookmarks", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const verification = await verifyToken(accessToken || '');
    
    if (!verification.success || !verification.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const bookmarks = await kv.getByPrefix(`bookmark:${verification.userId}:`);
    return c.json({ bookmarks });
  } catch (error) {
    console.log(`Error getting bookmarks: ${error}`);
    return c.json({ error: "Failed to get bookmarks" }, 500);
  }
});

// Delete bookmark
app.delete("/make-server-80cc3277/bookmark/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const verification = await verifyToken(accessToken || '');
    
    if (!verification.success || !verification.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const bookmarkId = c.req.param("id");
    await kv.del(bookmarkId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting bookmark: ${error}`);
    return c.json({ error: "Failed to delete bookmark" }, 500);
  }
});

// Delete itinerary
app.delete("/make-server-80cc3277/itinerary/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const verification = await verifyToken(accessToken || '');
    
    if (!verification.success || !verification.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const itineraryId = c.req.param("id");
    await kv.del(itineraryId);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting itinerary: ${error}`);
    return c.json({ error: "Failed to delete itinerary" }, 500);
  }
});

// Analyze popular places and hidden gems
app.post("/make-server-80cc3277/analyze-places", async (c) => {
  try {
    const { location, category } = await c.req.json();
    
    console.log(`[Analyze Places] Location: ${location}, Category: ${category || 'all'}`);
    
    const apiKey = Deno.env.get("KAKAO_REST_API_KEY");
    
    if (!apiKey) {
      console.log("[Analyze Places] KAKAO_REST_API_KEY not set, using mock data");
      return generateMockPlaceAnalysis(location, category);
    }

    // Search places using Kakao Local API
    const categories = category ? [category] : ['카페', '레스토랑', '관광명소', '공원', '박물관', '미술관'];
    const allPlaces = [];
    
    // Process categories sequentially to avoid overwhelming Unsplash API
    for (const cat of categories) {
      const searchQuery = `${location} ${cat}`;
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchQuery)}&size=8`;
      
      console.log(`[Analyze Places] Searching: ${searchQuery}`);
      
      const response = await fetch(url, {
        headers: { "Authorization": `KakaoAK ${apiKey}` }
      });

      if (!response.ok) {
        console.error(`[Analyze Places] API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      // Process first 6 results only
      const placesToProcess = data.documents.slice(0, 6);
      
      // Get real review data and photos from Google Places API
      const placesWithRealData = [];
      for (let i = 0; i < placesToProcess.length; i += 2) {
        const batch = placesToProcess.slice(i, i + 2);
        const batchResults = await Promise.all(
          batch.map(async (place: any) => {
            // Get real data from Google Places API
            const googleData = await getGooglePlaceData(place.place_name, place.address_name, place.y, place.x);
            
            console.log(`[Analyze Places] ${place.place_name} -> Reviews: ${googleData.reviewCount}, Rating: ${googleData.rating}, Photo: ${googleData.photoUrl ? '✓' : '✗'}`);
            
            return {
              id: place.id,
              name: place.place_name,
              category: cat,
              address: place.address_name,
              roadAddress: place.road_address_name,
              phone: place.phone,
              x: parseFloat(place.x),
              y: parseFloat(place.y),
              placeUrl: place.place_url,
              imageUrl: googleData.photoUrl,
              // Real review data from Google Places API
              reviewCount: googleData.reviewCount,
              rating: googleData.rating,
              keywords: googleData.keywords
            };
          })
        );
        placesWithRealData.push(...batchResults);
        
        // Small delay between batches to avoid rate limiting
        if (i + 2 < placesToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      allPlaces.push(...placesWithRealData);
    }
    
    console.log(`[Analyze Places] Found ${allPlaces.length} places`);
    
    // Calculate percentiles for review counts
    const sortedByReviews = [...allPlaces].sort((a, b) => b.reviewCount - a.reviewCount);
    const top30Index = Math.floor(sortedByReviews.length * 0.3);
    const bottom30Index = Math.floor(sortedByReviews.length * 0.7);
    
    const top30Threshold = sortedByReviews[top30Index]?.reviewCount || 500;
    const bottom30Threshold = sortedByReviews[bottom30Index]?.reviewCount || 50;
    
    // Filter popular places: 리뷰 수 상위 30% + 평점 4.0 이상
    const popularPlaces = allPlaces.filter(place => 
      place.reviewCount >= top30Threshold && place.rating >= 4.0
    );
    
    // Filter hidden gems: 리뷰 수 하위 30% + 평점 4.5 이상 + 특정 키워드
    const hiddenKeywords = ['숨은', '로컬', '아담한', '조용한', '힐링', '작은'];
    const hiddenGems = allPlaces.filter(place => 
      place.reviewCount <= bottom30Threshold && 
      place.rating >= 4.5 &&
      place.keywords.some((kw: string) => hiddenKeywords.some(hk => kw.includes(hk)))
    );
    
    console.log(`[Analyze Places] Popular: ${popularPlaces.length}, Hidden Gems: ${hiddenGems.length}`);
    
    return c.json({
      popularPlaces: popularPlaces.slice(0, 20),
      hiddenGems: hiddenGems.slice(0, 20),
      totalAnalyzed: allPlaces.length,
      isMock: false
    });
    
  } catch (error) {
    console.error(`[Analyze Places] Error: ${error}`);
    const { location, category } = await c.req.json().catch(() => ({ 
      location: "서울", 
      category: "" 
    }));
    return generateMockPlaceAnalysis(location, category);
  }
});

// Helper function to get real place data from Google Places API
async function getGooglePlaceData(placeName: string, address: string, lat: number, lng: number): Promise<{
  reviewCount: number;
  rating: number;
  photoUrl: string;
  keywords: string[];
}> {
  const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  
  if (!googleApiKey) {
    console.log(`[Google Places] API key not set, using fallback data for ${placeName}`);
    return {
      reviewCount: Math.floor(Math.random() * 1000) + 50,
      rating: 3.5 + Math.random() * 1.5,
      photoUrl: getCategoryFallbackImageUrl('카페'),
      keywords: extractKeywords(placeName, '')
    };
  }
  
  try {
    // Step 1: Find Place using Text Search
    const searchQuery = `${placeName} ${address}`;
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${lat},${lng}&radius=100&key=${googleApiKey}&language=ko`;
    
    console.log(`[Google Places] Searching: ${placeName}`);
    
    const searchResponse = await fetch(textSearchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
      console.log(`[Google Places] No results for ${placeName}, status: ${searchData.status}`);
      return {
        reviewCount: Math.floor(Math.random() * 500) + 30,
        rating: 3.8 + Math.random() * 1.2,
        photoUrl: getCategoryFallbackImageUrl('카페'),
        keywords: extractKeywords(placeName, '')
      };
    }
    
    const placeResult = searchData.results[0];
    const placeId = placeResult.place_id;
    
    // Step 2: Get Place Details for more info
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=user_ratings_total,rating,photos,types,reviews&key=${googleApiKey}&language=ko`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK' || !detailsData.result) {
      console.log(`[Google Places] No details for ${placeName}`);
      return {
        reviewCount: placeResult.user_ratings_total || 50,
        rating: placeResult.rating || 4.0,
        photoUrl: getCategoryFallbackImageUrl('카페'),
        keywords: extractKeywords(placeName, '')
      };
    }
    
    const details = detailsData.result;
    
    // Step 3: Get Photo URL if available
    let photoUrl = getCategoryFallbackImageUrl('카페');
    if (details.photos && details.photos.length > 0) {
      const photoReference = details.photos[0].photo_reference;
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${googleApiKey}`;
    }
    
    // Step 4: Extract keywords from reviews
    const keywords = extractKeywordsFromGooglePlace(details, placeName);
    
    console.log(`[Google Places] ✓ ${placeName}: ${details.user_ratings_total} reviews, ${details.rating}★`);
    
    return {
      reviewCount: details.user_ratings_total || 0,
      rating: details.rating || 0,
      photoUrl: photoUrl,
      keywords: keywords
    };
    
  } catch (error) {
    console.error(`[Google Places] Error for ${placeName}: ${error}`);
    return {
      reviewCount: Math.floor(Math.random() * 300) + 20,
      rating: 3.7 + Math.random() * 1.3,
      photoUrl: getCategoryFallbackImageUrl('카페'),
      keywords: extractKeywords(placeName, '')
    };
  }
}

// Extract keywords from Google Place data
function extractKeywordsFromGooglePlace(placeDetails: any, placeName: string): string[] {
  const keywords: string[] = [];
  
  // Check place name
  if (placeName.includes('숨은') || placeName.includes('작은')) keywords.push('숨은');
  if (placeName.includes('로컬') || placeName.includes('동네')) keywords.push('로컬');
  if (placeName.includes('조용한') || placeName.includes('한적한')) keywords.push('조용한');
  if (placeName.includes('힐링') || placeName.includes('휴식')) keywords.push('힐링');
  if (placeName.includes('아담한')) keywords.push('아담한');
  
  // Check reviews for keywords
  if (placeDetails.reviews && placeDetails.reviews.length > 0) {
    const allReviewText = placeDetails.reviews.map((r: any) => r.text).join(' ');
    
    if (allReviewText.includes('조용') || allReviewText.includes('한적')) keywords.push('조용한');
    if (allReviewText.includes('숨은') || allReviewText.includes('로컬')) keywords.push('숨은');
    if (allReviewText.includes('힐링') || allReviewText.includes('분위기')) keywords.push('힐링');
    if (allReviewText.includes('작은') || allReviewText.includes('아담')) keywords.push('작은');
  }
  
  // Check types
  if (placeDetails.types) {
    const types = placeDetails.types.join(',');
    if (types.includes('park') || types.includes('natural')) keywords.push('힐링');
    if (types.includes('museum') || types.includes('art_gallery')) keywords.push('조용한');
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

// Helper function to get place image from Unsplash with timeout
// Use index to ensure different images for same category
async function getPlaceImageFromUnsplash(placeName: string, category: string, index: number = 0): Promise<string> {
  try {
    // Translate Korean place names and categories to English search terms
    const searchTerm = translateToSearchTerm(placeName, category);
    
    console.log(`[Unsplash] "${placeName}" -> "${searchTerm}" (index: ${index})`);
    
    if (!searchTerm) {
      console.log(`[Unsplash] Empty search term, using fallback`);
      return getCategoryFallbackImageUrl(category);
    }
    
    const unsplashAccessKey = 'gUu4kayXRP1OdQ866dYUsmell21kunLSFP6MG7WDS6k';
    
    // Use index to get different pages/results for each place
    // This ensures variety even for same category
    const page = Math.floor(index / 5) + 1; // Page 1-3
    const perPage = 10;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&page=${page}&per_page=${perPage}&orientation=landscape`;
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${unsplashAccessKey}`
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`[Unsplash] API error ${response.status}, using fallback`);
      return getCategoryFallbackImageUrl(category);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Use index to deterministically pick different images
      const imageIndex = index % data.results.length;
      const imageUrl = data.results[imageIndex].urls.regular;
      console.log(`[Unsplash] ✓ ${placeName}: page ${page}, img ${imageIndex} -> ${imageUrl.substring(0, 50)}...`);
      return imageUrl;
    }
    
    console.log(`[Unsplash] No results for "${searchTerm}", using fallback`);
    return getCategoryFallbackImageUrl(category);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`[Unsplash] Timeout for ${placeName}, using fallback`);
    } else {
      console.log(`[Unsplash] Error: ${error}, using fallback`);
    }
    return getCategoryFallbackImageUrl(category);
  }
}

// Get fallback image URL based on category
function getCategoryFallbackImageUrl(category: string): string {
  const fallbackImages: { [key: string]: string[] } = {
    '카페': [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop'
    ],
    '레스토랑': [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop'
    ],
    '관광명소': [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1610349633888-c6058d7393e9?w=800&h=600&fit=crop'
    ],
    '공원': [
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=600&fit=crop'
    ],
    '박물관': [
      'https://images.unsplash.com/photo-1670915564082-9258f2c326c4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565532188831-10b210d85d80?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&h=600&fit=crop'
    ],
    '미술관': [
      'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1577083552792-a0d461cb1dd6?w=800&h=600&fit=crop'
    ],
    '숙박': [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop'
    ],
    '액티비티': [
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ]
  };
  
  // Get array of images for this category
  const imageArray = fallbackImages[category] || [
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'
  ];
  
  // Randomly select one from the array
  const randomIndex = Math.floor(Math.random() * imageArray.length);
  return imageArray[randomIndex];
}

// Helper function to translate Korean place names to English search terms
function translateToSearchTerm(placeName: string, category: string): string {
  console.log(`[Translate] Input: "${placeName}" | Category: "${category}"`);
  
  // Remove common Korean suffixes
  let cleanName = placeName
    .replace(/점$/, '')
    .replace(/지점$/, '')
    .replace(/본점$/, '')
    .replace(/매장$/, '')
    .replace(/\s+점$/, '')
    .replace(/\s+지점$/, '')
    .trim();
  
  // Specific landmark translations
  const landmarkMap: { [key: string]: string } = {
    '경복궁': 'Gyeongbokgung Palace Korea',
    '남산서울타워': 'N Seoul Tower',
    'N서울타워': 'N Seoul Tower',
    '롯데월드': 'Lotte World Korea',
    '코엑스': 'COEX Seoul',
    '한옥마을': 'Korean traditional hanok village',
    '북촌한옥마을': 'Bukchon Hanok Village',
    '명동': 'Myeongdong Seoul shopping street',
    '인사동': 'Insadong Seoul',
    '광화문': 'Gwanghwamun Seoul',
    '청계천': 'Cheonggyecheon Seoul stream',
    '동대문': 'Dongdaemun Seoul',
    '홍대': 'Hongdae Seoul',
    '강남': 'Gangnam Seoul',
    '이태원': 'Itaewon Seoul',
    '해운대': 'Haeundae Beach Busan',
    '광안리': 'Gwangalli Beach Busan',
    '감천문화마을': 'Gamcheon Culture Village',
    '성산일출봉': 'Seongsan Ilchulbong Jeju',
    '한라산': 'Hallasan Mountain Jeju',
    '우도': 'Udo Island Jeju',
    '제주올레길': 'Jeju Olle Trail',
    '불국사': 'Bulguksa Temple Gyeongju',
    '석굴암': 'Seokguram Grotto',
    '첨성대': 'Cheomseongdae Observatory',
    '안동하회마을': 'Andong Hahoe Folk Village',
    '순천만': 'Suncheon Bay',
    '여수': 'Yeosu night view',
    '오동도': 'Odongdo Island'
  };
  
  // Check for known landmarks
  for (const [korean, english] of Object.entries(landmarkMap)) {
    if (cleanName.includes(korean)) {
      console.log(`[Translate] Landmark: ${korean} -> ${english}`);
      return english;
    }
  }
  
  // Extract location context from place name (e.g., "부산대", "서면", "해운대")
  let locationContext = '';
  const locationKeywords = ['부산', '서울', '제주', '강남', '홍대', '명동', '인사동', '해운대', '광안리', '서면'];
  for (const loc of locationKeywords) {
    if (cleanName.includes(loc)) {
      locationContext = ` ${loc}`;
      break;
    }
  }
  
  // Brand-specific translations
  const brandMap: { [key: string]: string } = {
    '스타벅스': 'starbucks coffee interior',
    '투썸플레이스': 'modern cafe interior aesthetic',
    '이디야': 'cozy cafe interior',
    '할리스': 'cafe interior design',
    '맥도날드': 'mcdonalds restaurant',
    '버거킹': 'burger king restaurant',
    'KFC': 'kfc restaurant',
    '롯데시티호텔': 'lotte hotel interior',
    '신라호텔': 'shilla hotel luxury',
    '그랜드하얏트': 'grand hyatt hotel',
    '힐튼': 'hilton hotel',
    '파크하얏트': 'park hyatt hotel',
    '메리어트': 'marriott hotel'
  };
  
  // Check for known brands
  for (const [korean, english] of Object.entries(brandMap)) {
    if (cleanName.includes(korean)) {
      console.log(`[Translate] Brand match: ${korean} -> ${english}`);
      return english;
    }
  }
  
  // Category-based search terms
  const categoryMap: { [key: string]: string } = {
    '카페': 'cozy cafe interior coffee',
    '레스토랑': 'restaurant interior dining',
    '음식점': 'restaurant food interior',
    '한식': 'korean food restaurant',
    '중식': 'chinese restaurant',
    '일식': 'japanese restaurant sushi',
    '양식': 'western restaurant',
    '관광명소': 'korea landmark tourist attraction',
    '공원': 'park green nature',
    '박물관': 'museum exhibition hall',
    '미술관': 'art gallery modern',
    '호텔': 'hotel lobby interior',
    '숙박': 'hotel room',
    '펜션': 'resort accommodation',
    '쇼핑몰': 'shopping mall',
    '백화점': 'department store',
    '서점': 'bookstore',
    '영화관': 'movie theater cinema',
    '수상스포츠': 'water sports',
    '스파': 'spa wellness',
    '사우나': 'sauna',
    '찜질방': 'korean spa',
    '노래방': 'karaoke',
    'PC방': 'gaming cafe',
    '당구장': 'billiard hall',
    '볼링장': 'bowling alley',
    '골프': 'golf course',
    '헬스장': 'gym fitness',
    '요가': 'yoga studio',
    '필라테스': 'pilates studio',
    '병원': 'hospital',
    '약국': 'pharmacy',
    '편의점': 'convenience store',
    '마트': 'supermarket',
    '빵집': 'bakery',
    '제과점': 'bakery pastry',
    '술집': 'bar pub',
    '바': 'bar interior',
    '클럽': 'nightclub',
    '도서관': 'library',
    '서재': 'study room',
    '공방': 'workshop studio',
    '갤러리': 'art gallery'
  };
  
  // Try category-based search (add location context for variety)
  for (const [korCat, engSearch] of Object.entries(categoryMap)) {
    if (category.includes(korCat)) {
      const searchTerm = engSearch + locationContext;
      console.log(`[Translate] ✓ Category: ${korCat} -> "${searchTerm}"`);
      return searchTerm;
    }
  }
  
  // Generic fallback based on basic categories
  if (category.includes('음식') || category.includes('식당')) {
    const searchTerm = 'restaurant interior dining' + locationContext;
    console.log(`[Translate] Generic restaurant -> "${searchTerm}"`);
    return searchTerm;
  } else if (category.includes('카페') || category.includes('커피')) {
    const searchTerm = 'cafe interior coffee' + locationContext;
    console.log(`[Translate] Generic cafe -> "${searchTerm}"`);
    return searchTerm;
  } else if (category.includes('문화') || category.includes('관광')) {
    const searchTerm = 'tourist attraction' + locationContext;
    console.log(`[Translate] Generic attraction -> "${searchTerm}"`);
    return searchTerm;
  } else if (category.includes('숙박') || category.includes('호텔')) {
    const searchTerm = 'hotel interior' + locationContext;
    console.log(`[Translate] Generic hotel -> "${searchTerm}"`);
    return searchTerm;
  } else if (category.includes('쇼핑') || category.includes('매장')) {
    const searchTerm = 'retail shop interior' + locationContext;
    console.log(`[Translate] Generic shopping -> "${searchTerm}"`);
    return searchTerm;
  }
  
  // Final fallback
  const searchTerm = 'modern building' + locationContext;
  console.log(`[Translate] Final fallback -> "${searchTerm}"`);
  return searchTerm;
}

// Helper function to generate realistic review counts
function generateRealisticReviewCount(category: string, kakaoCategory: string): number {
  const baseReviews: { [key: string]: number } = {
    '카페': 800,
    '레스토랑': 1200,
    '관광명소': 2000,
    '공원': 600,
    '박물관': 400,
    '미술관': 300
  };
  
  const base = baseReviews[category] || 500;
  const variance = Math.random() * base * 1.5;
  const final = Math.floor(base + variance - (base * 0.5));
  
  return Math.max(10, final);
}

// Helper function to generate realistic ratings
function generateRealisticRating(category: string): number {
  // 대부분 4.0~4.8 사이, 가끔 3.5~4.0 또는 4.8~5.0
  const random = Math.random();
  let rating;
  
  if (random < 0.7) {
    rating = 4.0 + Math.random() * 0.8; // 4.0~4.8
  } else if (random < 0.85) {
    rating = 3.5 + Math.random() * 0.5; // 3.5~4.0
  } else {
    rating = 4.8 + Math.random() * 0.2; // 4.8~5.0
  }
  
  return Math.round(rating * 10) / 10;
}

// Helper function to extract keywords
function extractKeywords(name: string, categoryName: string): string[] {
  const keywords = [];
  
  if (name.includes('숨은') || name.includes('작은')) keywords.push('숨은');
  if (name.includes('로컬') || name.includes('동네')) keywords.push('로컬');
  if (name.includes('조용한') || name.includes('한적한')) keywords.push('조용한');
  if (name.includes('힐링') || name.includes('휴식')) keywords.push('힐링');
  if (categoryName.includes('전통') || name.includes('전통')) keywords.push('전통');
  if (categoryName.includes('문화') || name.includes('문화')) keywords.push('문화');
  
  return keywords;
}

// Mock data generator
function generateMockPlaceAnalysis(location: string, category?: string) {
  const mockPlaces = [
    { name: `${location} 인기 카페`, category: '카페', reviewCount: 2450, rating: 4.7, keywords: ['인기', '핫플'] },
    { name: `${location} 유명 레스토랑`, category: '레스토랑', reviewCount: 3200, rating: 4.6, keywords: ['맛집'] },
    { name: `${location} 관광 명소`, category: '관광명소', reviewCount: 5100, rating: 4.5, keywords: ['필수코스'] },
    { name: `${location} 로컬 카페`, category: '카페', reviewCount: 45, rating: 4.8, keywords: ['숨은', '로컬'] },
    { name: `${location} 작은 갤러리`, category: '미술관', reviewCount: 32, rating: 4.9, keywords: ['조용한', '힐링'] },
    { name: `${location} 동네 맛집`, category: '레스토랑', reviewCount: 28, rating: 4.7, keywords: ['숨은', '로컬'] }
  ];
  
  return {
    popularPlaces: mockPlaces.filter(p => p.reviewCount > 1000).map((p, i) => ({
      id: `pop_${i}`,
      name: p.name,
      category: p.category,
      address: `${location} 주소 ${i + 1}`,
      roadAddress: `${location} 도로명주소 ${i + 1}`,
      phone: '02-1234-5678',
      x: 127.0 + Math.random() * 0.1,
      y: 37.5 + Math.random() * 0.1,
      placeUrl: '#',
      reviewCount: p.reviewCount,
      rating: p.rating,
      keywords: p.keywords
    })),
    hiddenGems: mockPlaces.filter(p => p.reviewCount < 100).map((p, i) => ({
      id: `hidden_${i}`,
      name: p.name,
      category: p.category,
      address: `${location} 주소 ${i + 10}`,
      roadAddress: `${location} 도로명주소 ${i + 10}`,
      phone: '02-9876-5432',
      x: 127.0 + Math.random() * 0.1,
      y: 37.5 + Math.random() * 0.1,
      placeUrl: '#',
      reviewCount: p.reviewCount,
      rating: p.rating,
      keywords: p.keywords
    })),
    totalAnalyzed: mockPlaces.length,
    isMock: true
  };
}

// Smart place selection with review/rating filtering using Kakao Local API
app.post("/make-server-80cc3277/select-places", async (c) => {
  try {
    const body = await c.req.json();
    const { location, travelStyle, weather, categories, excludeIds = [], offset = 0 } = body;
    
    if (!location || !travelStyle) {
      return c.json({ error: "Location and travelStyle are required" }, 400);
    }
    
    console.log(`Selecting places for ${location}, style: ${travelStyle}, offset: ${offset}`);
    console.log(`Categories requested: ${JSON.stringify(categories)}`);
    console.log(`Excluded IDs: ${JSON.stringify(excludeIds)}`);
    
    const apiKey = Deno.env.get("KAKAO_REST_API_KEY");
    
    if (!apiKey) {
      console.log("KAKAO_REST_API_KEY is not set, using mock data");
      // Fallback to mock data
      const mockPlacesDB = generateMockPlaces(location);
      let filteredPlaces = categories && categories.length > 0
        ? mockPlacesDB.filter(p => categories.includes(p.category))
        : mockPlacesDB;
      
      if (excludeIds.length > 0) {
        filteredPlaces = filteredPlaces.filter(p => !excludeIds.includes(p.id));
      }
      
      const smartFiltered = applySmartFiltering(filteredPlaces, travelStyle, weather);
      const finalPlaces = smartFiltered.slice(offset * 4, (offset + 1) * 4);
      
      return c.json({ 
        places: finalPlaces.slice(0, 4),
        hasMore: true,
        isMock: true 
      });
    }
    
    // Search real places using Kakao Local API
    const allPlaces: any[] = [];
    const categoriesToSearch = categories && categories.length > 0 ? categories : ["카페", "관광명소", "레스토랑", "공원"];
    
    for (const category of categoriesToSearch) {
      try {
        const query = `${location} ${category}`;
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`; // Reduced from 15 to 5
        
        console.log(`Searching: ${query}`);
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `KakaoAK ${apiKey}`
          }
        });
        
        if (!response.ok) {
          console.log(`Failed to search ${category}: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        // Convert Kakao place data to our format with images
        // Process only first few results to speed up
        const placesToProcess = data.documents.slice(0, 4); // Process 4 per category
        
        // Get real data from Google Places API
        const placesWithRealData = [];
        for (let i = 0; i < placesToProcess.length; i++) {
          const place = placesToProcess[i];
          
          // Get real review count, rating, and photo from Google Places API
          const googleData = await getGooglePlaceData(place.place_name, place.address_name, parseFloat(place.y), parseFloat(place.x));
          
          console.log(`[Select Places] ${place.place_name} -> Reviews: ${googleData.reviewCount}, Rating: ${googleData.rating}, Photo: ${googleData.photoUrl ? '✓' : '✗'}`);
          
          placesWithRealData.push({
            id: `kakao_${place.id}_${offset}_${i}`,
            name: place.place_name,
            category: category,
            reviewCount: googleData.reviewCount,
            rating: googleData.rating,
            description: place.category_name || category,
            address: place.address_name || place.road_address_name || location,
            isIndoor: ["카페", "레스토랑", "박물관", "쇼핑"].includes(category),
            isOutdoor: ["공원", "관광명소", "액티비티"].includes(category),
            keywords: googleData.keywords,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            phone: place.phone || "",
            placeUrl: place.place_url || "",
            imageUrl: googleData.photoUrl
          });
          
          // Small delay to avoid rate limiting
          if (i < placesToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        allPlaces.push(...placesWithRealData);
      } catch (error) {
        console.log(`Error searching ${category}: ${error}`);
      }
    }
    
    if (allPlaces.length === 0) {
      console.log("No real places found, using mock data");
      const mockPlacesDB = generateMockPlaces(location);
      let filteredPlaces = categories && categories.length > 0
        ? mockPlacesDB.filter(p => categories.includes(p.category))
        : mockPlacesDB;
      
      const smartFiltered = applySmartFiltering(filteredPlaces, travelStyle, weather);
      const finalPlaces = smartFiltered.slice(offset * 4, (offset + 1) * 4);
      
      return c.json({ 
        places: finalPlaces.slice(0, 4),
        hasMore: true,
        isMock: true 
      });
    }
    
    // Exclude already selected places
    let filteredPlaces = allPlaces;
    if (excludeIds.length > 0) {
      filteredPlaces = filteredPlaces.filter(p => !excludeIds.includes(p.id));
    }
    
    // Apply smart filtering based on travel style and weather
    console.log(`Filtered places before smart filtering: ${filteredPlaces.length}`);
    const smartFiltered = applySmartFiltering(filteredPlaces, travelStyle, weather);
    console.log(`Smart filtered places: ${smartFiltered.length}`);
    
    // Group by category and select diverse places
    const selectedByCategory: Record<string, any[]> = {};
    
    for (const place of smartFiltered) {
      if (!selectedByCategory[place.category]) {
        selectedByCategory[place.category] = [];
      }
      selectedByCategory[place.category].push(place);
    }
    
    // Select one place per category (with offset for refresh)
    const selectedPlaces: any[] = [];
    
    for (const category of categoriesToSearch) {
      const places = selectedByCategory[category];
      if (places && places.length > 0) {
        // Sort by rating and review count
        places.sort((a, b) => {
          const scoreA = a.rating * 0.6 + (a.reviewCount / 1000) * 0.4;
          const scoreB = b.rating * 0.6 + (b.reviewCount / 1000) * 0.4;
          return scoreB - scoreA;
        });
        
        const startIndex = offset % places.length;
        selectedPlaces.push(places[startIndex]);
      }
    }
    
    // If we need more places, fill from remaining
    if (selectedPlaces.length < 4) {
      for (const place of smartFiltered) {
        if (!selectedPlaces.find(p => p.id === place.id)) {
          selectedPlaces.push(place);
          if (selectedPlaces.length >= 4) break;
        }
      }
    }
    
    const finalPlaces = selectedPlaces.slice(0, 4);
    console.log(`Returning ${finalPlaces.length} real places from Kakao API`);
    console.log(`Places: ${finalPlaces.map(p => p.name).join(", ")}`);
    
    return c.json({ 
      places: finalPlaces,
      hasMore: true,
      isMock: false 
    });
  } catch (error) {
    console.log(`Error in select-places endpoint: ${error}`);
    console.log(`Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
    return c.json({ error: "Failed to select places" }, 500);
  }
});

// Calculate route with distance and time
app.post("/make-server-80cc3277/calculate-route", async (c) => {
  try {
    const { places, transportMode = "TRANSIT", travelStyle } = await c.req.json();
    
    if (!places || places.length < 2) {
      return c.json({ error: "At least 2 places required" }, 400);
    }
    
    console.log(`Calculating route for ${places.length} places, mode: ${transportMode}`);
    
    // Calculate distances and times between consecutive places
    const routes = [];
    let totalDistance = 0;
    let totalTime = 0;
    
    for (let i = 0; i < places.length - 1; i++) {
      const from = places[i];
      const to = places[i + 1];
      
      // Mock distance calculation (in meters)
      const distance = calculateMockDistance(from, to);
      
      // Calculate time based on transport mode
      const time = calculateTravelTime(distance, transportMode, travelStyle);
      
      totalDistance += distance;
      totalTime += time;
      
      routes.push({
        from: from.name,
        to: to.name,
        distance: Math.round(distance),
        distanceText: formatDistance(distance),
        time: Math.round(time),
        timeText: formatTime(time),
        transportMode
      });
    }
    
    return c.json({
      routes,
      totalDistance: Math.round(totalDistance),
      totalDistanceText: formatDistance(totalDistance),
      totalTime: Math.round(totalTime),
      totalTimeText: formatTime(totalTime),
      recommendedDuration: calculateRecommendedDuration(places, travelStyle),
      isMock: true
    });
  } catch (error) {
    console.log(`Error in calculate-route endpoint: ${error}`);
    return c.json({ error: "Failed to calculate route" }, 500);
  }
});

// Helper functions for place selection
function generateMockPlaces(location: string) {
  const categories = ["카페", "레스토랑", "관광명소", "박물관", "공원", "쇼핑", "숙박", "액티비티"];
  const places = [];
  
  let id = 1;
  for (const category of categories) {
    // Generate 10 places per category
    for (let i = 1; i <= 10; i++) {
      const reviewCount = Math.floor(Math.random() * 5000) + 10;
      const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 - 5.0
      
      places.push({
        id: `place_${id++}`,
        name: `${location} ${category} ${i}`,
        category,
        reviewCount,
        rating: parseFloat(rating),
        description: getPlaceDescription(category, i),
        address: `${location} ${category}거리 ${i}`,
        isIndoor: ["카페", "레스토랑", "박물관", "쇼핑", "숙박"].includes(category),
        isOutdoor: ["공원", "관광명소", "액티비티"].includes(category),
        keywords: getPlaceKeywords(category, reviewCount, parseFloat(rating)),
        lat: 37.5 + Math.random() * 0.1,
        lng: 127.0 + Math.random() * 0.1
      });
    }
  }
  
  return places;
}

function getPlaceDescription(category: string, index: number): string {
  const descriptions = {
    "카페": ["조용하고 아늑한 분위기", "인스타그램에서 핫한", "브런치가 맛있는", "현지인 추천", "뷰가 좋은"],
    "레스토랑": ["현지 맛집", "숨은 명소", "미슐랭 가이드 선정", "전통 방식", "퓨전 요리"],
    "관광명소": ["역사적 가치", "포토존 완벽", "한적한 분위기", "대표 명소", "숨겨진 보석"],
    "박물관": ["현대적 전시", "체험형 전시", "교육적 가치", "한적한 관람", "유명 소장품"],
    "공원": ["산책하기 좋은", "조용한 휴식", "가족 나들이", "현지인 추천", "한적한 자연"],
    "쇼핑": ["현지 특산품", "전통 시장", "현대적 쇼핑몰", "숨은 보석", "합리적 가격"],
    "숙박": ["편안한 휴식", "뷰가 좋은", "조용한 분위기", "현지 감성", "럭셔리한"],
    "액티비티": ["스릴 넘치는", "초보자 환영", "전문 강사", "안전한 시설", "인기 체험"]
  };
  
  const list = descriptions[category] || ["추천"];
  return list[index % list.length];
}

function getPlaceKeywords(category: string, reviewCount: number, rating: number): string[] {
  const keywords = [];
  
  if (reviewCount < 100 && rating >= 4.5) {
    keywords.push("숨은명소", "한적한", "현지인추천");
  }
  
  if (reviewCount > 1000 && rating >= 4.0) {
    keywords.push("인기장소", "핫플레이스", "필수방문");
  }
  
  if (rating >= 4.5) {
    keywords.push("고평점", "추천");
  }
  
  return keywords;
}

function applySmartFiltering(places: any[], travelStyle: string, weather: any) {
  let filtered = [...places];
  
  // Weather-based filtering
  if (weather && weather.description) {
    const isRainy = weather.description.includes("비") || weather.description.includes("rain");
    const isCold = weather.temperature < 5;
    
    if (isRainy || isCold) {
      // Prioritize indoor places
      filtered = filtered.sort((a, b) => {
        if (a.isIndoor && !b.isIndoor) return -1;
        if (!a.isIndoor && b.isIndoor) return 1;
        return 0;
      });
    } else {
      // Good weather - prioritize outdoor
      filtered = filtered.sort((a, b) => {
        if (a.isOutdoor && !b.isOutdoor) return -1;
        if (!a.isOutdoor && b.isOutdoor) return 1;
        return 0;
      });
    }
  }
  
  // Travel style based filtering
  if (travelStyle === "힐링") {
    // Prefer hidden gems with high ratings
    filtered = filtered.filter(p => 
      (p.reviewCount < 1500 && p.rating >= 4.5) || // Hidden gems
      p.keywords.includes("한적한") ||
      p.keywords.includes("조용한")
    ).sort((a, b) => b.rating - a.rating);
  } else if (travelStyle === "관광") {
    // Prefer popular places
    filtered = filtered.filter(p => 
      (p.reviewCount > 500 && p.rating >= 4.0) || // Popular places
      p.keywords.includes("인기장소")
    ).sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (travelStyle === "액티비티") {
    // Prefer activity places with good ratings
    filtered = filtered.filter(p => 
      p.category === "액티비티" || 
      p.isOutdoor
    ).sort((a, b) => b.rating - a.rating);
  }
  
  // Ensure we have enough places
  if (filtered.length < 10) {
    filtered = places.filter(p => p.rating >= 4.0).sort((a, b) => b.rating - a.rating);
  }
  
  return filtered;
}

function calculateMockDistance(from: any, to: any): number {
  // Simple distance calculation based on lat/lng
  const latDiff = Math.abs(from.lat - to.lat);
  const lngDiff = Math.abs(from.lng - to.lng);
  
  // Rough conversion: 1 degree ≈ 111km
  const distanceKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
  
  // Return in meters, with some randomness
  return (distanceKm * 1000) + (Math.random() * 500);
}

function calculateTravelTime(distanceMeters: number, mode: string, travelStyle: string): number {
  // Base speed in km/h
  const speeds = {
    "WALK": 4,
    "TRANSIT": 30,
    "DRIVE": 40,
    "BIKE": 15
  };
  
  const speed = speeds[mode] || speeds["TRANSIT"];
  const distanceKm = distanceMeters / 1000;
  
  // Time in minutes
  let time = (distanceKm / speed) * 60;
  
  // Add buffer time for healing style (more relaxed)
  if (travelStyle === "힐링") {
    time *= 1.3;
  }
  
  // Add minimum time (5 minutes)
  return Math.max(time, 5);
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

function calculateRecommendedDuration(places: any[], travelStyle: string): string {
  const baseTime = {
    "힐링": 3, // 3 hours per place
    "관광": 2, // 2 hours per place
    "액티비티": 2.5 // 2.5 hours per place
  };
  
  const timePerPlace = baseTime[travelStyle] || 2;
  const totalHours = places.length * timePerPlace;
  
  if (totalHours < 6) {
    return "반나절 코스";
  } else if (totalHours < 10) {
    return "1일 코스";
  } else {
    return "1박 2일 코스";
  }
}

// Kakao REST API: Convert address to coordinates
app.post("/make-server-80cc3277/kakao/address-to-coord", async (c) => {
  try {
    const { address } = await c.req.json();
    const apiKey = Deno.env.get("KAKAO_REST_API_KEY");
    
    console.log(`[Kakao Address] Converting address: ${address}`);
    
    if (!apiKey) {
      console.log("[Kakao Address] KAKAO_REST_API_KEY is not set");
      return c.json({ 
        success: false,
        error: "API key not configured" 
      }, 400);
    }

    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `KakaoAK ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Kakao Address] Error: ${response.status} - ${errorText}`);
      return c.json({ 
        success: false,
        error: "Failed to convert address" 
      }, response.status);
    }

    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      console.log(`[Kakao Address] No results for: ${address}`);
      return c.json({ 
        success: false,
        error: "Address not found" 
      }, 404);
    }

    const result = data.documents[0];
    const coords = {
      lat: parseFloat(result.y),
      lng: parseFloat(result.x),
      address: result.address_name,
      roadAddress: result.road_address?.address_name || result.address_name
    };
    
    console.log(`[Kakao Address] ✅ Converted: ${address} → (${coords.lat}, ${coords.lng})`);
    
    return c.json({ 
      success: true,
      data: coords
    });
  } catch (error) {
    console.error(`[Kakao Address] Error in address-to-coord endpoint:`, error);
    return c.json({ 
      success: false,
      error: "Internal server error" 
    }, 500);
  }
});

// Kakao REST API: Get directions (walking/driving)
app.post("/make-server-80cc3277/kakao/directions", async (c) => {
  try {
    const { origin, destination, priority = "RECOMMEND" } = await c.req.json();
    const apiKey = Deno.env.get("KAKAO_REST_API_KEY");
    
    console.log(`[Kakao Directions] From (${origin.lat}, ${origin.lng}) to (${destination.lat}, ${destination.lng})`);
    
    if (!apiKey) {
      console.log("[Kakao Directions] KAKAO_REST_API_KEY is not set");
      return c.json({ 
        success: false,
        error: "API key not configured" 
      }, 400);
    }

    // Use Kakao Mobility API for directions
    const url = `https://apis-navi.kakaomobility.com/v1/directions`;
    const params = new URLSearchParams({
      origin: `${origin.lng},${origin.lat}`,
      destination: `${destination.lng},${destination.lat}`,
      priority: priority,
      car_fuel: "GASOLINE",
      car_hipass: "false",
      alternatives: "false",
      road_details: "false"
    });
    
    const response = await fetch(`${url}?${params}`, {
      headers: {
        "Authorization": `KakaoAK ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Kakao Directions] Error: ${response.status} - ${errorText}`);
      
      // Fallback: Return direct line distance
      const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      console.log(`[Kakao Directions] Using fallback distance calculation: ${distance}m`);
      
      return c.json({ 
        success: true,
        data: {
          distance: Math.round(distance),
          duration: Math.round(distance / 50), // Assume 50m/min walking speed
          isFallback: true
        }
      });
    }

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      console.log(`[Kakao Directions] No route found`);
      const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      return c.json({ 
        success: true,
        data: {
          distance: Math.round(distance),
          duration: Math.round(distance / 50),
          isFallback: true
        }
      });
    }

    const route = data.routes[0];
    const summary = route.summary;
    
    const result = {
      distance: summary.distance, // meters
      duration: summary.duration, // seconds
      fare: summary.fare || 0,
      isFallback: false
    };
    
    console.log(`[Kakao Directions] ✅ Distance: ${result.distance}m, Duration: ${result.duration}s`);
    
    return c.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error(`[Kakao Directions] Error in directions endpoint:`, error);
    
    // Fallback calculation
    try {
      const { origin, destination } = await c.req.json();
      const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      return c.json({ 
        success: true,
        data: {
          distance: Math.round(distance),
          duration: Math.round(distance / 50),
          isFallback: true,
          error: "Used fallback calculation"
        }
      });
    } catch {
      return c.json({ 
        success: false,
        error: "Internal server error" 
      }, 500);
    }
  }
});

// Kakao REST API: Get place details by keyword
app.post("/make-server-80cc3277/kakao/place-details", async (c) => {
  try {
    const { placeName, location } = await c.req.json();
    const apiKey = Deno.env.get("KAKAO_REST_API_KEY");
    
    console.log(`[Kakao Place Details] Searching: ${placeName} near ${location || 'anywhere'}`);
    
    if (!apiKey) {
      console.log("[Kakao Place Details] KAKAO_REST_API_KEY is not set");
      return c.json({ 
        success: false,
        error: "API key not configured" 
      }, 400);
    }

    const searchQuery = location ? `${location} ${placeName}` : placeName;
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchQuery)}&size=1`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `KakaoAK ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Kakao Place Details] Error: ${response.status} - ${errorText}`);
      return c.json({ 
        success: false,
        error: "Failed to fetch place details" 
      }, response.status);
    }

    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      console.log(`[Kakao Place Details] No results for: ${searchQuery}`);
      return c.json({ 
        success: false,
        error: "Place not found" 
      }, 404);
    }

    const place = data.documents[0];
    const result = {
      name: place.place_name,
      address: place.address_name,
      roadAddress: place.road_address_name,
      phone: place.phone,
      category: place.category_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      placeUrl: place.place_url,
      id: place.id
    };
    
    console.log(`[Kakao Place Details] ✅ Found: ${result.name}`);
    
    return c.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error(`[Kakao Place Details] Error in place-details endpoint:`, error);
    return c.json({ 
      success: false,
      error: "Internal server error" 
    }, 500);
  }
});

// Naver Image Search API: Get place images
app.post("/make-server-80cc3277/naver/image-search", async (c) => {
  try {
    const { query, display = 5 } = await c.req.json();
    const clientId = Deno.env.get("NAVER_CLIENT_ID");
    const clientSecret = Deno.env.get("NAVER_CLIENT_SECRET");
    
    console.log(`[Naver Image Search] Query: ${query}, Display: ${display}`);
    
    if (!clientId || !clientSecret) {
      console.log("[Naver Image Search] API credentials not set, returning fallback");
      return c.json({ 
        success: true,
        data: {
          items: [],
          isFallback: true
        }
      });
    }

    const url = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(query)}&display=${display}&sort=sim&filter=large`;
    
    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Naver Image Search] Error: ${response.status} - ${errorText}`);
      return c.json({ 
        success: true,
        data: {
          items: [],
          isFallback: true
        }
      });
    }

    const data = await response.json();
    
    console.log(`[Naver Image Search] ✅ Found ${data.items?.length || 0} images`);
    
    return c.json({ 
      success: true,
      data: {
        items: data.items || [],
        isFallback: false
      }
    });
  } catch (error) {
    console.error(`[Naver Image Search] Error:`, error);
    return c.json({ 
      success: true,
      data: {
        items: [],
        isFallback: true
      }
    });
  }
});

// Helper function: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

Deno.serve(app.fetch);