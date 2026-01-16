"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const LINE_CHANNEL_ID = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
const GOOGLE_REDIRECT_URI =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/auth/callback/google";
const LINE_REDIRECT_URI =
  process.env.NEXT_PUBLIC_LINE_REDIRECT_URI ||
  "http://localhost:3000/auth/callback/line";

const isDev = process.env.NODE_ENV === "development";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, devLogin } = useAuth();
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devEmail, setDevEmail] = useState("");
  const [devPassword, setDevPassword] = useState("");
  const [devError, setDevError] = useState("");
  const [isDevLoggingIn, setIsDevLoggingIn] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDevError("");
    setIsDevLoggingIn(true);
    try {
      await devLogin(devEmail, devPassword);
      router.push("/dashboard");
    } catch {
      setDevError("Invalid credentials");
    } finally {
      setIsDevLoggingIn(false);
    }
  };

  const handleGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || "",
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleLineLogin = () => {
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem("line_oauth_state", state);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINE_CHANNEL_ID || "",
      redirect_uri: LINE_REDIRECT_URI,
      state,
      scope: "profile openid email",
    });
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Welcome to Sapan
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Connect with mentors and founders
          </p>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleLineLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-white bg-[#06C755] hover:bg-[#05b34c] transition-colors font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              Continue with LINE
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>

          {/* Dev Login Section - Only in development */}
          {isDev && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDevLogin(!showDevLogin)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                {showDevLogin ? "Hide" : "Show"} Dev Login
              </button>

              {showDevLogin && (
                <form onSubmit={handleDevLogin} className="mt-4 space-y-3">
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    Dev mode only. Use mock accounts:
                    <br />
                    mentor1@mock.sapan.io / founder1@mock.sapan.io
                    <br />
                    Password: mockpassword123
                  </div>

                  {devError && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {devError}
                    </div>
                  )}

                  <input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="password"
                    value={devPassword}
                    onChange={(e) => setDevPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isDevLoggingIn}
                    className="w-full py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 disabled:opacity-50"
                  >
                    {isDevLoggingIn ? "Logging in..." : "Dev Login"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
