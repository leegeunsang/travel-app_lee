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
    
    if (!apiKey) {
      console.log("Error getting weather: OPENWEATHER_API_KEY is not set");
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

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},KR&appid=${apiKey}&units=metric&lang=kr`;
    console.log(`Fetching weather for: ${city}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching weather for ${city}: ${response.status} ${response.statusText} - ${errorText}`);
      
      // Return mock data on API error
      return c.json({
        temperature: 20,
        description: "맑음",
        icon: "01d",
        humidity: 60,
        windSpeed: 2.5,
        isMock: true
      });
    }
    
    const data = await response.json();
    
    if (!data.main || !data.weather || !data.weather[0]) {
      console.log(`Invalid weather data received for ${city}`);
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
    
    return c.json({
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      isMock: false
    });
  } catch (error) {
    console.log(`Error in weather endpoint: ${error}`);
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
                { name: `${location} 박물관`, description: "역사와 문화 탐방", order: 1, image: "https://images.unsplash.com/photo-1565173877742-a47d02b5f9b2" },
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
            { name: `${location} 명소 3`, description: "문화 체험", order: 3, image: "https://images.unsplash.com/photo-1565173877742-a47d02b5f9b2" },
            { name: `${location} 숙소`, description: "편안한 휴식", order: 4, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945" }
          ]
        }
      ]
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
    const places = data.documents.map((place: any) => ({
      name: place.place_name,
      address: place.address_name,
      roadAddress: place.road_address_name,
      phone: place.phone,
      category: place.category_name,
      x: parseFloat(place.x), // longitude
      y: parseFloat(place.y), // latitude
      placeUrl: place.place_url
    }));

    return c.json({ 
      places,
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
    
    // Mock attractions data
    const mockAttractions = [
      {
        title: "경복궁",
        addr1: "서울특별시 종로구 사직로 161",
        contentid: "mock1",
        tel: "02-3700-3900"
      },
      {
        title: "남산서울타워",
        addr1: "서울특별시 용산구 남산공원길 105",
        contentid: "mock2",
        tel: "02-3455-9277"
      },
      {
        title: "북촌한옥마을",
        addr1: "서울특별시 종로구 계동길 37",
        contentid: "mock3",
        tel: "02-2148-4161"
      },
      {
        title: "명동거리",
        addr1: "서울특별시 중구 명동길",
        contentid: "mock4",
        tel: "02-3789-7001"
      },
      {
        title: "청계천",
        addr1: "서울특별시 종로구 청계천로",
        contentid: "mock5",
        tel: "02-2290-6114"
      }
    ];
    
    if (!apiKey) {
      console.log("Error getting attractions: TOUR_API_KEY is not set, using mock data");
      return c.json({ 
        attractions: mockAttractions,
        isMock: true 
      });
    }

    const url = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${apiKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=TravelApp&_type=json&listYN=Y&arrange=A&contentTypeId=12&areaCode=${areaCode}`;
    console.log(`Fetching attractions for area code: ${areaCode}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching attractions for area ${areaCode}: ${response.status} ${response.statusText} - ${errorText}`);
      
      // Return mock data on API error
      return c.json({ 
        attractions: mockAttractions,
        isMock: true 
      });
    }
    
    const data = await response.json();
    
    // Check for API errors in response
    if (data.response?.header?.resultCode !== "0000") {
      console.log(`API returned error: ${data.response?.header?.resultMsg}`);
      return c.json({ 
        attractions: mockAttractions,
        isMock: true 
      });
    }
    
    const items = data.response?.body?.items?.item || [];
    
    // If no items, return mock data
    if (items.length === 0) {
      console.log(`No attractions found for area ${areaCode}, using mock data`);
      return c.json({ 
        attractions: mockAttractions,
        isMock: true 
      });
    }
    
    return c.json({ 
      attractions: Array.isArray(items) ? items : [items],
      isMock: false 
    });
  } catch (error) {
    console.log(`Error in attractions endpoint: ${error}`);
    // Return mock data on error
    return c.json({ 
      attractions: [
        {
          title: "경복궁",
          addr1: "서울특별시 종로구 사직로 161",
          contentid: "mock1",
          tel: "02-3700-3900"
        },
        {
          title: "남산서울타워",
          addr1: "서울특별시 용산구 남산공원길 105",
          contentid: "mock2",
          tel: "02-3455-9277"
        },
        {
          title: "북촌한옥마을",
          addr1: "서울특별시 종로구 계동길 37",
          contentid: "mock3",
          tel: "02-2148-4161"
        }
      ],
      isMock: true 
    });
  }
});

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

Deno.serve(app.fetch);