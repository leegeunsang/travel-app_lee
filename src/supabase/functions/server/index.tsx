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
    
    console.log(`[Weather API] Received request for city: ${city}`);
    console.log(`[Weather API] API Key exists: ${apiKey ? 'Yes' : 'No'}`);
    
    // Map Korean city names to English
    const cityNameMap: Record<string, string> = {
      "서울": "Seoul",
      "부산": "Busan",
      "대구": "Daegu",
      "인천": "Incheon",
      "광주": "Gwangju",
      "대전": "Daejeon",
      "울산": "Ulsan",
      "세종": "Sejong",
      "경기": "Gyeonggi",
      "강원": "Gangwon",
      "충북": "Chungbuk",
      "충남": "Chungnam",
      "전북": "Jeonbuk",
      "전남": "Jeonnam",
      "경북": "Gyeongbuk",
      "경남": "Gyeongnam",
      "제주": "Jeju",
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
    
    const englishCity = cityNameMap[city] || city;
    
    if (!apiKey) {
      console.log("[Weather API] OPENWEATHER_API_KEY is not set, returning mock data");
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
    console.log(`[Weather API] Fetching weather for: ${city} (${englishCity})`);
    
    const response = await fetch(url);
    
    console.log(`[Weather API] OpenWeather API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[Weather API] Error fetching weather for ${city}: ${response.status} ${response.statusText} - ${errorText}`);
      
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
    
    console.log(`[Weather API] Raw data received:`, JSON.stringify(data).substring(0, 200));
    
    if (!data.main || !data.weather || !data.weather[0]) {
      console.log(`[Weather API] Invalid weather data received for ${city}`);
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
    
    console.log(`[Weather API] Sending response:`, weatherResponse);
    
    return c.json(weatherResponse);
  } catch (error) {
    console.log(`[Weather API] Error in weather endpoint: ${error}`);
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
    const page = c.req.query("page") || "1";
    const numOfRows = c.req.query("numOfRows") || "20";
    
    // Mock attractions data
    const mockAttractions = [
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
      },
      {
        title: "명동거리",
        addr1: "서울특별시 중구 명동길",
        contentid: "mock4",
        tel: "02-3789-7001",
        firstimage: "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6",
        mapx: "126.9850",
        mapy: "37.5636",
        contenttypeid: "12"
      },
      {
        title: "청계천",
        addr1: "서울특별시 종로구 청계천로",
        contentid: "mock5",
        tel: "02-2290-6114",
        firstimage: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
        mapx: "126.9783",
        mapy: "37.5698",
        contenttypeid: "12"
      }
    ];
    
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
    // Return mock data on error
    return c.json({ 
      attractions: [
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
      ],
      totalCount: 3,
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

// Smart place selection with review/rating filtering
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
    
    // Mock place database with realistic data
    const mockPlacesDB = generateMockPlaces(location);
    console.log(`Generated ${mockPlacesDB.length} mock places`);
    
    // Filter by categories if provided
    let filteredPlaces = categories && categories.length > 0
      ? mockPlacesDB.filter(p => categories.includes(p.category))
      : mockPlacesDB;
    
    // Exclude already selected places
    if (excludeIds.length > 0) {
      filteredPlaces = filteredPlaces.filter(p => !excludeIds.includes(p.id));
    }
    
    // Apply smart filtering based on travel style and weather
    console.log(`Filtered places before smart filtering: ${filteredPlaces.length}`);
    const smartFiltered = applySmartFiltering(filteredPlaces, travelStyle, weather);
    console.log(`Smart filtered places: ${smartFiltered.length}`);
    
    // Group by category and select top 3 per category (with offset for refresh)
    const selectedByCategory: Record<string, any[]> = {};
    
    for (const place of smartFiltered) {
      if (!selectedByCategory[place.category]) {
        selectedByCategory[place.category] = [];
      }
      selectedByCategory[place.category].push(place);
    }
    
    // Select top places per category (offset allows rotation)
    const selectedPlaces: any[] = [];
    const categoriesNeeded = categories && categories.length > 0 ? categories : Object.keys(selectedByCategory);
    
    for (const category of categoriesNeeded) {
      const places = selectedByCategory[category];
      if (places && places.length > 0) {
        const startIndex = offset % places.length;
        const selected = [places[startIndex]]; // Take just 1 per category for 4 categories
        selectedPlaces.push(...selected);
      }
    }
    
    // Ensure we have exactly 4 places
    if (selectedPlaces.length < 4) {
      // Fill with any available places
      for (const place of smartFiltered) {
        if (!selectedPlaces.find(p => p.id === place.id)) {
          selectedPlaces.push(place);
          if (selectedPlaces.length >= 4) break;
        }
      }
    }
    
    // If still not enough, use mock places
    if (selectedPlaces.length < 4) {
      for (const place of mockPlacesDB) {
        if (!selectedPlaces.find(p => p.id === place.id)) {
          selectedPlaces.push(place);
          if (selectedPlaces.length >= 4) break;
        }
      }
    }
    
    const finalPlaces = selectedPlaces.slice(0, 4);
    console.log(`Returning ${finalPlaces.length} places`);
    
    return c.json({ 
      places: finalPlaces, // Always return exactly 4
      hasMore: true,
      isMock: true 
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

Deno.serve(app.fetch);