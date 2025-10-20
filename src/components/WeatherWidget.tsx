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
        
        console.log(`[WeatherWidget] Fetching weather for: ${city}`);
        console.log(`[WeatherWidget] Project ID: ${projectId ? 'exists' : 'missing'}`);
        console.log(`[WeatherWidget] API Key: ${publicAnonKey ? 'exists' : 'missing'}`);
        
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/weather/${encodeURIComponent(city)}`;
        console.log(`[WeatherWidget] Request URL: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        console.log(`[WeatherWidget] Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[WeatherWidget] HTTP error: ${response.status} - ${errorText}`);
          throw new Error('날씨 정보를 가져올 수 없습니다');
        }

        const data = await response.json();
        console.log(`[WeatherWidget] Weather data received:`, data);
        setWeather(data);
      } catch (err) {
        console.error('[WeatherWidget] Error fetching weather:', err);
        setError(err instanceof Error ? err.message : '날씨 정보를 불러오는데 실패했습니다');
        
        // Set fallback weather data on error
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
      }
    };

    if (city) {
      fetchWeather();
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
    <Card className={`bg-gradient-to-r ${getWeatherGradient(weather.icon)} p-4 shadow-md relative overflow-hidden`}>
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
