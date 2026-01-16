"use client";

import { useState } from "react";
import { Calendar, Check, X, Loader2 } from "lucide-react";
import { officeHoursApi } from "@/lib/api";
import type { CalendarStatus } from "@/types";

interface CalendarConnectionStatusProps {
  status: CalendarStatus;
  onStatusChange: () => void;
}

export default function CalendarConnectionStatus({
  status,
  onStatusChange,
}: CalendarConnectionStatusProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/settings/calendar/callback`;
      const { auth_url } = await officeHoursApi.getCalendarAuthUrl(redirectUri);
      window.location.href = auth_url;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Calendar?")) {
      return;
    }

    setIsLoading(true);
    try {
      await officeHoursApi.disconnectCalendar();
      onStatusChange();
    } catch (error) {
      console.error("Failed to disconnect calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-lg ${
              status.is_connected ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <Calendar
              className={`h-6 w-6 ${
                status.is_connected ? "text-green-600" : "text-gray-500"
              }`}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Google Calendar
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {status.is_connected
                ? "Connected - Your calendar is synced for conflict checking"
                : "Connect to check for scheduling conflicts"}
            </p>
            {status.is_connected && status.created_at && (
              <p className="text-xs text-gray-400 mt-1">
                Connected on{" "}
                {new Date(status.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status.is_connected ? (
            <>
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Connected
              </span>
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="ml-4 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Connect Calendar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
