/**
 * Route Statistics Display Component
 * Uses Kakao REST API to display route information without requiring map
 */

import { useState, useEffect } from 'react';
import { Navigation, Clock, MapPin, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { calculateRouteStats, formatDistance, formatDuration } from '../utils/kakao-rest-api';

interface RouteStatsDisplayProps {
  places: Array<{
    name: string;
    lat: number;
    lng: number;
  }>;
  compact?: boolean;
}

export function RouteStatsDisplay({ places, compact = false }: RouteStatsDisplayProps) {
  const [stats, setStats] = useState<{
    totalDistance: number;
    totalDuration: number;
    isFallback: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (places.length < 2) {
      setStats(null);
      return;
    }

    let mounted = true;

    const loadStats = async () => {
      setLoading(true);
      setError(false);

      try {
        const waypoints = places.map(p => ({ lat: p.lat, lng: p.lng }));
        const result = await calculateRouteStats(waypoints);

        if (mounted) {
          setStats(result);
        }
      } catch (err) {
        console.error('Failed to calculate route stats:', err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, [places]);

  if (places.length < 2) {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">경로 계산 중...</span>
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-4">
        <div className="text-center text-sm text-gray-500">
          경로 정보를 불러올 수 없습니다
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm text-gray-700">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-blue-500" />
          <span>{formatDistance(stats.totalDistance)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-green-500" />
          <span>{formatDuration(stats.totalDuration)}</span>
        </div>
        {stats.isFallback && (
          <Badge variant="secondary" className="text-xs">
            추정치
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span>경로 정보</span>
          </h3>
          {stats.isFallback && (
            <Badge variant="secondary" className="text-xs">
              직선거리 기준
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Navigation className="w-4 h-4" />
              <span>총 거리</span>
            </div>
            <div className="text-xl text-blue-600">
              {formatDistance(stats.totalDistance)}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>소요 시간</span>
            </div>
            <div className="text-xl text-green-600">
              {formatDuration(stats.totalDuration)}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="flex-1 text-xs text-gray-500">
            {places.length}개 장소 경유
            {stats.isFallback && (
              <span className="block mt-1 text-amber-600">
                ℹ️ 실제 도로 경로는 거리와 시간이 다를 수 있습니다
              </span>
            )}
          </div>
        </div>

        {/* Segment details */}
        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">경유지</div>
          <div className="space-y-1.5">
            {places.map((place, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shrink-0">
                  {index + 1}
                </div>
                <span className="text-gray-700 truncate">{place.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
