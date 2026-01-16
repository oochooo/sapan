"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { officeHoursApi } from "@/lib/api";
import BookingCard from "@/components/BookingCard";
import type { Booking } from "@/types";

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await officeHoursApi.getBookings();
      setBookings(response.results);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
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
      fetchBookings();
    }
  }, [authLoading, isAuthenticated, router]);

  const filteredBookings = bookings.filter((booking) => {
    const isPast = new Date(booking.start_time) < new Date();
    const isCancelled = booking.status.startsWith("cancelled");

    if (filter === "upcoming") {
      return !isPast && !isCancelled;
    }
    if (filter === "past") {
      return isPast || isCancelled;
    }
    return true;
  });

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Office Hours Bookings
              </h1>
              <p className="text-gray-500">
                Manage your scheduled sessions
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["upcoming", "past", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === f
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings list */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter === "all" ? "" : filter} bookings
            </h3>
            <p className="text-gray-500">
              {filter === "upcoming"
                ? "You don't have any upcoming office hours sessions."
                : filter === "past"
                  ? "You don't have any past office hours sessions."
                  : "You don't have any office hours sessions yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onUpdate={fetchBookings}
              />
            ))}
          </div>
        )}
    </div>
  );
}
