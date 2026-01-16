"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { connectionApi, discoveryApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import { Card, CardContent, CardHeader } from "@/components/Card";
import MentorCard from "@/components/MentorCard";
import type { Connection, ConnectionRequest, MentorProfile } from "@/types";
import { Clock, Users, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>(
    [],
  );
  const [suggestedMentors, setSuggestedMentors] = useState<MentorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [connectionsData, requestsData] = await Promise.all([
          connectionApi.getConnections(),
          user?.user_type === "founder"
            ? connectionApi.getSentRequests()
            : connectionApi.getReceivedRequests(),
        ]);

        setConnections(connectionsData.results);
        setPendingRequests(
          requestsData.results.filter((r) => r.status === "pending"),
        );

        if (user?.user_type === "founder") {
          const mentorsData = await discoveryApi.getMentors({ page: 1 });
          setSuggestedMentors(mentorsData.results.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (!user?.is_approved && user?.user_type === "mentor") {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4">&#9203;</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Your Application is Pending
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for applying to be a mentor on Sapan.io! Our team is
              reviewing your application. You&apos;ll receive an email once
              approved.
            </p>
            <p className="text-sm text-gray-500">
              This usually takes 2-3 days.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Welcome back, {user?.first_name}!
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending Requests</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {pendingRequests.length}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/requests"
                    className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Requests <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Connections</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {connections.length}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/connections"
                    className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h2>
              </CardHeader>
              <CardContent>
                {connections.length === 0 && pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-4">
                    {connections.slice(0, 4).map((connection) => (
                      <div
                        key={connection.id}
                        className="flex items-center gap-3"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">
                            {connection.connected_user.first_name}{" "}
                            {connection.connected_user.last_name}
                          </span>{" "}
                          connected with you
                        </p>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(
                            connection.connected_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggested Mentors (for founders) */}
            {user?.user_type === "founder" && suggestedMentors.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Suggested Mentors for You
                    </h2>
                    <Link
                      href="/mentors"
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Browse All &rarr;
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {suggestedMentors.map((mentor) => (
                      <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
