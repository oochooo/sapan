"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, Clock } from "lucide-react";
import { officeHoursApi } from "@/lib/api";
import type { TimeSlot } from "@/types";

interface TimeSlotPickerProps {
  mentorId: number;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}

export default function TimeSlotPicker({
  mentorId,
  onSelectSlot,
  selectedSlot,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate the start of the current week view
  const weekStart = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setDate(monday.getDate() + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [weekOffset]);

  // Generate dates for the week
  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [weekStart]);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const dateStr = weekStart.toISOString().split("T")[0];
        const result = await officeHoursApi.getMentorSlots(mentorId, {
          date: dateStr,
          days: 7,
        });
        setSlots(result.slots);
        if (result.message) {
          setError(result.message);
        }
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setError("Failed to load available times");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [mentorId, weekStart]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, TimeSlot[]> = {};

    weekDates.forEach((date) => {
      const dateKey = date.toISOString().split("T")[0];
      grouped[dateKey] = [];
    });

    slots.forEach((slot) => {
      const slotDate = new Date(slot.start_time);
      const dateKey = slotDate.toISOString().split("T")[0];
      if (grouped[dateKey]) {
        grouped[dateKey].push(slot);
      }
    });

    return grouped;
  }, [slots, weekDates]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedSlot?.start_time === slot.start_time;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Week navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          disabled={weekOffset === 0}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-medium text-gray-900">
          {weekDates[0].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          -{" "}
          {weekDates[6].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </h3>

        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          disabled={weekOffset >= 4}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : error && slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Clock className="h-12 w-12 mb-4 text-gray-300" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {weekDates.map((date) => {
            const dateKey = date.toISOString().split("T")[0];
            const daySlots = slotsByDate[dateKey] || [];
            const availableSlots = daySlots.filter((s) => s.is_available);
            const pastDate = isPastDate(date);

            return (
              <div key={dateKey} className="min-h-[300px]">
                {/* Day header */}
                <div
                  className={`p-2 text-center border-b border-gray-200 ${
                    isToday(date) ? "bg-primary-50" : "bg-gray-50"
                  }`}
                >
                  <p className="text-xs text-gray-500 uppercase">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isToday(date) ? "text-primary-600" : "text-gray-900"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                </div>

                {/* Time slots */}
                <div className="p-2 space-y-1 max-h-[250px] overflow-y-auto">
                  {pastDate ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Past date
                    </p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No slots
                    </p>
                  ) : (
                    availableSlots.map((slot) => (
                      <button
                        key={slot.start_time}
                        onClick={() => onSelectSlot(slot)}
                        className={`w-full px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                          isSlotSelected(slot)
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700"
                        }`}
                      >
                        {formatTime(slot.start_time)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
