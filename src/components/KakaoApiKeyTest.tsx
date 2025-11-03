/**
 * Simple test to verify Kakao API key works
 * Tests if we can load a basic map
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function KakaoApiKeyTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    testApiKey();
  }, []);

  const testApiKey = async () => {
    const logs: string[] = [];
    
    try {
      logs.push('🔍 Testing Kakao Maps API Key...');
      
      // Check if script tag exists
      const scriptTags = document.querySelectorAll('script[src*="dapi.kakao.com"]');
      logs.push(`📜 Found ${scriptTags.length} Kakao script tag(s) in DOM`);
      
      if (scriptTags.length === 0) {
        setStatus('error');
        setMessage('No Kakao script found in index.html');
        setDetails(logs);
        return;
      }
      
      scriptTags.forEach((tag: any, i) => {
        logs.push(`   Script ${i + 1}: ${tag.src}`);
      });
      
      // Check window.kakao
      if (!window.kakao) {
        logs.push('❌ window.kakao is undefined');
        logs.push('⚠️ Script tag exists but window.kakao NOT created');
        logs.push('');
        logs.push('🚨 MOST LIKELY CAUSE: Domain not registered!');
        logs.push('');
        logs.push(`📍 Current domain: ${window.location.origin}`);
        logs.push(`📍 Protocol: ${window.location.protocol}`);
        logs.push(`📍 Hostname: ${window.location.hostname}`);
        logs.push(`📍 Port: ${window.location.port || 'default'}`);
        logs.push('');
        logs.push('✅ Register this domain at:');
        logs.push('   https://developers.kakao.com/');
        logs.push('   → My Application → Platform Settings → Web Platform');
        logs.push('   → Add: ' + window.location.origin);
        logs.push('   → Also add: http://localhost (for local dev)');
        logs.push('');
        logs.push('💡 Other possible causes:');
        logs.push('   - Invalid/inactive API key');
        logs.push('   - Network error loading script');
        logs.push('   - Ad blocker or browser extension');
        
        setStatus('error');
        setMessage('⚠️ Domain not registered in Kakao Developers Console');
        setDetails(logs);
        return;
      }
      
      logs.push('✅ window.kakao exists');
      logs.push(`   Type: ${typeof window.kakao}`);
      logs.push(`   Keys: ${Object.keys(window.kakao).join(', ')}`);
      
      // Check window.kakao.maps
      if (!window.kakao.maps) {
        logs.push('❌ window.kakao.maps is undefined');
        logs.push('⚠️ Kakao object exists but maps API not available');
        
        setStatus('error');
        setMessage('Kakao Maps API not available');
        setDetails(logs);
        return;
      }
      
      logs.push('✅ window.kakao.maps exists');
      logs.push(`   Type: ${typeof window.kakao.maps}`);
      
      // Try to create a simple map (without rendering)
      try {
        const LatLng = window.kakao.maps.LatLng;
        const testLatLng = new LatLng(37.5665, 126.9780);
        logs.push('✅ Successfully created LatLng object');
        logs.push(`   Test coordinates: ${testLatLng.getLat()}, ${testLatLng.getLng()}`);
        
        setStatus('success');
        setMessage('✅ Kakao Maps API is working correctly!');
        setDetails(logs);
      } catch (err: any) {
        logs.push('❌ Error creating LatLng object');
        logs.push(`   Error: ${err.message}`);
        
        setStatus('error');
        setMessage('Kakao Maps API error');
        setDetails(logs);
      }
      
    } catch (err: any) {
      logs.push(`❌ Unexpected error: ${err.message}`);
      setStatus('error');
      setMessage(`Test failed: ${err.message}`);
      setDetails(logs);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          API Key Test
        </CardTitle>
        <CardDescription>
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
          {details.map((line, i) => (
            <div key={i} className="mb-1">
              {line}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
