import { useEffect, useState } from "react";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { AlertCircle, X, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function EnvWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Warning is no longer needed as we have fallback key configured
    setShowWarning(false);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowWarning(false);
    sessionStorage.setItem("env-warning-dismissed", "true");
  };

  const copyEnvConfig = () => {
    const config = "VITE_KAKAO_JS_KEY=94e86b9b6ddf71039ab09c9902d2d79f";
    navigator.clipboard.writeText(config);
    toast.success("클립보드에 복사되었습니다!");
  };

  if (!showWarning || isDismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-white border-b border-red-200 shadow-lg">
      <div className="max-w-md mx-auto">
        <Alert variant="destructive" className="relative">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2 flex-1">
            <h4 className="text-sm mb-2">⚠️ 환경 변수 미설정</h4>
            <p className="text-xs mb-3">
              카카오맵 API 키가 설정되지 않았습니다. 지도가 표시되지 않을 수 있습니다.
            </p>
            
            <div className="bg-white rounded p-2 mb-3">
              <p className="text-xs mb-1">프로젝트 루트에 <code>.env</code> 파일 생성:</p>
              <div className="flex items-center gap-2 bg-gray-100 rounded p-2">
                <code className="text-xs flex-1 overflow-hidden text-ellipsis">
                  VITE_KAKAO_JS_KEY=94e86b...
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyEnvConfig}
                  className="h-6 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
              <p className="text-xs text-yellow-800">
                <strong>중요:</strong> .env 파일 생성 후 <strong>개발 서버를 재시작</strong>해야 합니다!
              </p>
              <code className="text-xs text-yellow-900 block mt-1">
                Ctrl+C → npm run dev
              </code>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open("/ENV_SETUP_GUIDE.md", "_blank")}
                className="h-7 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                상세 가이드
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-7 text-xs ml-auto"
              >
                닫기
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </Alert>
      </div>
    </div>
  );
}
