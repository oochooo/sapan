"use client";

import { useState } from "react";
import { X, Calendar, Clock, Video, Loader2 } from "lucide-react";
import { officeHoursApi } from "@/lib/api";
import TimeSlotPicker from "./TimeSlotPicker";
import type { TimeSlot, MentorProfile } from "@/types";

interface BookingModalProps {
  mentor: MentorProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({
  mentor,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [agenda, setAgenda] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBook = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    setError(null);

    try {
      await officeHoursApi.createBooking({
        mentor_id: mentor.user.id,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        agenda,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to book:", err);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      setError(errorMessage || "Failed to book this slot. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Book Office Hours
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                with {mentor.user.first_name} {mentor.user.last_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Time slot picker */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Select a time slot
              </h3>
              <TimeSlotPicker
                mentorId={mentor.user.id}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
              />
            </div>

            {/* Selected slot info */}
            {selectedSlot && (
              <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h4 className="text-sm font-medium text-primary-900 mb-2">
                  Selected Time
                </h4>
                <div className="flex items-center gap-4 text-sm text-primary-700">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(selectedSlot.start_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.round(
                      (new Date(selectedSlot.end_time).getTime() -
                        new Date(selectedSlot.start_time).getTime()) /
                        60000,
                    )}{" "}
                    minutes
                  </span>
                </div>
              </div>
            )}

            {/* Agenda */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to discuss? (optional)
              </label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="Share topics or questions you'd like to cover..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>

            {/* Meeting info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Video className="h-4 w-4" />
                <span>
                  A Google Meet link will be created and sent to both of you
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBook}
              disabled={!selectedSlot || isBooking}
              className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isBooking && <Loader2 className="h-4 w-4 animate-spin" />}
              {isBooking ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
