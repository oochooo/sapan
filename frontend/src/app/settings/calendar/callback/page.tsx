"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { officeHoursApi } from "@/lib/api";
import Navbar from "@/components/Navbar";

function CalendarCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const exchangeCode = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage("Authorization was denied or cancelled.");
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received.");
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/settings/calendar/callback`;
        await officeHoursApi.exchangeCalendarCode(code, redirectUri);
        setStatus("success");
        setMessage("Google Calendar connected successfully!");

        // Redirect to settings after a short delay
        setTimeout(() => {
          router.push("/settings");
        }, 2000);
      } catch (err) {
        console.error("Failed to connect calendar:", err);
        setStatus("error");
        setMessage("Failed to connect Google Calendar. Please try again.");
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center py-20">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connecting Calendar...
              </h2>
              <p className="text-gray-500">
                Please wait while we complete the connection.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Calendar Connected!
              </h2>
              <p className="text-gray-500">{message}</p>
              <p className="text-sm text-gray-400 mt-2">
                Redirecting to settings...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connection Failed
              </h2>
              <p className="text-gray-500 mb-4">{message}</p>
              <button
                onClick={() => router.push("/settings")}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                Back to Settings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CalendarCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          </div>
        </div>
      }
    >
      <CalendarCallbackContent />
    </Suspense>
  );
}
