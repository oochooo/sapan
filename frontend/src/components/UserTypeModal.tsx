"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

interface UserTypeModalProps {
  onComplete?: () => void;
}

export default function UserTypeModal({ onComplete }: UserTypeModalProps) {
  const { completeProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"founder" | "mentor" | null>(
    null,
  );

  const handleSelect = async (type: "founder" | "mentor") => {
    setSelectedType(type);
    setIsLoading(true);

    try {
      await completeProfile(type);
      onComplete?.();
    } catch (error) {
      console.error("Failed to complete profile:", error);
      setIsLoading(false);
      setSelectedType(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Welcome to Sapan
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Tell us about yourself to get started
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleSelect("founder")}
            disabled={isLoading}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
              selectedType === "founder"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  I&apos;m a Founder
                </h3>
                <p className="text-gray-600 mt-1">
                  I&apos;m building a startup and looking for mentors to help me
                  grow
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSelect("mentor")}
            disabled={isLoading}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
              selectedType === "mentor"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  I&apos;m a Mentor
                </h3>
                <p className="text-gray-600 mt-1">
                  I have experience to share and want to help founders succeed
                </p>
              </div>
            </div>
          </button>
        </div>

        {isLoading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
            <span>Setting up your account...</span>
          </div>
        )}
      </div>
    </div>
  );
}
