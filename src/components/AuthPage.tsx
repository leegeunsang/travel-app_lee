import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getSupabaseClient } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Loader2, Plane } from "lucide-react";

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
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[412px] bg-gradient-to-b from-blue-50 to-white min-h-screen pb-20 px-6 shadow-xl">
      <div className="pt-8">
        <button onClick={onBack} className="mb-6 text-gray-600">
          ← 돌아가기
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Plane className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl">여행 계획 시작하기</h1>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <Card className="p-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">이메일</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">비밀번호</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
            <Card className="p-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">이름</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">이메일</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="비밀번호를 입력하세요 (최소 6자)"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mt-2"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>안내:</strong> 로그인하면 여행 일정 저장, 북마크, 맞춤 추천 저장 등의 
            기능을 사용할 수 있습니다.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
