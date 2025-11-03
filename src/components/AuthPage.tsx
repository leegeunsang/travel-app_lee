import { useState } from "react";
import { ArrowLeft, Loader2, Plane, Mail, Lock, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getSupabaseClient } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { StatusBar } from "./StatusBar";

interface AuthPageProps {
  onAuthSuccess: (accessToken: string, userId: string) => void;
  onBack: () => void;
}

export function AuthPage({ onAuthSuccess, onBack }: AuthPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sign up form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  
  // Sign in form
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  const supabase = getSupabaseClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call backend to create user
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-80cc3277/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
            name: signupName
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다.");
      }

      // Automatically sign in after signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (signInData?.session?.access_token && signInData?.user?.id) {
        onAuthSuccess(signInData.session.access_token, signInData.user.id);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password: signinPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.session?.access_token && data?.user?.id) {
        onAuthSuccess(data.session.access_token, data.user.id);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center">
      <div className="w-full max-w-[412px] bg-white/80 backdrop-blur-xl min-h-screen shadow-2xl pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={onBack} 
              className="p-2.5 -ml-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl text-white font-semibold">여행 시작하기</h1>
            </div>
          </div>
          <p className="text-blue-100 text-sm ml-14">계정을 만들고 여행을 저장하세요</p>
        </div>

        <div className="px-6 py-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl h-14 shadow-lg">
              <TabsTrigger value="signin" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-xl font-semibold">
                로그인
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-xl font-semibold">
                회원가입
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <Card className="p-8 shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="email"
                      name="email"
                      placeholder="이메일 주소를 입력하세요"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      required
                      autoComplete="off"
                      className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400"
                      style={{ fontSize: '16px', paddingLeft: '3rem' }}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="password"
                      name="password"
                      placeholder="비밀번호를 입력하세요"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      required
                      autoComplete="off"
                      className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400"
                      style={{ fontSize: '16px', paddingLeft: '3rem' }}
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full py-7 rounded-xl text-base mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl font-semibold" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        로그인 중...
                      </>
                    ) : (
                      "로그인"
                    )}
                  </Button>
                </form>
              </Card>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <Card className="p-8 shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="text"
                      name="name"
                      placeholder="이름을 입력하세요"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      autoComplete="off"
                      className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400"
                      style={{ fontSize: '16px', paddingLeft: '3rem' }}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="email"
                      name="signup-email"
                      placeholder="이메일 주소를 입력하세요"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      autoComplete="off"
                      className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400"
                      style={{ fontSize: '16px', paddingLeft: '3rem' }}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="password"
                      name="signup-password"
                      placeholder="비밀번호 (최소 6자)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="off"
                      className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400"
                      style={{ fontSize: '16px', paddingLeft: '3rem' }}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full py-7 rounded-xl text-base mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl font-semibold" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        회원가입 중...
                      </>
                    ) : (
                      "회원가입"
                    )}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100 shadow-lg">
            <p className="text-sm text-blue-800 leading-relaxed">
              💡 <strong>안내:</strong> 로그인하면 여행 일정 저장, 북마크, 맞춤 추천 저장 등의 
              기능을 사용할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
