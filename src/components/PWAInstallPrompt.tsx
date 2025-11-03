import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-0 right-0 z-50 px-4 flex justify-center"
      >
        <div className="w-full max-w-[412px]">
          <Card className="p-5 shadow-2xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-gray-900 font-semibold">📱 앱으로 설치하기</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  홈 화면에 추가하여 더 빠르고 편리하게 이용하세요!
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleInstall} 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    설치하기
                  </Button>
                  <Button onClick={handleDismiss} variant="outline" size="sm" className="border-gray-300">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
