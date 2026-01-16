"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  X,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { officeHoursApi } from "@/lib/api";
import type { Booking } from "@/types";
import { useAuth } from "@/lib/auth";

interface BookingCardProps {
  booking: Booking;
  onUpdate: () => void;
}

export default function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const { user } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);

  const isMentor = user?.id === booking.mentor;
  const otherPerson = isMentor ? booking.founder_info : booking.mentor_info;
  const roleLabel = isMentor ? "Founder" : "Mentor";

  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  const isPast = startDate < new Date();
  const isUpcoming = booking.status === "confirmed" && !isPast;
  const isCancelled = booking.status.startsWith("cancelled");

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this booking? Both parties will be notified.",
      )
    ) {
      return;
    }

    setIsCancelling(true);
    try {
      await officeHoursApi.cancelBooking(booking.id);
      onUpdate();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case "confirmed":
        return isPast ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Confirmed
          </span>
        );
      case "cancelled_by_founder":
      case "cancelled_by_mentor":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border p-5 ${
        isCancelled ? "border-gray-200 opacity-60" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
            {otherPerson.full_name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">
                {otherPerson.full_name}
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-500">{roleLabel}</p>

            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  {formatTime(startDate)} - {formatTime(endDate)}
                </span>
              </div>
            </div>

            {booking.agenda && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Agenda:</span> {booking.agenda}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isUpcoming && booking.google_meet_link && (
            <a
              href={booking.google_meet_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Video className="h-4 w-4" />
              Join Meet
            </a>
          )}

          {isUpcoming && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
