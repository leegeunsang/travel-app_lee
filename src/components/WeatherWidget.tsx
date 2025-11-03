import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  isMock: boolean;
  error?: string;
}

interface WeatherWidgetProps {
  city: string;
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city, compact = false }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[WeatherWidget] ===== STARTING WEATHER FETCH =====`);
        console.log(`[WeatherWidget] City: ${city}`);
        console.log(`[WeatherWidget] Project ID: ${projectId || 'MISSING'}`);
        console.log(`[WeatherWidget] Public Anon Key: ${publicAnonKey ? 'exists (length: ' + publicAnonKey.length + ')' : 'MISSING'}`);
        
        if (!projectId || !publicAnonKey) {
          throw new Error('Supabase configuration missing');
        }
        
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/weather/${encodeURIComponent(city)}`;
        console.log(`[WeatherWidget] Request URL: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`[WeatherWidget] Response status: ${response.status}`);
        console.log(`[WeatherWidget] Response ok: ${response.ok}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[WeatherWidget] HTTP error details:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log(`[WeatherWidget] Weather data received:`, data);
        console.log(`[WeatherWidget] Is mock data: ${data.isMock ? 'YES' : 'NO'}`);
        
        setWeather(data);
        
        if (data.isMock) {
          if (data.error === 'invalid_api_key') {
            console.error(`[WeatherWidget] ❌ 401 ERROR: Invalid OPENWEATHER_API_KEY`);
            console.error(`[WeatherWidget] Please set a valid API key using the settings modal`);
            setError('401: OpenWeather API 키가 유효하지 않습니다');
          } else {
            console.warn(`[WeatherWidget] ⚠️ Using MOCK weather data. OPENWEATHER_API_KEY may not be configured.`);
          }
        } else {
          console.log(`[WeatherWidget] ✅ Real weather data loaded successfully`);
          setError(null); // Clear any previous errors
        }
        
      } catch (err) {
        console.error('[WeatherWidget] ❌ Error fetching weather:', err);
        console.error('[WeatherWidget] Error details:', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
        
        setError(err instanceof Error ? err.message : '날씨 정보를 불러오는데 실패했습니다');
        
        // Set fallback weather data on error
        console.log('[WeatherWidget] Setting fallback weather data');
        setWeather({
          temperature: 20,
          description: '날씨 정보 없음',
          icon: '01d',
          humidity: 60,
          windSpeed: 2.5,
          isMock: true
        });
      } finally {
        setLoading(false);
        console.log(`[WeatherWidget] ===== WEATHER FETCH COMPLETE =====`);
      }
    };

    if (city && city.trim()) {
      console.log(`[WeatherWidget] City changed to: ${city}, triggering fetch`);
      fetchWeather();
    } else {
      console.warn(`[WeatherWidget] No valid city provided (city="${city}"), skipping weather fetch`);
      // Set fallback data immediately
      setWeather({
        temperature: 20,
        description: '날씨 정보 없음',
        icon: '01d',
        humidity: 60,
        windSpeed: 2.5,
        isMock: true
      });
      setLoading(false);
    }
  }, [city]);

  const getWeatherIcon = (iconCode: string) => {
    // OpenWeather icon codes
    const code = iconCode.substring(0, 2);
    
    switch (code) {
      case '01': return <Sun className="w-8 h-8 text-yellow-400" />;
      case '02': return <Cloud className="w-8 h-8 text-gray-400" />;
      case '03': return <Cloud className="w-8 h-8 text-gray-500" />;
      case '04': return <Cloud className="w-8 h-8 text-gray-600" />;
      case '09': return <CloudRain className="w-8 h-8 text-blue-400" />;
      case '10': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case '11': return <CloudRain className="w-8 h-8 text-purple-500" />;
      case '13': return <CloudSnow className="w-8 h-8 text-blue-200" />;
      default: return <Sun className="w-8 h-8 text-yellow-400" />;
    }
  };

  const getWeatherGradient = (iconCode: string) => {
    const code = iconCode.substring(0, 2);
    
    switch (code) {
      case '01': return 'from-yellow-100 to-orange-100';
      case '02':
      case '03':
      case '04': return 'from-gray-100 to-gray-200';
      case '09':
      case '10':
      case '11': return 'from-blue-100 to-blue-200';
      case '13': return 'from-blue-50 to-blue-100';
      default: return 'from-sky-100 to-blue-100';
    }
  };

  if (loading) {
    return (
      <Card className={`bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
            <div>
              <div className="w-16 h-4 bg-gray-300 rounded mb-2" />
              <div className="w-24 h-3 bg-gray-300 rounded" />
            </div>
          </div>
          {!compact && (
            <div className="w-12 h-8 bg-gray-300 rounded" />
          )}
        </div>
      </Card>
    );
  }

  if (error && !weather) {
    const is401Error = error.includes('401');
    
    return (
      <Card className={`border-2 ${is401Error ? 'bg-orange-50 border-orange-300' : 'bg-red-50 border-red-200'} ${compact ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-start gap-3 ${is401Error ? 'text-orange-800' : 'text-red-700'}`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm block mb-1">
              {is401Error ? '🔑 API 키 오류' : '날씨 정보 로드 실패'}
            </span>
            <span className="text-xs opacity-90 block mb-2">{error}</span>
            {is401Error && (
              <div className="text-xs bg-white bg-opacity-50 p-2 rounded border border-orange-200 space-y-1">
                <p className="mb-1">✅ 해결 방법:</p>
                <p>1. 위 모달에서 유효한 API 키 입력</p>
                <p>2. <a href="https://openweathermap.org/" target="_blank" rel="noopener" className="underline">OpenWeather</a>에서 무료 키 발급</p>
                <p>3. 새 키는 활성화에 최대 2시간 소요</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className={`bg-gray-50 border-gray-200 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">날씨 정보를 불러오는 중...</span>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={`bg-gradient-to-r ${getWeatherGradient(weather.icon)} p-3 shadow-md relative overflow-hidden`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.icon)}
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl">{weather.temperature}°</span>
                {weather.isMock && <span className="text-xs text-gray-400">💡</span>}
              </div>
              <p className="text-sm text-gray-600">{weather.description}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-r ${getWeatherGradient(weather.icon)} p-4 shadow-md relative overflow-hidden ${weather.isMock && weather.error === 'invalid_api_key' ? 'border-2 border-orange-400' : ''}`}>
      {weather.isMock && weather.error === 'invalid_api_key' && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          ⚠️ API 키 필요
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.icon)}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl">{weather.temperature}°</span>
              {weather.isMock && <span className="text-xs text-gray-400">💡</span>}
            </div>
            <p className="text-sm text-gray-600">{weather.description}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Droplets className="w-4 h-4" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-4 h-4" />
          <span>{weather.windSpeed}m/s</span>
        </div>
      </div>
      
      {weather.isMock && (
        <div className="mt-3 pt-3 border-t border-gray-300/60">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-xs text-gray-600">실시간 데이터 연결 대기 중</p>
          </div>
        </div>
      )}
    </Card>
  );
};
