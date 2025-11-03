import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { WeatherWidget } from './WeatherWidget';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function WeatherTestPage() {
  const [testCity, setTestCity] = useState('서울');
  const [testResults, setTestResults] = useState<any[]>([]);

  const runTests = async () => {
    const results: any[] = [];
    console.log('[Weather Test] ===== STARTING DIAGNOSTIC TESTS =====');

    // Test 1: Environment Variables
    console.log('[Weather Test] Test 1: Checking environment variables...');
    const envTest = {
      test: '환경 변수 확인',
      passed: !!projectId && !!publicAnonKey,
      details: `Project ID: ${projectId ? '✓ ' + projectId : '✗ MISSING'}, Public Key: ${publicAnonKey ? '✓ (length: ' + publicAnonKey.length + ')' : '✗ MISSING'}`
    };
    results.push(envTest);
    console.log('[Weather Test] Test 1 result:', envTest);

    // Test 2: API Endpoint Availability
    console.log('[Weather Test] Test 2: Checking API server connection...');
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/health`;
      console.log('[Weather Test] Health check URL:', url);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      const healthData = response.ok ? await response.json() : null;
      const healthTest = {
        test: 'API 서버 연결',
        passed: response.ok,
        details: `Status: ${response.status} ${response.statusText}${healthData ? ', Response: ' + JSON.stringify(healthData) : ''}`
      };
      results.push(healthTest);
      console.log('[Weather Test] Test 2 result:', healthTest);
    } catch (error) {
      const healthTest = {
        test: 'API 서버 연결',
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : String(error)}`
      };
      results.push(healthTest);
      console.error('[Weather Test] Test 2 error:', error);
    }

    // Test 3: Weather Endpoint (Korean city)
    console.log('[Weather Test] Test 3: Testing weather API with Korean city...');
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/weather/서울`;
      console.log('[Weather Test] Weather API URL:', url);
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[Weather Test] Weather API response status:', response.status);
      
      const data = await response.json();
      console.log('[Weather Test] Weather API response data:', data);
      
      const weatherTest = {
        test: '날씨 API 호출 (서울)',
        passed: response.ok,
        details: `Status: ${response.status}, isMock: ${data.isMock ? 'YES' : 'NO'}, Temp: ${data.temperature}°C, Desc: ${data.description}`
      };
      results.push(weatherTest);
      console.log('[Weather Test] Test 3 result:', weatherTest);
    } catch (error) {
      const weatherTest = {
        test: '날씨 API 호출 (서울)',
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : String(error)}`
      };
      results.push(weatherTest);
      console.error('[Weather Test] Test 3 error:', error);
    }

    // Test 4: OPENWEATHER_API_KEY (English city)
    console.log('[Weather Test] Test 4: Checking OpenWeather API key configuration...');
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/weather/Seoul`;
      console.log('[Weather Test] Weather API URL (English):', url);
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('[Weather Test] OpenWeather test data:', data);
      
      const apiKeyTest = {
        test: 'OpenWeather API Key 설정',
        passed: !data.isMock,
        details: data.isMock 
          ? '⚠️ Mock 데이터 사용 중 (OPENWEATHER_API_KEY 미설정 또는 API 오류)' 
          : `✓ 실제 데이터 사용 중 (${data.temperature}°C, ${data.description})`
      };
      results.push(apiKeyTest);
      console.log('[Weather Test] Test 4 result:', apiKeyTest);
    } catch (error) {
      const apiKeyTest = {
        test: 'OpenWeather API Key 설정',
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : String(error)}`
      };
      results.push(apiKeyTest);
      console.error('[Weather Test] Test 4 error:', error);
    }

    console.log('[Weather Test] ===== ALL TESTS COMPLETE =====');
    console.log('[Weather Test] Results summary:', results);
    setTestResults(results);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-t-3xl shadow-lg p-6 mb-4">
          <h1 className="text-2xl mb-2">🌤️ 날씨 연동 테스트</h1>
          <p className="text-sm text-gray-600 mb-4">
            날씨 API 연동 상태를 진단합니다
          </p>

          <Button onClick={runTests} className="w-full mb-6">
            진단 시작
          </Button>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3 mb-6">
              <h2 className="text-lg mb-2">진단 결과</h2>
              {testResults.map((result, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start gap-3">
                    {result.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm mb-1">{result.test}</p>
                      <p className="text-xs text-gray-600 break-all">{result.details}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Environment Info */}
          <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
            <h3 className="text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              환경 정보
            </h3>
            <div className="text-xs space-y-1 text-gray-700">
              <p>Project ID: {projectId || '❌ 없음'}</p>
              <p>Public Key: {publicAnonKey ? '✓ 설정됨' : '❌ 없음'}</p>
              <p>API URL: https://{projectId}.supabase.co/functions/v1/make-server-80cc3277</p>
            </div>
          </Card>

          {/* Live Weather Test */}
          <div>
            <h2 className="text-lg mb-3">실시간 날씨 위젯 테스트</h2>
            <div className="flex gap-2 mb-3">
              <Input
                value={testCity}
                onChange={(e) => setTestCity(e.target.value)}
                placeholder="도시 입력 (예: 서울, 부산)"
              />
              <Button onClick={() => setTestCity(testCity)}>적용</Button>
            </div>
            <WeatherWidget city={testCity} />
          </div>

          {/* Quick Test Cities */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">빠른 테스트:</p>
            <div className="flex flex-wrap gap-2">
              {['서울', '부산', '제주', '인천', '대전'].map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  size="sm"
                  onClick={() => setTestCity(city)}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <Card className="mt-6 p-4 bg-orange-50 border-orange-400 border-2">
            <h3 className="text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              🔑 401 Unauthorized 에러 발생 시
            </h3>
            <div className="text-xs text-gray-700 space-y-1 mb-3">
              <p><strong className="text-orange-700">원인:</strong> OPENWEATHER_API_KEY가 유효하지 않거나 미설정</p>
              <p><strong className="text-orange-700">해결:</strong></p>
              <p>1. 위 모달 또는 Supabase 대시보드에서 API 키 설정</p>
              <p>2. <a href="https://openweathermap.org/" target="_blank" rel="noopener" className="text-blue-600 underline">OpenWeather</a>에서 무료 키 발급 (2분 소요)</p>
              <p>3. 새 키는 활성화까지 최대 2시간 소요 (보통 10분)</p>
              <p>4. 키 활성화 상태: <a href="https://home.openweathermap.org/api_keys" target="_blank" rel="noopener" className="text-blue-600 underline">여기서 확인</a></p>
              <p>5. Edge Function 재배포: <code className="bg-white px-1 py-0.5 rounded">supabase functions deploy server</code></p>
            </div>
            <div className="text-xs bg-white p-2 rounded border border-orange-200 mb-2">
              <p className="mb-1"><strong>💡 팁:</strong></p>
              <p>• Mock 데이터는 앱이 정상 작동하는지 테스트용입니다</p>
              <p>• 실제 날씨 데이터를 사용하려면 유효한 API 키 필요</p>
            </div>
          </Card>

          <Card className="mt-4 p-4 bg-red-50 border-red-300">
            <h3 className="text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              ⚠️ 404 Not Found 에러 발생 시
            </h3>
            <div className="text-xs text-gray-700 space-y-1 mb-3">
              <p><strong>원인:</strong> Supabase Edge Function이 배포되지 않았습니다!</p>
              <p><strong>해결:</strong></p>
              <p>1. Supabase CLI 설치: <code className="bg-white px-1 py-0.5 rounded">npm install -g supabase</code></p>
              <p>2. 프로젝트 연결: <code className="bg-white px-1 py-0.5 rounded">supabase link --project-ref {projectId}</code></p>
              <p>3. 함수 배포: <code className="bg-white px-1 py-0.5 rounded">supabase functions deploy server</code></p>
            </div>
            <Button 
              size="sm" 
              className="w-full text-xs h-8"
              onClick={() => window.open('/EDGE_FUNCTION_DEPLOY.md', '_blank')}
            >
              📖 상세 배포 가이드 보기
            </Button>
          </Card>

          <Card className="mt-4 p-4 bg-yellow-50 border-yellow-200">
            <h3 className="text-sm mb-2">💡 기타 문제 해결</h3>
            <div className="text-xs text-gray-700 space-y-1">
              <br />
              <p><strong>Mock 데이터만 표시되는 경우:</strong></p>
              <p>→ Supabase 대시보드에서 OPENWEATHER_API_KEY 환경 변수를 설정하세요</p>
              <p>→ https://openweathermap.org/ 에서 무료 API 키를 발급받을 수 있습니다</p>
              <br />
              <p><strong>API 서버 연결 실패:</strong></p>
              <p>→ 네트워크 탭에서 CORS 에러가 있는지 확인하세요</p>
              <p>→ Edge Function 로그에서 상세 에러 확인</p>
              <br />
              <p><strong>브라우저 콘솔 확인:</strong></p>
              <p>→ F12를 눌러 개발자 도구를 열고 Console 탭을 확인하세요</p>
              <p>→ [WeatherWidget], [Weather API] 로그를 찾아보세요</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
