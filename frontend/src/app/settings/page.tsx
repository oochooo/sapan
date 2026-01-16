"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { officeHoursApi } from "@/lib/api";
import CalendarConnectionStatus from "@/components/CalendarConnectionStatus";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import type { CalendarStatus, AvailabilityRule } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus>({
    is_connected: false,
  });
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>(
    [],
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, rulesRes] = await Promise.all([
        officeHoursApi.getCalendarStatus(),
        user?.user_type === "mentor"
          ? officeHoursApi.getAvailability()
          : Promise.resolve([]),
      ]);
      setCalendarStatus(statusRes);
      setAvailabilityRules(rulesRes);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, router, user?.user_type]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Settings className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500">
              Manage your calendar and office hours
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Calendar Connection - Show for mentors */}
          {user?.user_type === "mentor" && (
            <>
              <CalendarConnectionStatus
                status={calendarStatus}
                onStatusChange={fetchData}
              />

              <AvailabilityEditor
                rules={availabilityRules}
                onRulesChange={fetchData}
              />
            </>
          )}

          {/* Founders don't need calendar or availability settings */}
          {user?.user_type === "founder" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Office Hours
              </h3>
              <p className="text-gray-500">
                As a founder, you can book office hours with mentors from their
                profile pages. Visit the{" "}
                <a href="/mentors" className="text-primary-600 hover:underline">
                  Mentors
                </a>{" "}
                page to find mentors to connect with.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
