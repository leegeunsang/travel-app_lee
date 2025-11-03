import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { getKakaoJsKey } from '../utils/kakao-config';
import { KakaoApiKeyTest } from './KakaoApiKeyTest';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './ui/sonner';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export function KakaoDebugPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. Check API Key
    const apiKey = getKakaoJsKey();
    results.push({
      name: 'API Key 설정',
      status: apiKey ? 'success' : 'error',
      message: apiKey ? `API Key 확인됨: ${apiKey.substring(0, 15)}...` : 'API Key가 설정되지 않음',
      details: apiKey || undefined
    });

    // 2. Check Network Connectivity
    try {
      const testUrl = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      results.push({
        name: '카카오 Maps SDK 네트워크 접근',
        status: response.ok ? 'success' : 'warning',
        message: response.ok ? 'SDK 파일에 접근 가능' : `HTTP ${response.status} 응답`,
        details: `URL: ${testUrl}\nStatus: ${response.status} ${response.statusText}`
      });
    } catch (error) {
      results.push({
        name: '카카오 Maps SDK 네트워크 접근',
        status: 'error',
        message: '네트워크 에러 - SDK 파일을 가져올 수 없음',
        details: String(error)
      });
    }

    // 3. Check if script exists in DOM
    const scripts = document.querySelectorAll('script[src*="dapi.kakao.com"]');
    results.push({
      name: 'DOM에 카카오 스크립트 존재',
      status: scripts.length > 0 ? 'success' : 'error',
      message: scripts.length > 0 
        ? `${scripts.length}개의 카카오 스크립트 태그 발견` 
        : '카카오 스크립트 태그가 DOM에 없음',
      details: scripts.length > 0 
        ? Array.from(scripts).map((s: any) => s.src).join('\n')
        : 'index.html에 스크립트 태그가 없거나 로드되지 않음'
    });

    // 4. Check window.kakao
    results.push({
      name: 'window.kakao 객체',
      status: window.kakao ? 'success' : 'error',
      message: window.kakao ? 'window.kakao 객체 확인됨' : 'window.kakao 객체 없음 - 스크립트가 실행되지 않음',
      details: window.kakao ? JSON.stringify(Object.keys(window.kakao)) : 'undefined - 스크립트가 로드되지 않았거나 실행 중 에러 발생'
    });

    // 5. Check window.kakao.maps
    results.push({
      name: 'window.kakao.maps',
      status: (window.kakao && window.kakao.maps) ? 'success' : 'error',
      message: (window.kakao && window.kakao.maps) ? 'Maps API 사용 가능' : 'Maps API 사용 불가',
      details: (window.kakao && window.kakao.maps) 
        ? `Maps 객체 타입: ${typeof window.kakao.maps}` 
        : 'window.kakao.maps가 undefined'
    });
    
    // 5.5. Check KAKAO_SDK_LOADED flag
    results.push({
      name: 'SDK 로드 플래그',
      status: (window as any).KAKAO_SDK_LOADED ? 'success' : 'warning',
      message: (window as any).KAKAO_SDK_LOADED 
        ? 'index.html에서 SDK가 성공적으로 로드됨' 
        : 'SDK 로드 플래그가 false - index.html 스크립트 실행 실패',
      details: `KAKAO_SDK_LOADED = ${(window as any).KAKAO_SDK_LOADED}`
    });

    // 6. Check browser
    const userAgent = navigator.userAgent;
    results.push({
      name: '브라우저 정보',
      status: 'success',
      message: getBrowserName(userAgent),
      details: userAgent
    });

    // 7. Check for ad blockers
    const adBlockerDetected = await checkAdBlocker();
    results.push({
      name: '광고 차단 프로그램',
      status: adBlockerDetected ? 'warning' : 'success',
      message: adBlockerDetected ? '광고 차단 프로그램이 감지됨 (스크립트 로딩을 방해할 수 있음)' : '광고 차단 프로그램 없음',
    });

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      pending: 'bg-gray-400'
    };
    return <Badge className={`${colors[status]} text-white`}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toaster />
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Quick API Test */}
        <KakaoApiKeyTest />
        
        {/* Detailed Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>카카오맵 진단 도구</CardTitle>
            <CardDescription>
              카카오맵 SDK 로딩 문제를 진단합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  진단 중...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 진단하기
                </>
              )}
            </Button>

            <div className="space-y-3">
              {diagnostics.map((result, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold">{result.name}</h3>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                      {result.details && (
                        <details className="text-xs text-gray-500">
                          <summary className="cursor-pointer hover:text-gray-700">
                            상세 정보
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                            {result.details}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {diagnostics.length > 0 && (
              <>
                <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">🚨 가장 흔한 원인: 도메인 미등록</h3>
                  <div className="text-xs text-red-800 space-y-2">
                    <p className="font-semibold">카카오맵 API는 등록된 도메인에서만 작동합니다!</p>
                    <div className="bg-white p-3 rounded border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">현재 도메인:</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin);
                            toast.success('도메인이 클립보드에 복사되었습니다!');
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          복사
                        </Button>
                      </div>
                      <code className="bg-red-100 px-2 py-1 rounded text-xs block break-all">
                        {window.location.origin}
                      </code>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">해결 방법:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>
                          <a 
                            href="https://developers.kakao.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800 inline-flex items-center gap-1"
                          >
                            카카오 개발자 콘솔
                            <ExternalLink className="w-3 h-3" />
                          </a> 접속
                        </li>
                        <li>내 애플리케이션 선택</li>
                        <li><strong>플랫폼 설정</strong> → <strong>Web 플랫폼 등록/수정</strong></li>
                        <li>위의 현재 도메인을 복사하여 추가</li>
                        <li>추가로 다음 도메인들도 등록:
                          <div className="ml-4 mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <code className="bg-red-100 px-1">http://localhost</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText('http://localhost');
                                  toast.success('복사됨!');
                                }}
                                className="h-5 px-1"
                              >
                                <Copy className="w-2 h-2" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="bg-red-100 px-1">http://localhost:3000</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText('http://localhost:3000');
                                  toast.success('복사됨!');
                                }}
                                className="h-5 px-1"
                              >
                                <Copy className="w-2 h-2" />
                              </Button>
                            </div>
                          </div>
                        </li>
                        <li><strong>저장</strong> 후 이 페이지 새로고침</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 기타 문제 해결 방법</h3>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>네트워크 연결이 안정적인지 확인하세요</li>
                    <li>광고 차단 프로그램을 비활성화해보세요</li>
                    <li>다른 브라우저에서 시도해보세요 (Chrome, Firefox 등)</li>
                    <li>시크릿/프라이빗 모드에서 테스트해보세요</li>
                    <li>브라우저 캐시를 삭제하고 새로고침하세요</li>
                    <li>카카오 개발자 콘솔에서 API 키가 활성화되어 있는지 확인하세요</li>
                  </ul>
                </div>
              </>
            )}

            <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg">
              <h3 className="text-sm font-semibold text-green-900 mb-2">📚 자세한 가이드</h3>
              <p className="text-xs text-green-800 mb-2">
                도메인 등록에 대한 단계별 가이드가 필요하신가요?
              </p>
              <a
                href="/DOMAIN_REGISTRATION_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 underline"
              >
                <ExternalLink className="w-3 h-3" />
                도메인 등록 가이드 보기
              </a>
            </div>

            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="text-sm"
              >
                홈으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome/Chromium';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
}

async function checkAdBlocker(): Promise<boolean> {
  try {
    // Try to fetch a common ad URL
    await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return false;
  } catch {
    return true;
  }
}
