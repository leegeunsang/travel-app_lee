import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { X, Share, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { isIOS, isInStandaloneMode } from "../utils/pwa";

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Skip in Figma preview environment
    if (window.location.hostname.includes('figma.site') || 
        window.location.hostname.includes('localhost')) {
      return;
    }

    // Check if it's iOS and not already installed
    const shouldShow = isIOS() && !isInStandaloneMode() && !dismissed;
    
    if (shouldShow) {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem('ios-install-dismissed', new Date().toISOString());
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
          <Card className="p-5 shadow-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-gray-900 font-semibold">📱 iPhone에 앱 설치하기</h3>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">1️⃣</span>
                </div>
                <div className="flex-1 text-sm text-gray-700">
                  하단의 <Share className="w-4 h-4 inline mx-1 text-blue-600" /> <strong>공유</strong> 버튼을 탭하세요
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">2️⃣</span>
                </div>
                <div className="flex-1 text-sm text-gray-700">
                  <Plus className="w-4 h-4 inline mr-1 text-blue-600" /> <strong>"홈 화면에 추가"</strong>를 선택하세요
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">3️⃣</span>
                </div>
                <div className="flex-1 text-sm text-gray-700">
                  <strong>"추가"</strong>를 탭하면 완료! 🎉
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 leading-relaxed">
                💡 앱으로 설치하면 전체 화면으로 이용할 수 있고, 홈 화면에서 바로 실행할 수 있어요!
              </p>
            </div>

            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="w-full mt-3"
            >
              나중에 하기
            </Button>
          </Card>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
