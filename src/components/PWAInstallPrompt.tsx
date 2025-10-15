import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Skip in Figma preview environment
    if (window.location.hostname.includes('figma.site')) {
      console.log('PWA install prompt disabled in preview');
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 px-4 flex justify-center">
      <div className="w-full max-w-[412px]">
        <Card className="p-4 shadow-2xl border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">앱으로 설치하기</h3>
              <p className="text-sm text-gray-600 mb-3">
                홈 화면에 추가하여 앱처럼 사용하세요!
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  설치하기
                </Button>
                <Button onClick={handleDismiss} variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
