import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Alert } from "./ui/alert";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle, RefreshCw, Copy, Info } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function EnvCheckPage() {
  const [envStatus, setEnvStatus] = useState<{
    kakaoJsKey: boolean;
    value?: string;
  }>({ kakaoJsKey: false });

  useEffect(() => {
    checkEnv();
  }, []);

  const checkEnv = () => {
    const kakaoKey = import.meta.env?.VITE_KAKAO_JS_KEY;
    
    setEnvStatus({
      kakaoJsKey: !!kakaoKey,
      value: kakaoKey
    });

    console.log("Environment Check:");
    console.log("VITE_KAKAO_JS_KEY:", kakaoKey || "NOT SET");
    console.log("import.meta.env:", import.meta.env);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">환경 변수 설정 확인</h1>
          <p className="text-sm text-gray-600">
            카카오맵 API 키가 제대로 설정되었는지 확인합니다
          </p>
        </div>

        {/* Status Card */}
        <Card className="p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg">VITE_KAKAO_JS_KEY</h2>
              {envStatus.kakaoJsKey ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  설정됨
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  미설정
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkEnv}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>

          {envStatus.kakaoJsKey ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-2">
                ✅ 환경 변수가 정상적으로 설정되었습니다
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white px-2 py-1 rounded border flex-1 overflow-hidden text-ellipsis">
                  {envStatus.value}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => envStatus.value && copyToClipboard(envStatus.value)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-2">
                ❌ 환경 변수가 설정되지 않았습니다
              </p>
              <p className="text-xs text-red-600">
                .env 파일을 확인하고 개발 서버를 재시작해주세요
              </p>
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6 mb-4">
          <h3 className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-500" />
            설정 방법
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  1
                </div>
                <span className="text-sm">프로젝트 루트에 .env 파일 생성</span>
              </div>
              <div className="ml-8 bg-gray-100 rounded p-3">
                <code className="text-xs">
                  VITE_KAKAO_JS_KEY=94e86b9b6ddf71039ab09c9902d2d79f
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard("VITE_KAKAO_JS_KEY=94e86b9b6ddf71039ab09c9902d2d79f")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  2
                </div>
                <span className="text-sm">개발 서버 재시작 (필수!)</span>
              </div>
              <div className="ml-8 bg-gray-100 rounded p-3">
                <code className="text-xs block mb-1"># 서버 중지: Ctrl + C</code>
                <code className="text-xs block">npm run dev</code>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  3
                </div>
                <span className="text-sm">브라우저 새로고침</span>
              </div>
              <div className="ml-8 bg-gray-100 rounded p-3">
                <code className="text-xs">Ctrl + Shift + R (Windows/Linux)</code>
                <br />
                <code className="text-xs">Cmd + Shift + R (Mac)</code>
              </div>
            </div>
          </div>
        </Card>

        {/* Debug Info */}
        <Card className="p-6 bg-gray-900 text-gray-100">
          <h3 className="mb-3 text-sm">디버그 정보</h3>
          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-gray-400">import.meta.env.VITE_KAKAO_JS_KEY:</span>
              <br />
              <span className="text-yellow-400">
                {import.meta.env?.VITE_KAKAO_JS_KEY || "undefined"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">import.meta.env.MODE:</span>
              <br />
              <span className="text-green-400">
                {import.meta.env?.MODE || "undefined"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">import.meta.env.DEV:</span>
              <br />
              <span className="text-green-400">
                {String(import.meta.env?.DEV)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">import.meta.env.PROD:</span>
              <br />
              <span className="text-green-400">
                {String(import.meta.env?.PROD)}
              </span>
            </div>
          </div>
        </Card>

        {/* Common Issues */}
        <Alert className="mt-4">
          <Info className="w-4 h-4" />
          <div className="ml-2">
            <h4 className="text-sm mb-2">자주 발생하는 문제</h4>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>• .env 파일이 프로젝트 루트(package.json과 같은 위치)에 있는지 확인</li>
              <li>• 환경 변수 이름이 정확히 <code>VITE_KAKAO_JS_KEY</code>인지 확인</li>
              <li>• .env 파일 수정 후 <strong>반드시 개발 서버 재시작</strong></li>
              <li>• .env 파일에 따옴표나 공백이 없어야 함</li>
              <li>• 브라우저 캐시 삭제 및 하드 리프레시</li>
            </ul>
          </div>
        </Alert>
      </div>
    </div>
  );
}
